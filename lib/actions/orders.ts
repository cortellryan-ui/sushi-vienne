"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { sendOrderNotification } from "@/lib/email/order-notification";
import {
  CreateOrderSchema,
  buildOrderLines,
  type DbProduct,
} from "./orders-core";

export type CreateOrderResult =
  | { ok: true; orderNumber: number }
  | { ok: false; error: "invalid" | "unavailable" | "db" };

/**
 * Enregistre une commande (status 'en_attente', paiement sur place par défaut).
 * Recalcule prix + total côté serveur depuis la base. Utilise le client
 * service_role car la RLS interdit la lecture publique de `orders`.
 */
export async function createOrder(raw: unknown): Promise<CreateOrderResult> {
  const parsed = CreateOrderSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const input = parsed.data;

  const supabase = createAdminClient();

  // 1. Produits authentiques
  const ids = input.items.map((i) => i.productId);
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, price, is_available")
    .in("id", ids);
  if (prodErr) return { ok: false, error: "db" };

  // 2. Lignes + total (depuis la base)
  const built = buildOrderLines((products ?? []) as DbProduct[], input.items);
  if (!built.ok) return { ok: false, error: "unavailable" };

  // 3. Insertion de la commande
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      pickup_time: input.pickupTime,
      total: built.total,
      notes: input.notes ?? null,
      // payment_method = 'sur_place', payment_status = 'non_paye' (défauts SQL)
    })
    .select("id, order_number, validation_token")
    .single();
  if (orderErr || !order) return { ok: false, error: "db" };

  // 4. Insertion des lignes
  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(built.lines.map((l) => ({ ...l, order_id: order.id })));
  if (itemsErr) return { ok: false, error: "db" };

  // 5. Notification email au resto (best-effort : n'échoue pas la commande).
  await sendOrderNotification({
    id: order.id,
    orderNumber: order.order_number,
    validationToken: order.validation_token,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    pickupTime: input.pickupTime,
    notes: input.notes ?? null,
    total: built.total,
    items: built.lines.map((l) => ({
      name: l.product_name,
      quantity: l.quantity,
      unitPrice: l.unit_price,
    })),
  });

  return { ok: true, orderNumber: order.order_number };
}
