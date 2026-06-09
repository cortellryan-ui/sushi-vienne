import { createAdminClient } from "@/lib/supabase/server";
import { transitionOrder } from "./transition";

type Target = "acceptee" | "declinee";

function page(title: string, message: string, color: string): Response {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title></head>
  <body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#faf7f2">
    <div style="text-align:center;background:#fff;padding:40px;border-radius:24px;box-shadow:0 10px 40px rgba(0,0,0,.08)">
      <div style="font-size:48px;color:${color}">${title.startsWith("Commande") ? "✓" : "•"}</div>
      <h1 style="font-family:system-ui">${title}</h1>
      <p style="color:#555">${message}</p>
    </div>
  </body></html>`;
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/** Vérifie le token + statut puis applique la transition. Renvoie une page HTML. */
export async function applyValidation(
  id: string,
  token: string | null,
  target: Target,
): Promise<Response> {
  if (!token) return page("Lien invalide", "Jeton manquant.", "#dc2626");

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status, validation_token")
    .eq("id", id)
    .single();

  if (!order || order.validation_token !== token) {
    return page(
      "Lien invalide",
      "Cette commande est introuvable ou le lien est incorrect.",
      "#dc2626",
    );
  }
  if (order.status !== "en_attente") {
    return page(
      `Commande #${order.order_number}`,
      `Déjà traitée (statut : ${order.status}). Aucune action effectuée.`,
      "#888",
    );
  }

  const r = await transitionOrder(id, target);
  if (!r.ok) {
    if (r.reason === "already")
      return page(
        `Commande #${order.order_number}`,
        "Déjà traitée. Aucune action effectuée.",
        "#888",
      );
    return page("Erreur", "La mise à jour a échoué, réessayez.", "#dc2626");
  }

  return target === "acceptee"
    ? page(
        `Commande #${order.order_number} acceptée`,
        "Elle est passée en cuisine (paiement débité si payé en ligne).",
        "#16a34a",
      )
    : page(
        `Commande #${order.order_number} déclinée`,
        "Le client n'est pas débité. Pensez à l'appeler pour le prévenir.",
        "#dc2626",
      );
}
