"use server";

import { z } from "zod";
import { getResend, EMAIL_FROM, RESTAURANT_EMAIL } from "@/lib/email/resend";

const PartnershipSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().max(160).optional().nullable(),
  email: z.string().trim().email().max(160),
  message: z.string().trim().min(1).max(2000),
});

export type PartnershipResult = { ok: boolean };

/** Envoie une demande de partenariat au restaurant (email Resend). */
export async function sendPartnershipRequest(
  raw: unknown,
): Promise<PartnershipResult> {
  const parsed = PartnershipSchema.safeParse(raw);
  if (!parsed.success) return { ok: false };
  const { name, company, email, message } = parsed.data;

  const resend = getResend();
  if (!resend || !RESTAURANT_EMAIL) return { ok: false };

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: RESTAURANT_EMAIL,
      replyTo: email,
      subject: `Demande de partenariat — ${name}${company ? ` (${company})` : ""}`,
      html: `<div style="font-family:system-ui,sans-serif">
        <p><strong>${name}</strong>${company ? ` — ${company}` : ""} &lt;${email}&gt;</p>
        <p style="white-space:pre-wrap">${message}</p>
      </div>`,
    });
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}
