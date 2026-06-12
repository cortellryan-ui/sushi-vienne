/**
 * Photo représentative par slug de catégorie (placeholder cohérent tant que
 * le client n'a pas associé une vraie photo à chaque plat).
 * Choix volontairement adéquats par type de plat.
 */
const CATEGORY_PHOTO: Record<string, string> = {
  sushis: "/photos/plats/plat-45.jpg",
  makis: "/photos/plats/plat-60.jpg",
  california: "/photos/plats/plat-84.jpg",
  "maki-light": "/photos/plats/plat-150.jpg",
  "snow-roll": "/photos/plats/plat-205.jpg",
  crispy: "/photos/plats/plat-157.jpg",
  salmon: "/photos/plats/plat-110.jpg",
  "egg-roll": "/photos/plats/plat-150.jpg",
  specialites: "/photos/plats/plat-99.jpg",
  chirashis: "/photos/plats/plat-130.jpg",
  sashimis: "/photos/plats/plat-187.jpg",
  tatakis: "/photos/plats/plat-187.jpg",
  tartares: "/photos/plats/plat-130.jpg",
  pokebowls: "/photos/plats/plat-130.jpg",
  temaki: "/photos/plats/plat-190.jpg",
  entrees: "/photos/plats/plat-17.jpg",
  menus: "/photos/plats/plat-100.jpg",
  "menus-partager": "/photos/plats/plat-99.jpg",
};

/** Photo de secours pour une catégorie (ou null → tuile avec le nom du plat). */
export function photoForCategory(slug: string): string | null {
  return CATEGORY_PHOTO[slug] ?? null;
}
