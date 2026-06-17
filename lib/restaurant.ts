/**
 * Informations de référence du restaurant Sushi Smile.
 * Coordonnées issues du CLAUDE.md (source de vérité).
 */
export const RESTAURANT = {
  name: "Sushi Smile",
  address: {
    street: "4 rue du 11 Novembre",
    zip: "38200",
    city: "Vienne",
    full: "4 rue du 11 Novembre, 38200 Vienne",
  },
  phone: {
    display: "04 26 05 79 62",
    tel: "+33426057962",
  },
  uberEatsUrl: "https://www.ubereats.com/", // TODO: remplacer par le vrai lien Uber Eats
  // Embed Google Maps (requête sur l'adresse) — pas de clé API requise pour l'iframe publique.
  mapsEmbedSrc:
    "https://www.google.com/maps?q=4+rue+du+11+Novembre+38200+Vienne&output=embed",
  timeZone: "Europe/Paris",
} as const;

/** Délai de préparation minimum (min) avant le premier créneau de retrait. */
// `|| 20` (et non `??`) pour rattraper aussi une variable vide ("") ou non
// numérique (NaN) — sinon le délai de préparation tomberait à 0.
export const PREP_DELAY_MINUTES =
  Number(process.env.PREP_DELAY_MINUTES) || 20;
