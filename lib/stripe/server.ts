import Stripe from "stripe";

/** Client Stripe serveur, ou null si non configuré (évite de planter sans clé). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}
