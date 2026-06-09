import { Resend } from "resend";

/** Expéditeur. En test Resend (sans domaine vérifié), garder onboarding@resend.dev. */
export const EMAIL_FROM =
  process.env.RESEND_FROM ?? "Sushi Smile <onboarding@resend.dev>";

/** Destinataire des emails internes (commandes, contact). */
export const RESTAURANT_EMAIL = process.env.RESTAURANT_EMAIL ?? "";

/** Client Resend, ou null si non configuré (évite de planter en dev sans clé). */
export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}
