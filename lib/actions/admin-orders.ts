"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { transitionOrder } from "@/lib/orders/transition";
import { getAdminOrders, type AdminOrder } from "@/lib/data/admin-orders";
import type { OrderStatus } from "@/lib/types";

export type ActionResult = { ok: boolean };

/**
 * Change le statut d'une commande. Réservé à l'admin connecté.
 * Accepter/Décliner passent par transitionOrder (capture/annule le paiement
 * Stripe le cas échéant) ; Prête/Terminée sont de simples mises à jour.
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  if (!(await getCurrentUser())) return { ok: false };

  if (status === "acceptee" || status === "declinee") {
    const r = await transitionOrder(id, status);
    return { ok: r.ok };
  }

  if (status === "prete" || status === "terminee") {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    return { ok: !error };
  }

  return { ok: false };
}

/** Re-lecture des commandes (appelée par le dashboard après un événement Realtime). */
export async function refreshAdminOrders(): Promise<AdminOrder[]> {
  return getAdminOrders();
}
