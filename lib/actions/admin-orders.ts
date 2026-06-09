"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminOrders, type AdminOrder } from "@/lib/data/admin-orders";
import type { OrderStatus } from "@/lib/types";

const ALLOWED: OrderStatus[] = [
  "en_attente",
  "acceptee",
  "prete",
  "terminee",
  "declinee",
];

export type ActionResult = { ok: boolean };

/** Change le statut d'une commande (réservé à l'admin connecté via RLS). */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  if (!ALLOWED.includes(status)) return { ok: false };
  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  return { ok: !error };
}

/** Re-lecture des commandes (appelée par le dashboard après un événement Realtime). */
export async function refreshAdminOrders(): Promise<AdminOrder[]> {
  return getAdminOrders();
}
