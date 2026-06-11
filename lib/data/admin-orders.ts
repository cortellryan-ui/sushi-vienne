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
  paymentMethod: "sur_place" | "en_ligne";
  paymentStatus: string;
  notes: string | null;
  total: number;
  items: AdminOrderItem[];
};

const SELECT =
  "id, order_number, customer_name, customer_phone, pickup_time, created_at, status, payment_method, payment_status, notes, total, order_items ( product_name, quantity, unit_price )";

type Row = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  pickup_time: string;
  created_at: string;
  status: string;
  payment_method: string;
  payment_status: string;
  notes: string | null;
  total: number;
  order_items:
    | { product_name: string; quantity: number; unit_price: number }[]
    | null;
};

function mapRow(o: Row): AdminOrder {
  return {
    id: o.id,
    number: o.order_number,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    pickupTime: o.pickup_time,
    createdAt: o.created_at,
    status: o.status as OrderStatus,
    paymentMethod: o.payment_method as "sur_place" | "en_ligne",
    paymentStatus: o.payment_status,
    notes: o.notes,
    total: Number(o.total),
    items: (o.order_items ?? []).map((i) => ({
      name: i.product_name,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
    })),
  };
}

/** Commandes récentes pour le dashboard temps réel (récentes d'abord). */
export async function getAdminOrders(): Promise<AdminOrder[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Lecture commandes: ${error.message}`);
  return ((data ?? []) as unknown as Row[]).map(mapRow);
}

/** Historique large (toutes commandes, tous statuts) pour l'onglet Historique. */
export async function getOrdersHistory(): Promise<AdminOrder[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(`Lecture historique: ${error.message}`);
  return ((data ?? []) as unknown as Row[]).map(mapRow);
}
