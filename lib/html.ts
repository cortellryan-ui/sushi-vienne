/**
 * Échappe les caractères HTML dangereux avant interpolation dans un template
 * d'email (les saisies client ne doivent jamais être injectées brutes).
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
