import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";
import { BookingStatus, Currency, Prisma, type Professional, type User } from "@/generated/prisma/client";

// Central place for Stripe-related configuration and helpers
const STRIPE_CONNECT_ACCOUNT_TYPE = "express" as const;

// Platform fee settings (percentage based, adjustable in one place)
const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? "15"); // e.g. 15%

export function calculatePlatformFee(amountInCents: number): number {
  // Simple percentage-based fee; rounded to nearest cent
  const fee = Math.round((amountInCents * PLATFORM_FEE_PERCENT) / 100);
  return fee;
}

export function isProfessionalBookable(pro: Professional): boolean {
  return (
    pro.isVerified &&
    !!pro.stripeAccountId &&
    pro.stripeChargesEnabled &&
    pro.stripePayoutsEnabled
  );
}

export async function ensureConnectAccountForProfessional(
  professional: Professional & { user: User }
): Promise<Professional> {
  if (professional.stripeAccountId) {
    // Optionally refresh capabilities later via separate call
    return professional;
  }

  const account = await stripe.accounts.create({
    type: STRIPE_CONNECT_ACCOUNT_TYPE,
    email: professional.user.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    metadata: {
      professionalId: professional.id,
      userId: professional.userId,
    },
  });

  const chargesEnabled = account.charges_enabled ?? false;
  const payoutsEnabled = account.payouts_enabled ?? false;

  const updated = await prisma.professional.update({
    where: { id: professional.id },
    data: {
      stripeAccountId: account.id,
      stripeChargesEnabled: chargesEnabled,
      stripePayoutsEnabled: payoutsEnabled,
    },
  });

  return updated;
}

export async function createConnectOnboardingLink(params: {
  professionalId: string;
  refreshUrl: string;
  returnUrl: string;
}) {
  const professional = await prisma.professional.findUnique({
    where: { id: params.professionalId },
    include: { user: true },
  });

  if (!professional) {
    throw new Error("Professional not found");
  }

  const ensured = await ensureConnectAccountForProfessional(professional);

  if (!ensured.stripeAccountId) {
    throw new Error("Failed to create Stripe Connect account");
  }

  const accountLink = await stripe.accountLinks.create({
    account: ensured.stripeAccountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: "account_onboarding",
  });

  return {
    url: accountLink.url,
  };
}

export async function refreshConnectAccountCapabilities(professionalId: string) {
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
  });

  if (!professional || !professional.stripeAccountId) {
    throw new Error("Professional or connected account not found");
  }

  const account = await stripe.accounts.retrieve(professional.stripeAccountId);

  const chargesEnabled = account.charges_enabled ?? false;
  const payoutsEnabled = account.payouts_enabled ?? false;

  const updated = await prisma.professional.update({
    where: { id: professional.id },
    data: {
      stripeChargesEnabled: chargesEnabled,
      stripePayoutsEnabled: payoutsEnabled,
    },
  });

  return updated;
}

export interface CreateCheckoutForBookingParams {
  learnerId: string;
  professionalId: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  amount: number; // in major units, e.g. dollars
  currency: Currency;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSessionForBooking(
  params: CreateCheckoutForBookingParams
) {
  let professional = await prisma.professional.findUnique({
    where: { id: params.professionalId },
  });

  if (!professional) {
    throw new Error("Professional not found");
  }

  if (!professional.stripeAccountId) {
    throw new Error("Professional is missing Stripe account id");
  }

  // Always refresh from Stripe so we react quickly if a teacher
  // loses charges/payouts capability.
  professional = await refreshConnectAccountCapabilities(professional.id);

  if (!isProfessionalBookable(professional)) {
    throw new Error("Professional is not bookable (Stripe not ready)");
  }

  const amountInCents = Math.round(params.amount * 100);
  const applicationFeeAmount = calculatePlatformFee(amountInCents);

  // Idempotency key is based on user + professional + slot
  const idempotencyKey = [
    params.learnerId,
    params.professionalId,
    params.startTime.toISOString(),
    params.endTime.toISOString(),
  ].join("|");

  // Use a SERIALIZABLE transaction to safely "lock" the slot
  // and prevent double-booking the same time range.
  const slotLockMaxAgeMinutes = Number(
    process.env.SLOT_LOCK_MAX_AGE_MINUTES ?? "30"
  );
  const lockCutoff = new Date(
    Date.now() - slotLockMaxAgeMinutes * 60 * 1000
  );

  const payment = await prisma.$transaction(
    async (tx) => {
      // Check for overlapping confirmed bookings
      const overlappingBooking = await tx.booking.findFirst({
        where: {
          professionalId: params.professionalId,
          status: { not: BookingStatus.CANCELED },
          startTime: { lt: params.endTime },
          endTime: { gt: params.startTime },
        },
      });

      if (overlappingBooking) {
        throw new Error("Time slot is no longer available");
      }

      // Check for overlapping active payments (pending or succeeded)
      const overlappingPayment = await tx.payment.findFirst({
        where: {
          professionalId: params.professionalId,
          status: {
            in: ["requires_payment", "processing", "succeeded"],
          },
          startTime: { lt: params.endTime },
          endTime: { gt: params.startTime },
          createdAt: {
            gte: lockCutoff,
          },
        },
      });

      if (overlappingPayment) {
        throw new Error("Time slot is locked by another payment");
      }

      // Reuse existing payment if the same idempotency key already exists
      const existing = await tx.payment.findUnique({
        where: { idempotencyKey },
      });

      if (existing) {
        return existing;
      }

      return tx.payment.create({
        data: {
          learnerId: params.learnerId,
          professionalId: params.professionalId,
          startTime: params.startTime,
          endTime: params.endTime,
          durationMinutes: params.durationMinutes,
          amount: params.amount,
          currency: params.currency,
          status: "requires_payment",
          applicationFeeAmount,
          idempotencyKey,
        },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: params.currency.toLowerCase(),
            unit_amount: amountInCents,
            product_data: {
              name: "LingoMeet Session",
              description: `Session with professional ${params.professionalId}`,
            },
          },
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: professional.stripeAccountId as string,
        },
        application_fee_amount: applicationFeeAmount,
        metadata: {
          paymentId: payment.id,
          learnerId: params.learnerId,
          professionalId: params.professionalId,
          startTime: params.startTime.toISOString(),
          endTime: params.endTime.toISOString(),
        },
      },
      metadata: {
        paymentId: payment.id,
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    },
    {
      idempotencyKey: `checkout_${payment.id}`,
    }
  );

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: session.payment_intent
        ? typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent.id
        : null,
      status: "processing",
    },
  });

  return {
    checkoutUrl: session.url!,
    sessionId: session.id,
  };
}

