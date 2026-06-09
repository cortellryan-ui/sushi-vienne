# Plan 5 — Paiement en ligne Stripe (option A, Checkout hébergé)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development ou executing-plans.

**Goal:** Au checkout, le client choisit **payer sur place** (flux actuel) ou **payer en ligne**. En ligne : carte **autorisée** (pas débitée) via Stripe Checkout ; la commande est **débitée quand le resto accepte**, et l'autorisation **annulée s'il décline** (option A).

**Architecture (sans webhook en local) :** Pour « en ligne », on **ne crée la commande qu'après l'autorisation** : la Server Action crée une **Stripe Checkout Session** (capture manuelle) à partir du panier recalculé, et redirige. Au retour (`success_url`), une page serveur récupère la session, vérifie que le PaymentIntent est `requires_capture`, **insère alors la commande** (`payment_status='autorise'`, `stripe_payment_intent_id`), envoie l'email resto, et affiche la confirmation. Pas de commande fantôme si le client abandonne. L'accept/décline (tablette **et** email) capture/annule le PaymentIntent via une logique partagée.

> Webhook = durcissement **production** (rattrape le cas où le client paie mais ferme l'onglet avant le retour). Hors périmètre v1 local ; `STRIPE_WEBHOOK_SECRET` réservé pour ça.

**Tech Stack:** `stripe` (SDK serveur — nouvelle dépendance, cœur de la fonctionnalité), Next.js Server Actions + Server Components.

---

### Task 0 : Dépendance + clés (faites)
- [x] Clés test dans `.env.local` (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`). Clé secrète vérifiée valide (EUR, test).
- [ ] Installer le SDK : `npm install stripe`

---

### Task 1 : Client Stripe serveur

**Create `lib/stripe/server.ts`**

```ts
import Stripe from "stripe";

/** Client Stripe serveur, ou null si non configuré (évite de planter sans clé). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}
```

Commit: `feat(stripe): client serveur`.

---

### Task 2 : Insertion de commande factorisée + transition avec Stripe

**Modify `lib/actions/orders.ts`** — extraire un helper `persistOrder` réutilisable (sur place ET en ligne) :

```ts
// Ajouter dans orders.ts (à côté de createOrder), exporté :
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderLine } from "./orders-core";

export type PaymentInfo = {
  method: "sur_place" | "en_ligne";
  status: "non_paye" | "autorise";
  intentId?: string | null;
};

/** Insère commande + lignes, déclenche l'email resto. Renvoie le n° ou null. */
export async function persistOrder(
  admin: SupabaseClient,
  input: {
    customerName: string;
    customerPhone: string;
    pickupTime: string;
    notes: string | null;
  },
  lines: OrderLine[],
  total: number,
  payment: PaymentInfo,
): Promise<{ id: string; orderNumber: number } | null> {
  const { data: order, error } = await admin
    .from("orders")
    .insert({
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      pickup_time: input.pickupTime,
      total,
      notes: input.notes,
      payment_method: payment.method,
      payment_status: payment.status,
      stripe_payment_intent_id: payment.intentId ?? null,
    })
    .select("id, order_number, validation_token")
    .single();
  if (error || !order) return null;

  const { error: itemsErr } = await admin
    .from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (itemsErr) return null;

  await sendOrderNotification({
    id: order.id,
    orderNumber: order.order_number,
    validationToken: order.validation_token,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    pickupTime: input.pickupTime,
    notes: input.notes,
    total,
    items: lines.map((l) => ({
      name: l.product_name,
      quantity: l.quantity,
      unitPrice: l.unit_price,
    })),
  });

  return { id: order.id, orderNumber: order.order_number };
}
```

Puis **refactorer `createOrder`** (flux sur place) pour appeler `persistOrder(supabase, input, built.lines, built.total, { method: "sur_place", status: "non_paye" })` au lieu des inserts inline. (Comportement identique.)

**Create `lib/orders/transition.ts`** — accept/décline partagé, avec capture/annulation Stripe :

```ts
import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";

export type TransitionResult =
  | { ok: true; orderNumber: number }
  | { ok: false; reason: "not_found" | "already" | "error" };

/**
 * Accepte (capture) ou décline (annule) une commande. Gère le paiement Stripe
 * si la commande est en ligne et autorisée. Utilisé par la tablette ET l'email.
 */
export async function transitionOrder(
  id: string,
  target: "acceptee" | "declinee",
): Promise<TransitionResult> {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(
      "id, order_number, status, payment_method, payment_status, stripe_payment_intent_id",
    )
    .eq("id", id)
    .single();
  if (!order) return { ok: false, reason: "not_found" };
  if (order.status !== "en_attente") return { ok: false, reason: "already" };

  let paymentStatus = order.payment_status;

  // Paiement en ligne autorisé : capturer (accept) ou annuler (decline).
  if (
    order.payment_method === "en_ligne" &&
    order.stripe_payment_intent_id &&
    order.payment_status === "autorise"
  ) {
    const stripe = getStripe();
    if (!stripe) return { ok: false, reason: "error" };
    try {
      if (target === "acceptee") {
        await stripe.paymentIntents.capture(order.stripe_payment_intent_id);
        paymentStatus = "paye";
      } else {
        await stripe.paymentIntents.cancel(order.stripe_payment_intent_id);
        paymentStatus = "annule";
      }
    } catch {
      return { ok: false, reason: "error" };
    }
  }

  const { error } = await admin
    .from("orders")
    .update({ status: target, payment_status: paymentStatus })
    .eq("id", id);
  if (error) return { ok: false, reason: "error" };

  return { ok: true, orderNumber: order.order_number };
}
```

Commit: `feat(stripe): persistOrder factorisé + transitionOrder (capture/annule)`.

---

### Task 3 : Brancher accept/décline (tablette + email) sur `transitionOrder`

**Modify `lib/actions/admin-orders.ts`** — `updateOrderStatus` : auth + Stripe pour accept/décline.

```ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { transitionOrder } from "@/lib/orders/transition";
import { getAdminOrders, type AdminOrder } from "@/lib/data/admin-orders";
import type { OrderStatus } from "@/lib/types";

export type ActionResult = { ok: boolean };

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  if (!(await getCurrentUser())) return { ok: false }; // admin only

  if (status === "acceptee" || status === "declinee") {
    const r = await transitionOrder(id, status);
    return { ok: r.ok };
  }
  if (status === "prete" || status === "terminee") {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    return { ok: !error };
  }
  return { ok: false };
}

export async function refreshAdminOrders(): Promise<AdminOrder[]> {
  return getAdminOrders();
}
```

**Modify `lib/orders/validation.ts`** — `applyValidation` appelle `transitionOrder` après vérif du token (au lieu de l'update direct) :

```ts
// après avoir vérifié order + token + statut en_attente :
import { transitionOrder } from "./transition";
// ...
  const r = await transitionOrder(id, target);
  if (!r.ok) {
    if (r.reason === "already")
      return page(`Commande #${order.order_number}`, "Déjà traitée.", "#888");
    return page("Erreur", "La mise à jour a échoué, réessayez.", "#dc2626");
  }
  return target === "acceptee"
    ? page(`Commande #${order.order_number} acceptée`, "Elle est passée en cuisine (paiement débité si payé en ligne).", "#16a34a")
    : page(`Commande #${order.order_number} déclinée`, "Le client n'est pas débité. Pensez à l'appeler.", "#dc2626");
```

(La vérification du token reste inchangée avant l'appel.)

Commit: `feat(stripe): accept/décline capture/annule le paiement (tablette + email)`.

---

### Task 4 : Création de la session Checkout (paiement en ligne)

**Create `lib/actions/checkout.ts`** :

```ts
"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { CreateOrderSchema, buildOrderLines, type DbProduct } from "./orders-core";

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** Crée une session Stripe Checkout (capture manuelle) et renvoie l'URL. */
export async function createOnlineCheckout(raw: unknown): Promise<CheckoutResult> {
  const parsed = CreateOrderSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const input = parsed.data;

  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "stripe" };

  const admin = createAdminClient();
  const { data: products } = await admin
    .from("products")
    .select("id, name, price, is_available")
    .in("id", input.items.map((i) => i.productId));
  const built = buildOrderLines((products ?? []) as DbProduct[], input.items);
  if (!built.ok) return { ok: false, error: "unavailable" };

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_intent_data: { capture_method: "manual" },
    line_items: built.lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(l.unit_price * 100),
        product_data: {
          name: l.product_name,
          metadata: { product_id: l.product_id },
        },
      },
    })),
    metadata: {
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      pickupTime: input.pickupTime,
      notes: input.notes ?? "",
    },
    success_url: `${base}/commande/confirmee?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/menu?paiement=annule`,
  });

  if (!session.url) return { ok: false, error: "stripe" };
  return { ok: true, url: session.url };
}
```

Commit: `feat(stripe): création de la session Checkout (capture manuelle)`.

---

### Task 5 : Page de confirmation (crée la commande après autorisation)

**Create `lib/stripe/confirm.ts`** :

```ts
import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { buildOrderLines, type DbProduct } from "@/lib/actions/orders-core";
import { persistOrder } from "@/lib/actions/orders";

