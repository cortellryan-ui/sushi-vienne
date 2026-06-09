/** Emoji d'illustration par slug de catégorie (placeholder tant qu'il n'y a pas de photo). */
export const CATEGORY_EMOJI: Record<string, string> = {
  makis: "🍙",
  california: "🍣",
  sushi: "🍣",
  sashimi: "🐟",
  plateaux: "🍱",
  chauds: "🍜",
  boissons: "🥤",
  desserts: "🍡",
};

/** Emoji pour un slug donné, avec secours générique. */
export function emojiForCategory(slug: string): string {
  return CATEGORY_EMOJI[slug] ?? "🍣";
}
