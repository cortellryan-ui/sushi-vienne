import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/types";

export type MenuSection = { category: Category; products: Product[] };

/**
 * Menu public depuis Supabase : catégories actives triées, avec leurs plats triés.
 * Renvoie la même forme que l'ancien getMockMenu() pour un branchement transparent.
 */
export async function getMenu(): Promise<MenuSection[]> {
  const supabase = createClient();

  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("id, name, slug, display_order, is_active")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (catErr) throw new Error(`Lecture catégories: ${catErr.message}`);

  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select(
      "id, category_id, name, description, price, image_url, is_available, display_order, allergens",
    )
    .order("display_order", { ascending: true });
  if (prodErr) throw new Error(`Lecture plats: ${prodErr.message}`);

  return (categories ?? []).map((c) => ({
    category: {
      id: c.id,
      name: c.name,
      slug: c.slug,
      displayOrder: c.display_order,
      isActive: c.is_active,
    } satisfies Category,
    products: (products ?? [])
      .filter((p) => p.category_id === c.id)
      .map(
        (p): Product => ({
          id: p.id,
          categoryId: p.category_id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          imageUrl: p.image_url,
          isAvailable: p.is_available,
          displayOrder: p.display_order,
          allergens: p.allergens ?? undefined,
        }),
      ),
  }));
}
