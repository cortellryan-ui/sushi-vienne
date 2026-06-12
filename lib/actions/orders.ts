"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { persistOrder } from "@/lib/orders/persist";
import { getOpeningHours } from "@/lib/data/opening-hours";
import { isValidPickupTime } from "@/lib/pickup-slots";
import { CreateOrderSchema, buildOrderLines, type DbProduct } from "./orders-core";

export type CreateOrderResult =
  | { ok: true; orderNumber: number }
  | { ok: false; error: "invalid" | "unavailable" | "slot" | "db" };

/**
 * Enregistre une commande "payée sur place" (status 'en_attente').
 * Recalcule prix + total côté serveur depuis la base. Client service_role
 * car la RLS interdit la lecture publique de `orders`.
 */
export async function createOrder(raw: unknown): Promise<CreateOrderResult> {
  const parsed = CreateOrderSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const input = parsed.data;

  // Le créneau choisi doit être valide (ouverture + pas dans le passé) côté serveur.
  const hours = await getOpeningHours();
  if (!isValidPickupTime(input.pickupTime, { slots: hours })) {
    return { ok: false, error: "slot" };
  }

  const supabase = createAdminClient();

  // Produits authentiques + lignes/total recalculés en base
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, price, is_available")
    .in(
      "id",
      input.items.map((i) => i.productId),
    );
  if (prodErr) return { ok: false, error: "db" };

  const built = buildOrderLines((products ?? []) as DbProduct[], input.items);
  if (!built.ok) return { ok: false, error: "unavailable" };

  const result = await persistOrder(
    supabase,
    {
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      pickupTime: input.pickupTime,
      notes: input.notes ?? null,
    },
    built.lines,
    built.total,
    { method: "sur_place", status: "non_paye" },
  );
  if (!result) return { ok: false, error: "db" };

  return { ok: true, orderNumber: result.orderNumber };
}
