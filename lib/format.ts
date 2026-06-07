/** Formate un montant en euros selon la locale. */
export function formatPrice(amount: number, locale = "fr"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