export type ConfirmResult =
  | { ok: true; orderNumber: number; pickupTime: string }
  | { ok: false };

/** Vérifie la session Stripe et crée la commande (idempotent) si autorisée. */
export async function confirmOnlineOrder(sessionId: string): Promise<ConfirmResult> {
  const stripe = getStripe();
  if (!stripe) return { ok: false };

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "line_items.data.price.product"],
  });
  const pi = session.payment_intent;
  if (!pi || typeof pi === "string" || pi.status !== "requires_capture") {
    return { ok: false };
  }

  const admin = createAdminClient();

  // Idempotence : commande déjà créée pour ce PaymentIntent ?
  const { data: existing } = await admin
    .from("orders")
    .select("order_number, pickup_time")
    .eq("stripe_payment_intent_id", pi.id)
    .maybeSingle();
  if (existing) {
    return { ok: true, orderNumber: existing.order_number, pickupTime: existing.pickup_time };
  }

  // Reconstituer le panier depuis les line items (product_id en metadata).
  const items = (session.line_items?.data ?? [])
    .map((li) => {
      const product = li.price?.product;
      const pid =
        product && typeof product !== "string" && "metadata" in product
          ? (product.metadata?.product_id ?? null)
          : null;
      return pid ? { productId: pid, quantity: li.quantity ?? 1 } : null;
    })
    .filter((x): x is { productId: string; quantity: number } => x !== null);

  const { data: products } = await admin
    .from("products")
    .select("id, name, price, is_available")
    .in("id", items.map((i) => i.productId));
  const built = buildOrderLines((products ?? []) as DbProduct[], items);
  if (!built.ok) return { ok: false };

  const m = session.metadata ?? {};
  const result = await persistOrder(
    admin,
    {
      customerName: m.customerName ?? "Client",
      customerPhone: m.customerPhone ?? "",
      pickupTime: m.pickupTime ?? new Date().toISOString(),
      notes: m.notes ? m.notes : null,
    },
    built.lines,
    built.total,
    { method: "en_ligne", status: "autorise", intentId: pi.id },
  );
  if (!result) return { ok: false };

  return { ok: true, orderNumber: result.orderNumber, pickupTime: m.pickupTime ?? "" };
}
```

**Create `components/cart/ClearCartOnMount.tsx`** (vide le panier au retour) :

```tsx
"use client";
import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";

