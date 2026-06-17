"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";

export type MenuActionResult = { ok: boolean; error?: string };

/** Revalide les pages impactées par un changement de menu. */
function revalidateMenu() {
  revalidatePath("/menu");
  revalidatePath("/admin/menu");
  revalidatePath("/");
}

/** Slug simple à partir d'un nom (catégories). */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

// ----------------------------------------------------------------------------
// Catégories
// ----------------------------------------------------------------------------

const CategoryNameSchema = z.string().trim().min(1).max(60);

export async function createCategory(name: string): Promise<MenuActionResult> {
  if (!(await getCurrentUser())) return { ok: false, error: "auth" };
  const parsed = CategoryNameSchema.safeParse(name);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const supabase = createClient();
  // Place la nouvelle catégorie en fin de liste.
  const { data: last } = await supabase
    .from("categories")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (last?.display_order ?? 0) + 1;

  // Slug unique (suffixe si collision).
  const base = slugify(parsed.data) || "categorie";
  let slug = base;
  for (let i = 2; i < 50; i++) {
    const { data: clash } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${base}-${i}`;
  }

  const { error } = await supabase
    .from("categories")
    .insert({ name: parsed.data, slug, display_order: nextOrder });
  if (error) return { ok: false, error: error.message };
  revalidateMenu();
  return { ok: true };
}

export async function renameCategory(
  id: string,
  name: string,
): Promise<MenuActionResult> {
  if (!(await getCurrentUser())) return { ok: false, error: "auth" };
  const parsed = CategoryNameSchema.safeParse(name);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const supabase = createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name: parsed.data })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateMenu();
  return { ok: true };
}

export async function toggleCategoryActive(
  id: string,
  isActive: boolean,
): Promise<MenuActionResult> {
  if (!(await getCurrentUser())) return { ok: false, error: "auth" };
  const supabase = createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateMenu();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<MenuActionResult> {
  if (!(await getCurrentUser())) return { ok: false, error: "auth" };
  const supabase = createClient();
  // Les produits liés sont supprimés en cascade (FK on delete cascade).
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateMenu();
  return { ok: true };
}

// ----------------------------------------------------------------------------
// Plats
// ----------------------------------------------------------------------------

const ProductSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  price: z.number().nonnegative().max(9999),
});

export async function createProduct(input: {
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
}): Promise<MenuActionResult> {
  if (!(await getCurrentUser())) return { ok: false, error: "auth" };
  const parsed = ProductSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const supabase = createClient();
  const { data: last } = await supabase
    .from("products")
    .select("display_order")
    .eq("category_id", parsed.data.categoryId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (last?.display_order ?? 0) + 1;

  const { error } = await supabase.from("products").insert({
    category_id: parsed.data.categoryId,
    name: parsed.data.name,
    description: parsed.data.description || null,
    price: parsed.data.price,
    display_order: nextOrder,
  });
  if (error) return { ok: false, error: error.message };
  revalidateMenu();
  return { ok: true };
}

export async function updateProduct(
  id: string,
  input: {
    name: string;
    description?: string | null;
    price: number;
  },
): Promise<MenuActionResult> {
  if (!(await getCurrentUser())) return { ok: false, error: "auth" };
  const parsed = ProductSchema.omit({ categoryId: true }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateMenu();
  return { ok: true };
}

export async function toggleProductAvailable(
  id: string,
  isAvailable: boolean,
): Promise<MenuActionResult> {
  if (!(await getCurrentUser())) return { ok: false, error: "auth" };
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_available: isAvailable })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateMenu();
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<MenuActionResult> {
  if (!(await getCurrentUser())) return { ok: false, error: "auth" };
  const supabase = createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateMenu();
  return { ok: true };
}

/**
 * Upload d'une photo de plat vers le bucket Storage `products` puis mise à jour
 * de `image_url`. Reçoit un FormData (champ `file` + `productId`).
 */
export async function uploadProductImage(
  formData: FormData,
): Promise<MenuActionResult> {
  if (!(await getCurrentUser())) return { ok: false, error: "auth" };
  const productId = formData.get("productId");
  const file = formData.get("file");
  if (typeof productId !== "string" || !(file instanceof File)) {
    return { ok: false, error: "invalid" };
  }
  if (file.size === 0 || file.size > 5_242_880) {
    return { ok: false, error: "Fichier vide ou trop volumineux (max 5 Mo)." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${productId}/${Date.now()}.${ext}`;
  // service_role : l'action est déjà protégée par getCurrentUser().
  const admin = createAdminClient();
  const { error: upErr } = await admin.storage
    .from("products")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) return { ok: false, error: upErr.message };

  const { data: pub } = admin.storage.from("products").getPublicUrl(path);
  const { error } = await admin
    .from("products")
    .update({ image_url: pub.publicUrl })
    .eq("id", productId);
  if (error) return { ok: false, error: error.message };
  revalidateMenu();
  return { ok: true };
}

// ----------------------------------------------------------------------------
// Réordonnancement (échange de display_order avec le voisin)
// ----------------------------------------------------------------------------

export async function moveProduct(
  id: string,
  direction: "up" | "down",
): Promise<MenuActionResult> {
  if (!(await getCurrentUser())) return { ok: false, error: "auth" };
  const supabase = createClient();

  const { data: current } = await supabase
    .from("products")
    .select("id, category_id, display_order")
    .eq("id", id)
    .single();
  if (!current) return { ok: false, error: "introuvable" };

  // Voisin immédiat dans la même catégorie, dans la direction choisie.
  const query = supabase
    .from("products")
    .select("id, display_order")
    .eq("category_id", current.category_id);
  const { data: neighbor } =
    direction === "up"
      ? await query
          .lt("display_order", current.display_order)
          .order("display_order", { ascending: false })
          .limit(1)
          .maybeSingle()
      : await query
          .gt("display_order", current.display_order)
          .order("display_order", { ascending: true })
          .limit(1)
          .maybeSingle();
  if (!neighbor) return { ok: true }; // déjà en bout de liste

  // Échange des ordres.
  await supabase
    .from("products")
    .update({ display_order: neighbor.display_order })
    .eq("id", current.id);
  await supabase
    .from("products")
    .update({ display_order: current.display_order })
    .eq("id", neighbor.id);
  revalidateMenu();
  return { ok: true };
}
