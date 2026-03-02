import Stripe from "stripe";

// Server-side Stripe client singleton. Initialized lazily so the build can
// complete when STRIPE_SECRET_KEY is not set (e.g. CI). Throws at runtime
// when stripe is first used if the key is missing.
// This file must NEVER be imported from a client component.

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _stripe = new Stripe(key, {
    apiVersion: "2026-01-28.clover", // Use a pinned API version for safety
  });
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string];
  },
});

export type StripeClient = Stripe;

