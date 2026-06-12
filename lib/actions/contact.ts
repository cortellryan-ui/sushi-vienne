"use server";

import { z } from "zod";
import { getResend, EMAIL_FROM, RESTAURANT_EMAIL } from "@/lib/email/resend";
import { escapeHtml } from "@/lib/html";

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(160),
  message: z.string().trim().min(1).max(2000),
});

export type ContactResult = { ok: boolean };

export async function sendContactMessage(raw: unknown): Promise<ContactResult> {
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) return { ok: false };
  const { name, email, message } = parsed.data;

  const resend = getResend();
  if (!resend || !RESTAURANT_EMAIL) return { ok: false };

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: RESTAURANT_EMAIL,
      replyTo: email,
      subject: `Message de ${name} (site Sushi Smile)`,
      html: `<div style="font-family:system-ui,sans-serif">
        <p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>`,
    });
    if (error) {
      console.error("Échec d'envoi du message de contact (Resend) :", error);
    }
    return { ok: !error };
  } catch (e) {
    console.error("Erreur inattendue lors de l'envoi du message de contact :", e);
    return { ok: false };
  }
}
