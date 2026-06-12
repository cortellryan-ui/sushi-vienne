import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { buildOrderLines, type DbProduct } from "@/lib/actions/orders-core";
import { persistOrder } from "@/lib/orders/persist";

export type ConfirmResult =
  | { ok: true; orderNumber: number; pickupTime: string }
  | { ok: false };

/**
 * Vérifie la session Stripe au retour du paiement et crée la commande
 * (idempotent) si le PaymentIntent est bien autorisé (`requires_capture`).
 */
export async function confirmOnlineOrder(
  sessionId: string,
): Promise<ConfirmResult> {
  const stripe = getStripe();
  if (!stripe) return { ok: false };

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items.data.price.product"],
    });
  } catch (e) {
    // session_id invalide ou expiré : Stripe lève une erreur. On échoue
    // proprement, la page /commande/confirmee gère déjà le cas ok:false.
    console.error("Échec de récupération de la session Stripe :", e);
    return { ok: false };
  }

  const pi = session.payment_intent;
  if (!pi || typeof pi === "string" || pi.status !== "requires_capture") {
    return { ok: false };
  }

  const admin = createAdminClient();

  // Idempotence : commande déjà créée pour ce PaymentIntent ? (refresh de page)
  const { data: existing } = await admin
    .from("orders")
    .select("order_number, pickup_time")
    .eq("stripe_payment_intent_id", pi.id)
    .maybeSingle();
  if (existing) {
    return {
      ok: true,
      orderNumber: existing.order_number,
      pickupTime: existing.pickup_time,
    };
  }

  // Reconstituer le panier depuis les line items (product_id en metadata).
  const items = (session.line_items?.data ?? [])
    .map((li) => {
      const product = li.price?.product;
      const pid =
        product && typeof product !== "string" && "metadata" in product
          ? (product.metadata?.product_id ?? null)
          : null;
      return pid ? { productId: pid, quantity: li.quantity ?? 1 } : null;
    })
    .filter((x): x is { productId: string; quantity: number } => x !== null);

  const { data: products } = await admin
    .from("products")
    .select("id, name, price, is_available")
    .in(
      "id",
      items.map((i) => i.productId),
    );

  const built = buildOrderLines((products ?? []) as DbProduct[], items);
  if (!built.ok) return { ok: false };

  const m = session.metadata ?? {};
  const pickupTime = m.pickupTime ?? new Date().toISOString();
  const result = await persistOrder(
    admin,
    {
      customerName: m.customerName ?? "Client",
      customerPhone: m.customerPhone ?? "",
      pickupTime,
      notes: m.notes ? m.notes : null,
    },
    built.lines,
    built.total,
    { method: "en_ligne", status: "autorise", intentId: pi.id },
  );
  if (!result) return { ok: false };

  return { ok: true, orderNumber: result.orderNumber, pickupTime };
}
