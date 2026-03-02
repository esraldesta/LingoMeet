import { NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { handleStripeWebhookEvent } from "@/lib/services/stripeWebhookService";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  // Fail fast in development; in production this should always be set.
  console.warn(
    "[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set. Webhook endpoint will reject requests."
  );
}

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    return new Response("Webhook not configured", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("[stripe-webhook] Signature verification failed", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    await handleStripeWebhookEvent(event);
  } catch (err) {
    // Log but still return 200 so Stripe can stop retrying once the
    // handler has applied its idempotent logic.
    console.error("[stripe-webhook] Error handling event", {
      type: event.type,
      id: event.id,
      error: err,
    });
  }

  return new Response("OK", { status: 200 });
}

