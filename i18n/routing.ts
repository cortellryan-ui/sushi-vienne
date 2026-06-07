import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // Le français (défaut) n'a pas de préfixe ; l'anglais est sous /en.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