export function ClearCartOnMount() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
```

**Create `app/[locale]/(public)/commande/confirmee/page.tsx`** :

```tsx
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { CheckCircle2, XCircle } from "lucide-react";
import { confirmOnlineOrder } from "@/lib/stripe/confirm";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ConfirmeePage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { session_id?: string };
}) {
  setRequestLocale(locale);
  const sessionId = searchParams.session_id;
  const result = sessionId ? await confirmOnlineOrder(sessionId) : { ok: false as const };

  return (
    <div className="container grid min-h-[60vh] place-items-center py-16 text-center">
      {result.ok ? (
        <div className="max-w-md">
          <ClearCartOnMount />
          <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
          <h1 className="mt-4 font-display text-3xl">Paiement autorisé 🎉</h1>
          <p className="mt-2 rounded-full bg-ink px-4 py-1.5 font-display text-lg text-white inline-block">
            Commande n° {result.orderNumber}
          </p>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            Votre commande a bien été reçue. Le restaurant doit la valider — vous
            ne serez débité qu'à l'acceptation. Présentez-vous au créneau choisi.
          </p>
          <Button asChild className="mt-6">
            <Link href="/menu">Retour à la carte</Link>
          </Button>
        </div>
      ) : (
        <div className="max-w-md">
          <XCircle className="mx-auto size-16 text-red-500" />
          <h1 className="mt-4 font-display text-3xl">Paiement non confirmé</h1>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            Le paiement n'a pas pu être confirmé. Vous n'avez pas été débité.
            Réessayez ou choisissez « payer sur place ».
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/menu">Retour à la carte</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
```

Commit: `feat(stripe): page de confirmation crée la commande après autorisation`.

---

### Task 6 : Choix du mode de paiement au checkout

**Modify `components/cart/CartSheet.tsx`** :
- Ajouter un état `payment: "sur_place" | "en_ligne"` (défaut `sur_place`).
- Dans l'étape checkout, ajouter un sélecteur (2 boutons radio) avant le bouton de validation.
- Dans `submit()` : si `payment === "en_ligne"`, appeler `createOnlineCheckout({...mêmes données})` et `window.location.href = result.url` (redirection Stripe) au lieu de `createOrder`. Sinon, flux actuel.

```tsx
import { createOnlineCheckout } from "@/lib/actions/checkout";
// ... états :
const [payment, setPayment] = useState<"sur_place" | "en_ligne">("sur_place");

// dans submit(), après validation des champs et setSubmitting(true) :
if (payment === "en_ligne") {
  const res = await createOnlineCheckout({
    customerName: name,
    customerPhone: phone,
    pickupTime: pickup,
    notes: notes.trim() || null,
    items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  });
  if (res.ok) {
    window.location.href = res.url; // redirection vers Stripe
    return;
  }
  setSubmitting(false);
  setServerError(true);
  return;
}
// sinon : flux createOrder existant (inchangé)
```

Sélecteur (avant le récapitulatif ou le bouton) :
```tsx
<div className="space-y-1.5">
  <Label>{tCheckout("payment")}</Label>
  <div className="grid grid-cols-2 gap-2">
    <button type="button" onClick={() => setPayment("sur_place")}
      className={cn("rounded-xl border px-3 py-2 text-sm font-medium", payment === "sur_place" ? "border-brand bg-brand/5 text-brand" : "bg-white")}>
      {tCheckout("payOnSite")}
    </button>
    <button type="button" onClick={() => setPayment("en_ligne")}
      className={cn("rounded-xl border px-3 py-2 text-sm font-medium", payment === "en_ligne" ? "border-brand bg-brand/5 text-brand" : "bg-white")}>
      {tCheckout("payOnline")}
    </button>
  </div>
</div>
```
(Importer `cn` depuis `@/lib/utils`.)

Le libellé du bouton de validation : si en ligne → `tCheckout("payAndOrder")`, sinon `tCheckout("confirm")`.

**i18n** (`messages/fr.json` / `en.json`, objet `checkout`) :
```
fr: "payment":"Paiement", "payOnSite":"Sur place","payOnline":"En ligne","payAndOrder":"Payer et commander"
en: "payment":"Payment", "payOnSite":"On site","payOnline":"Online","payAndOrder":"Pay & order"
```

Commit: `feat(stripe): choix payer sur place / en ligne au checkout`.

---

### Task 7 : Vérification de bout en bout (toi + moi)

- [ ] `npm install stripe` OK, `npx tsc --noEmit` exit 0, build/dev sans erreur.
- [ ] **Sur place** : commande → toujours OK (non régressé), `payment_method=sur_place`.
- [ ] **En ligne** : checkout → « En ligne » → « Payer et commander » → redirection Stripe Checkout. Payer avec la **carte de test `4242 4242 4242 4242`**, date future, CVC quelconque → retour sur `/commande/confirmee` → « Paiement autorisé », n° de commande.
- [ ] **Base** : la commande apparaît `payment_method=en_ligne`, `payment_status=autorise`, `stripe_payment_intent_id` rempli. Dashboard : visible dans « À valider ».
- [ ] **Accepter** → Stripe : le PaymentIntent passe `succeeded` (capturé) ; `payment_status=paye`. (Vérif dashboard Stripe → Paiements.)
- [ ] **Décliner** (autre commande) → PaymentIntent `canceled` ; `payment_status=annule` ; client non débité.
- [ ] **Abandon** : lancer un paiement en ligne puis cliquer « retour » sur Stripe → `/menu?paiement=annule`, **aucune commande créée** (pas de fantôme).

---

## Auto-revue (faite)
- **Option A** : `capture_method: manual` (autorisation) ; capture à l'accept, cancel au décline. ✓
- **Pas de commande fantôme** : insertion seulement après `requires_capture` ; idempotent par `stripe_payment_intent_id`. ✓
- **Source unique accept/décline** : `transitionOrder` partagé par tablette + email → capture/annule cohérents. ✓
- **Sécurité** : `STRIPE_SECRET_KEY` serveur only ; `updateOrderStatus` exige un user connecté ; prix recalculés en base (jamais le client). ✓
- **Hors périmètre (noté)** : webhook (durcissement prod), Apple/Google Pay (Checkout les propose nativement si activés côté Stripe), remboursement post-capture. SIRET/IBAN requis seulement pour passer en live.
```
