import type { SupabaseClient } from "@supabase/supabase-js";
import { sendOrderNotification } from "@/lib/email/order-notification";
import type { OrderLine } from "@/lib/actions/orders-core";

export type PaymentInfo = {
  method: "sur_place" | "en_ligne";
  status: "non_paye" | "autorise";
  intentId?: string | null;
};

export type PersistInput = {
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  notes: string | null;
};

/**
 * Insère commande + lignes (snapshot), puis déclenche l'email resto (best-effort).
 * Utilisé par la commande sur place ET la confirmation de paiement en ligne.
 * Renvoie l'id + numéro, ou null en cas d'échec d'insertion.
 */
export async function persistOrder(
  admin: SupabaseClient,
  input: PersistInput,
  lines: OrderLine[],
  total: number,
  payment: PaymentInfo,
): Promise<{ id: string; orderNumber: number } | null> {
  const { data: order, error } = await admin
    .from("orders")
    .insert({
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      pickup_time: input.pickupTime,
      total,
      notes: input.notes,
      payment_method: payment.method,
      payment_status: payment.status,
      stripe_payment_intent_id: payment.intentId ?? null,
    })
    .select("id, order_number, validation_token")
    .single();
  if (error || !order) return null;

  const { error: itemsErr } = await admin
    .from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (itemsErr) return null;

  await sendOrderNotification({
    id: order.id,
    orderNumber: order.order_number,
    validationToken: order.validation_token,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    pickupTime: input.pickupTime,
    notes: input.notes,
    total,
    items: lines.map((l) => ({
      name: l.product_name,
      quantity: l.quantity,
      unitPrice: l.unit_price,
    })),
  });

  return { id: order.id, orderNumber: order.order_number };
}
