import { getResend, EMAIL_FROM, RESTAURANT_EMAIL } from "./resend";
import { formatPrice } from "@/lib/format";

export type OrderEmailData = {
  id: string;
  orderNumber: number;
  validationToken: string;
  customerName: string;
  customerPhone: string;
  pickupTime: string; // ISO
  notes: string | null;
  total: number;
  items: { name: string; quantity: number; unitPrice: number }[];
};

/**
 * Envoie au resto l'email "nouvelle commande" avec boutons Accepter/Décliner.
 * Best-effort : retourne false sans lever si Resend n'est pas configuré ou échoue.
 */
export async function sendOrderNotification(
  order: OrderEmailData,
): Promise<boolean> {
  const resend = getResend();
  if (!resend || !RESTAURANT_EMAIL) return false;

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const acceptUrl = `${base}/api/orders/${order.id}/accept?token=${order.validationToken}`;
  const declineUrl = `${base}/api/orders/${order.id}/decline?token=${order.validationToken}`;

  const pickup = new Date(order.pickupTime).toLocaleString("fr-FR", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 8px">${i.quantity}×</td><td style="padding:4px 8px">${i.name}</td><td style="padding:4px 8px;text-align:right">${formatPrice(i.unitPrice * i.quantity, "fr")}</td></tr>`,
    )
    .join("");

  const html = `
  <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto">
    <h2 style="color:#E63312">Nouvelle commande #${order.orderNumber}</h2>
    <p><strong>${order.customerName}</strong> — <a href="tel:${order.customerPhone}">${order.customerPhone}</a></p>
    <p>Retrait : <strong>${pickup}</strong></p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee;border-bottom:1px solid #eee;margin:12px 0">${rows}</table>
    <p style="text-align:right;font-size:18px"><strong>Total : ${formatPrice(order.total, "fr")}</strong></p>
    ${order.notes ? `<p style="background:#fff7ed;padding:8px;border-radius:8px">Note : ${order.notes}</p>` : ""}
    <div style="margin:24px 0;text-align:center">
      <a href="${acceptUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:9999px;text-decoration:none;margin:0 6px">✓ Accepter</a>
      <a href="${declineUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 24px;border-radius:9999px;text-decoration:none;margin:0 6px">✕ Décliner</a>
    </div>
    <p style="color:#888;font-size:12px;text-align:center">Vous pouvez aussi valider depuis la tablette — les deux sont synchronisés.</p>
  </div>`;

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: RESTAURANT_EMAIL,
      subject: `Commande #${order.orderNumber} — ${order.customerName}`,
      html,
    });
    if (error) {
      console.error("Resend (commande) :", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Resend (commande) exception :", e);
    return false;
  }
}
