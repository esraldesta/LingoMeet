import type Stripe from "stripe";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { createBookingFromPayment } from "@/lib/services/bookingService";

// Handle Stripe webhook events in a central place.

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session
      );
      break;
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(
        event.data.object as Stripe.PaymentIntent
      );
      break;
    case "payment_intent.payment_failed":
    case "payment_intent.canceled":
      await handlePaymentIntentFailedOrCanceled(
        event.data.object as Stripe.PaymentIntent
      );
      break;
    default:
      // For now, ignore other event types.
      break;
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const paymentId = session.metadata?.paymentId;

  if (!paymentId) {
    console.warn(
      "[stripe-webhook] checkout.session.completed without paymentId metadata",
      session.id
    );
    return;
  }

  await prisma.payment.updateMany({
    where: { id: paymentId, status: "requires_payment" },
    data: {
      status: "processing",
      stripeCheckoutSessionId: session.id,
    },
  });
}

/** Safely get the transfer ID from a PaymentIntent's latest charge (event or retrieved). */
function getTransferIdFromPaymentIntent(pi: Stripe.PaymentIntent): string | undefined {
  const charge = pi.latest_charge;
  if (!charge || typeof charge === "string") return undefined;
  return typeof charge.transfer === "string" ? charge.transfer : undefined;
}

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  const paymentId = (pi.metadata as Record<string, string>)?.paymentId;

  if (!paymentId) {
    console.warn(
      "[stripe-webhook] payment_intent.succeeded without paymentId metadata",
      pi.id
    );
    return;
  }

  // Webhook payload often omits or limits charges; retrieve with expand for reliable transfer ID.
  let transferId = getTransferIdFromPaymentIntent(pi);
  if (transferId === undefined) {
    try {
      const expanded = await stripe.paymentIntents.retrieve(pi.id, {
        expand: ["latest_charge.transfer"],
      });
      transferId = getTransferIdFromPaymentIntent(expanded);
    } catch (err) {
      console.warn("[stripe-webhook] Could not expand PaymentIntent for transfer", pi.id, err);
    }
  }

  // Try a couple of times in case of serialization conflicts.
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$transaction(
        async (tx) => {
          const payment = await tx.payment.findUnique({
            where: { id: paymentId },
          });

          if (!payment) {
            console.warn(
              "[stripe-webhook] payment record not found for paymentId",
              paymentId
            );
            return;
          }

          // Idempotency: if already processed and linked to a booking, we're done.
          if (payment.status === "succeeded" && payment.bookingId) {
            return;
          }

          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "succeeded",
              stripePaymentIntentId: pi.id,
              stripeTransferId: transferId,
            },
          });

          await createBookingFromPayment(tx, payment.id);
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );

      break;
    } catch (err: any) {
      const isSerializationError =
        typeof err?.code === "string" &&
        (err.code === "P2034" || err.code === "40001");

      if (!isSerializationError || attempt === maxAttempts) {
        console.error(
          "[stripe-webhook] Failed to process payment_intent.succeeded",
          {
            attempt,
            error: err,
          }
        );
        break;
      }
    }
  }
}

async function handlePaymentIntentFailedOrCanceled(
  pi: Stripe.PaymentIntent
) {
  const paymentId = (pi.metadata as Record<string, string>)?.paymentId;

  if (!paymentId) {
    console.warn(
      "[stripe-webhook] payment_intent failure without paymentId metadata",
      pi.id
    );
    return;
  }

  await prisma.payment.updateMany({
    where: { id: paymentId },
    data: {
      status: "failed",
      metadata: {
        failureReason: pi.last_payment_error?.message ?? "payment_failed",
        ...(pi.metadata ?? {}),
      },
    },
  });
}

