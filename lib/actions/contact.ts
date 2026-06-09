"use server";

import { z } from "zod";
import { getResend, EMAIL_FROM, RESTAURANT_EMAIL } from "@/lib/email/resend";

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
      subject: `✉️ Message de ${name} (site Sushi Smile)`,
      html: `<div style="font-family:system-ui,sans-serif">
        <p><strong>${name}</strong> &lt;${email}&gt;</p>
        <p style="white-space:pre-wrap">${message}</p>
      </div>`,
    });
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}
