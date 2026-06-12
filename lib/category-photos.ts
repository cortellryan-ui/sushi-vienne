/**
 * Photo représentative par slug de catégorie (utilisée pour les plats qui n'ont
 * pas encore leur propre image_url). Meilleures versions sans carte de visite,
 * choisies dans le shooting client.
 */
const CATEGORY_PHOTO: Record<string, string> = {
  sushis: "/photos/plats/plat-45.jpg",
  makis: "/photos/plats/plat-118.jpg",
  california: "/photos/plats/plat-109.jpg",
  "maki-light": "/photos/plats/plat-126.jpg",
  "snow-roll": "/photos/plats/plat-123.jpg",
  crispy: "/photos/plats/plat-82.jpg",
  salmon: "/photos/plats/plat-152.jpg",
  "egg-roll": "/photos/plats/plat-111.jpg",
  specialites: "/photos/plats/plat-60.jpg",
  chirashis: "/photos/plats/plat-130.jpg",
  sashimis: "/photos/plats/plat-187.jpg",
  tatakis: "/photos/plats/plat-187.jpg",
  tartares: "/photos/plats/plat-130.jpg",
  pokebowls: "/photos/plats/plat-133.jpg",
  temaki: "/photos/plats/plat-203.jpg",
  yakitoris: "/photos/plats/plat-38.jpg",
  nouilles: "/photos/plats/plat-193.jpg",
  entrees: "/photos/plats/plat-9.jpg",
  menus: "/photos/plats/plat-100.jpg",
  "menus-partager": "/photos/plats/plat-101.jpg",
  desserts: "/photos/plats/plat-206.jpg",
};

/** Photo de secours pour une catégorie (ou null → tuile avec le nom du plat). */
export function photoForCategory(slug: string): string | null {
  return CATEGORY_PHOTO[slug] ?? null;
}
