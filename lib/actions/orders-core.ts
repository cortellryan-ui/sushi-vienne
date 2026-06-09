import { z } from "zod";

/** Une ligne du panier envoyée par le client (on ne fait PAS confiance au prix client). */
export const CartLineSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});

/** Données du checkout validées. */
export const CreateOrderSchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  customerPhone: z.string().trim().min(6).max(30),
  pickupTime: z.string().datetime(), // ISO (créneau choisi)
  notes: z.string().trim().max(500).optional().nullable(),
  items: z.array(CartLineSchema).min(1).max(100),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

/** Produit authentique tel que lu en base (prix de référence). */
export type DbProduct = {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
};

/** Ligne de commande prête à insérer (snapshot nom + prix figés). */
export type OrderLine = {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
};

export type BuildResult =
  | { ok: true; lines: OrderLine[]; total: number }
  | { ok: false; error: "unavailable" | "empty" };

/**
 * Construit les lignes de commande à partir des produits AUTHENTIQUES (base) et
 * des quantités demandées. Le prix et le nom viennent de la base (snapshot),
 * jamais du client. Rejette si un produit est introuvable ou indisponible.
 */
export function buildOrderLines(
  products: DbProduct[],
  items: { productId: string; quantity: number }[],
): BuildResult {
  if (items.length === 0) return { ok: false, error: "empty" };

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: OrderLine[] = [];
  let totalCents = 0;

  for (const item of items) {
    const p = byId.get(item.productId);
    if (!p || !p.is_available) return { ok: false, error: "unavailable" };
    const unit = Number(p.price);
    totalCents += Math.round(unit * 100) * item.quantity;
    lines.push({
      product_id: p.id,
      product_name: p.name,
      unit_price: unit,
      quantity: item.quantity,
    });
  }

  return { ok: true, lines, total: totalCents / 100 };
}
