import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

export type AdminOrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type AdminOrder = {
  id: string;
  number: number;
  customerName: string;
  customerPhone: string;
  pickupTime: string; // ISO
  createdAt: string; // ISO
  status: OrderStatus;
  notes: string | null;
  total: number;
  items: AdminOrderItem[];
};

/** Toutes les commandes (récentes d'abord) avec leurs lignes — pour le dashboard. */
export async function getAdminOrders(): Promise<AdminOrder[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, pickup_time, created_at, status, notes, total, order_items ( product_name, quantity, unit_price )",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Lecture commandes: ${error.message}`);

  return (data ?? []).map((o) => ({
    id: o.id,
    number: o.order_number,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    pickupTime: o.pickup_time,
    createdAt: o.created_at,
    status: o.status as OrderStatus,
    notes: o.notes,
    total: Number(o.total),
    items: (o.order_items ?? []).map(
      (i: { product_name: string; quantity: number; unit_price: number }) => ({
        name: i.product_name,
        quantity: i.quantity,
        unitPrice: Number(i.unit_price),
      }),
    ),
  }));
}
