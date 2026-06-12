/**
 * Photo représentative par slug de catégorie (placeholder cohérent tant que
 * le client n'a pas associé une vraie photo à chaque plat).
 * Choix volontairement adéquats : un maki pour Makis, du sashimi pour Sashimi, etc.
 */
const CATEGORY_PHOTO: Record<string, string> = {
  makis: "/photos/plats/plat-60.jpg",
  california: "/photos/plats/plat-84.jpg",
  sushi: "/photos/plats/plat-45.jpg",
  sashimi: "/photos/plats/plat-187.jpg",
  plateaux: "/photos/plats/plat-100.jpg",
  chauds: "/photos/plats/plat-17.jpg",
};

/** Photo de secours pour une catégorie (ou null → on retombe sur l'emoji). */
export function photoForCategory(slug: string): string | null {
  return CATEGORY_PHOTO[slug] ?? null;
}
