import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { confirmOnlineOrder } from "@/lib/stripe/confirm";

// Le webhook a besoin du runtime Node (vérification de signature Stripe) et du
// corps brut de la requête.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook Stripe : filet de sécurité du paiement en ligne. Quand Stripe confirme
 * qu'une session Checkout est complétée (carte autorisée), on crée la commande —
 * même si le client a fermé l'onglet avant de revenir sur le site. Idempotent
 * (confirmOnlineOrder ne crée pas deux fois la même commande).
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!stripe || !secret || !signature) {
    return new Response("Webhook non configuré", { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("Webhook Stripe — signature invalide:", err);
    return new Response("Signature invalide", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await confirmOnlineOrder(session.id);
    } catch (err) {
      console.error("Webhook Stripe — création commande:", err);
      // 200 quand même : on ne veut pas que Stripe rejoue indéfiniment si la
      // commande existe déjà ; le filet de sécurité a fait son office.
    }
  }

  return new Response("ok", { status: 200 });
}
