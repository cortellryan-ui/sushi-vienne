import type { Category, Product } from "./types";

/**
 * Données fictives (maquette). À remplacer par un fetch Supabase
 * (`categories` + `products`) renvoyant la même forme. Les prix et libellés
 * sont indicatifs — le client gérera le vrai menu via l'admin.
 */

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-makis", name: "Makis", slug: "makis", displayOrder: 1, isActive: true },
  { id: "cat-california", name: "California", slug: "california", displayOrder: 2, isActive: true },
  { id: "cat-sushi", name: "Sushi", slug: "sushi", displayOrder: 3, isActive: true },
  { id: "cat-sashimi", name: "Sashimi", slug: "sashimi", displayOrder: 4, isActive: true },
  { id: "cat-plateaux", name: "Plateaux", slug: "plateaux", displayOrder: 5, isActive: true },
  { id: "cat-chauds", name: "Chauds", slug: "chauds", displayOrder: 6, isActive: true },
  { id: "cat-boissons", name: "Boissons", slug: "boissons", displayOrder: 7, isActive: true },
  { id: "cat-desserts", name: "Desserts", slug: "desserts", displayOrder: 8, isActive: true },
];

function p(
  id: string,
  categoryId: string,
  name: string,
  description: string,
  price: number,
  order: number,
  isAvailable = true,
): Product {
  return {
    id,
    categoryId,
    name,
    description,
    price,
    imageUrl: null, // placeholder tant que les vraies photos ne sont pas associées
    isAvailable,
    displayOrder: order,
  };
}

export const MOCK_PRODUCTS: Product[] = [
  // Makis (6 pièces)
  p("makis-saumon", "cat-makis", "Maki Saumon", "6 pièces · riz, saumon frais, nori", 4.9, 1),
  p("makis-thon", "cat-makis", "Maki Thon", "6 pièces · riz, thon, nori", 5.5, 2),
  p("makis-concombre", "cat-makis", "Maki Concombre", "6 pièces · riz, concombre, nori", 3.9, 3),
  p("makis-avocat", "cat-makis", "Maki Avocat", "6 pièces · riz, avocat, nori", 4.2, 4),
  p("makis-saumon-avocat", "cat-makis", "Maki Saumon Avocat", "6 pièces · saumon, avocat", 5.2, 5),

  // California
  p("cali-saumon-avocat", "cat-california", "California Saumon Avocat", "6 pièces · saumon, avocat, sésame", 5.9, 1),
  p("cali-thon-cuit", "cat-california", "California Thon Cuit", "6 pièces · thon cuit, mayo, ciboulette", 5.9, 2),
  p("cali-crevette-tempura", "cat-california", "California Crevette Tempura", "6 pièces · crevette croustillante, avocat", 6.5, 3),
  p("cali-vege", "cat-california", "California Végétarien", "6 pièces · avocat, concombre, mangue", 5.5, 4),

  // Sushi (2 pièces)
  p("sushi-saumon", "cat-sushi", "Sushi Saumon", "2 pièces · saumon frais sur riz vinaigré", 3.9, 1),
  p("sushi-thon", "cat-sushi", "Sushi Thon", "2 pièces · thon rouge sur riz vinaigré", 4.5, 2),
  p("sushi-daurade", "cat-sushi", "Sushi Daurade", "2 pièces · daurade sur riz vinaigré", 4.2, 3),
  p("sushi-crevette", "cat-sushi", "Sushi Crevette", "2 pièces · crevette sur riz vinaigré", 4.2, 4),

  // Sashimi
  p("sashimi-saumon", "cat-sashimi", "Sashimi Saumon", "9 tranches de saumon frais", 8.9, 1),
  p("sashimi-thon", "cat-sashimi", "Sashimi Thon", "9 tranches de thon rouge", 10.9, 2),
  p("sashimi-assortiment", "cat-sashimi", "Assortiment Sashimi", "saumon, thon, daurade — 15 tranches", 13.9, 3),

  // Plateaux
  p("plateau-decouverte", "cat-plateaux", "Plateau Découverte", "24 pièces · makis, california, sushi", 16.9, 1),
  p("plateau-saumon", "cat-plateaux", "Plateau Saumon Lover", "28 pièces · 100% saumon", 21.9, 2),
  p("plateau-mixte", "cat-plateaux", "Plateau Mixte", "36 pièces · l'assortiment complet", 27.9, 3),
  p("plateau-famille", "cat-plateaux", "Plateau Famille", "54 pièces · à partager", 39.9, 4),

  // Chauds
  p("yakitori-poulet", "cat-chauds", "Yakitori Poulet", "2 brochettes poulet, sauce teriyaki", 5.5, 1),
  p("gyoza", "cat-chauds", "Gyoza", "6 raviolis japonais poêlés", 5.9, 2),
  p("tempura-crevettes", "cat-chauds", "Tempura Crevettes", "5 crevettes en beignet croustillant", 7.5, 3),
  p("nems", "cat-chauds", "Nems Poulet", "4 nems croustillants, sauce nuoc-mâm", 5.2, 4, false),

  // Boissons
  p("coca", "cat-boissons", "Coca-Cola", "33 cl", 2.5, 1),
  p("eau", "cat-boissons", "Eau minérale", "50 cl", 1.8, 2),
  p("the-vert", "cat-boissons", "Thé vert glacé", "33 cl", 2.8, 3),
  p("ramune", "cat-boissons", "Ramune", "Limonade japonaise à la bille · 20 cl", 3.5, 4),

  // Desserts
  p("mochi", "cat-desserts", "Mochi (x2)", "Pâte de riz glacée · parfums variés", 4.5, 1),
  p("perle-coco", "cat-desserts", "Perles de Coco", "3 pièces · pâte de riz, noix de coco", 3.9, 2),
  p("salade-fruits", "cat-desserts", "Salade de fruits frais", "mangue, litchi, ananas", 4.2, 3),
];

/** Regroupe les produits disponibles par catégorie active, triés. */
export function getMockMenu() {
  return MOCK_CATEGORIES.filter((c) => c.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((category) => ({
      category,
      products: MOCK_PRODUCTS.filter((p) => p.categoryId === category.id).sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    }));
}
