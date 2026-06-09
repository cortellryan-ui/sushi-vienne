import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";

export type TransitionResult =
  | { ok: true; orderNumber: number }
  | { ok: false; reason: "not_found" | "already" | "error" };

/**
 * Accepte (capture) ou décline (annule) une commande. Gère le paiement Stripe
 * si la commande est en ligne et autorisée. Source unique utilisée par la
 * tablette (Server Action admin) ET les liens email tokenisés.
 */
export async function transitionOrder(
  id: string,
  target: "acceptee" | "declinee",
): Promise<TransitionResult> {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(
      "id, order_number, status, payment_method, payment_status, stripe_payment_intent_id",
    )
    .eq("id", id)
    .single();
  if (!order) return { ok: false, reason: "not_found" };
  if (order.status !== "en_attente") return { ok: false, reason: "already" };

  let paymentStatus: string = order.payment_status;

  // Paiement en ligne autorisé : capturer (accept) ou annuler (decline).
  if (
    order.payment_method === "en_ligne" &&
    order.stripe_payment_intent_id &&
    order.payment_status === "autorise"
  ) {
    const stripe = getStripe();
    if (!stripe) return { ok: false, reason: "error" };
    try {
      if (target === "acceptee") {
        await stripe.paymentIntents.capture(order.stripe_payment_intent_id);
        paymentStatus = "paye";
      } else {
        await stripe.paymentIntents.cancel(order.stripe_payment_intent_id);
        paymentStatus = "annule";
      }
    } catch {
      return { ok: false, reason: "error" };
    }
  }

  const { error } = await admin
    .from("orders")
    .update({ status: target, payment_status: paymentStatus })
    .eq("id", id);
  if (error) return { ok: false, reason: "error" };

  return { ok: true, orderNumber: order.order_number };
}
