"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { getOpeningHours } from "@/lib/data/opening-hours";
import { isValidPickupTime } from "@/lib/pickup-slots";
import {
  CreateOrderSchema,
  buildOrderLines,
  type DbProduct,
} from "./orders-core";

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: "invalid" | "unavailable" | "slot" | "stripe" };

/**
 * Crée une session Stripe Checkout (capture manuelle = autorisation) et renvoie
 * son URL. La commande n'est PAS encore créée : elle le sera au retour, une fois
 * le paiement autorisé (voir lib/stripe/confirm.ts) — évite les commandes fantômes.
 */
export async function createOnlineCheckout(
  raw: unknown,
): Promise<CheckoutResult> {
  const parsed = CreateOrderSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const input = parsed.data;

  // Le créneau choisi doit être valide (ouverture + pas dans le passé) côté serveur.
  const hours = await getOpeningHours();
  if (!isValidPickupTime(input.pickupTime, { slots: hours })) {
    return { ok: false, error: "slot" };
  }

  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "stripe" };

  const admin = createAdminClient();
  const { data: products } = await admin
    .from("products")
    .select("id, name, price, is_available")
    .in(
      "id",
      input.items.map((i) => i.productId),
    );

  const built = buildOrderLines((products ?? []) as DbProduct[], input.items);
  if (!built.ok) return { ok: false, error: "unavailable" };

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_intent_data: { capture_method: "manual" },
      line_items: built.lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(l.unit_price * 100),
          product_data: {
            name: l.product_name,
            metadata: { product_id: l.product_id },
          },
        },
      })),
      metadata: {
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        pickupTime: input.pickupTime,
        notes: input.notes ?? "",
      },
      success_url: `${base}/commande/confirmee?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/menu?paiement=annule`,
    });

    if (!session.url) return { ok: false, error: "stripe" };
    return { ok: true, url: session.url };
  } catch (e) {
    // Échec de l'appel Stripe (réseau, clé invalide, etc.) : on renvoie le
    // même type d'échec « stripe » plutôt que de laisser remonter l'erreur.
    console.error("Échec de création de la session Stripe Checkout :", e);
    return { ok: false, error: "stripe" };
  }
}
