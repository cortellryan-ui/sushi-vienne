import type { Product } from "./types";

// Ingrédients qui EXCLUENT le veggie (poisson / viande / fruits de mer).
const NON_VEG = [
  "saumon",
  "thon",
  "daurade",
  "crevette",
  "gambas",
  "poisson",
  "anguille",
  "surimi",
  "sashimi",
  "tempura",
  "poulet",
  "boeuf",
  "bœuf",
  "porc",
  "canard",
  "viande",
  "yakitori",
  "gyoza",
  "nem",
];

// Indicateurs végétariens (au moins un requis pour éviter les faux positifs
// sur les plateaux/assortiments qui ne listent pas leurs poissons).
const VEG = [
  "concombre",
  "avocat",
  "végétarien",
  "vegetarien",
  "veggie",
  "mangue",
  "tofu",
  "edamame",
  "fromage",
  "cream cheese",
  "légume",
  "legume",
];

/**
 * Vrai si le plat ne contient ni poisson ni viande (→ badge « Veggie »).
 * Heuristique sur nom + description : un indicateur veggie présent ET aucun
 * ingrédient carné/poisson. Volontairement prudent (pas de faux positif sur
 * les plateaux). Sera remplacé par un champ `is_vegetarian` si le client le gère.
 */
export function isVegetarian(product: Product): boolean {
  const text = `${product.name} ${product.description ?? ""}`.toLowerCase();
  const hasNonVeg = NON_VEG.some((k) => text.includes(k));
  const hasVeg = VEG.some((k) => text.includes(k));
  return hasVeg && !hasNonVeg;
}
