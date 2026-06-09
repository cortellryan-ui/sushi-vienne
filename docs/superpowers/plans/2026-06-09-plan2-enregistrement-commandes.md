# Plan 2 — Enregistrement des commandes

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development ou executing-plans. Steps en cases à cocher.

**Goal:** Quand le client valide son panier, une vraie commande s'enregistre dans Supabase (`orders` + `order_items`), avec total recalculé côté serveur, et la confirmation affiche le vrai numéro de commande.

**Architecture:** Une Server Action `createOrder` reçoit le panier (productId + quantités) + infos client. Elle recalcule prix et total depuis la base (jamais confiance au client), via une fonction pure `buildOrderLines` (testable). L'insertion utilise le client **service_role** (la RLS interdit la lecture publique de `orders`, donc on ne peut pas faire `insert().select()` en anon). Le composant `CartSheet` appelle l'action et affiche le numéro retourné.

**Tech Stack:** Next.js Server Actions, Zod, Supabase (service role côté serveur).

---

## Tests

Pas de framework de test dans le projet (et pas de nouvelle dépendance ici, conformément à CLAUDE.md §12). La **logique pure** critique (`buildOrderLines` : recalcul du total, rejet des indisponibles, prix client ignorés) est vérifiée par un **script Node temporaire** exécuté puis supprimé (même approche que la vérif service_role du Plan 1). Le **bout-en-bout** (insertion réelle en base) est vérifié par un script d'intégration qui insère une commande de test puis la **nettoie**.

## Structure des fichiers

- Create: `lib/actions/orders-core.ts` — logique pure : schémas Zod + `buildOrderLines()` (aucun accès DB)
- Create: `lib/actions/orders.ts` — Server Action `createOrder()` ("use server") : DB + insertion
- Modify: `components/cart/CartSheet.tsx` — `submit()` appelle `createOrder()` (async, état de chargement, gestion d'erreur)

---

### Task 1 : Logique pure (schémas + `buildOrderLines`)

**Fichiers :** Create `lib/actions/orders-core.ts`

- [ ] **Étape 1 : Écrire `lib/actions/orders-core.ts`**

```ts
import { z } from "zod";

/** Une ligne du panier envoyée par le client (on ne fait PAS confiance au prix client). */
export const CartLineSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});

/** Données du checkout validées. */
export const CreateOrderSchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  customerPhone: z.string().trim().min(6).max(30),
  pickupTime: z.string().datetime(), // ISO (créneau choisi)
  notes: z.string().trim().max(500).optional().nullable(),
  items: z.array(CartLineSchema).min(1).max(100),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

/** Produit authentique tel que lu en base (prix de référence). */
export type DbProduct = {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
};

/** Ligne de commande prête à insérer (snapshot nom + prix figés). */
export type OrderLine = {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
};

export type BuildResult =
  | { ok: true; lines: OrderLine[]; total: number }
  | { ok: false; error: "unavailable" | "empty" };

/**
 * Construit les lignes de commande à partir des produits AUTHENTIQUES (base) et
 * des quantités demandées. Le prix et le nom viennent de la base (snapshot),
 * jamais du client. Rejette si un produit est introuvable ou indisponible.
 */
export function buildOrderLines(
  products: DbProduct[],
  items: { productId: string; quantity: number }[],
): BuildResult {
  if (items.length === 0) return { ok: false, error: "empty" };

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: OrderLine[] = [];
  let totalCents = 0;

  for (const item of items) {
    const p = byId.get(item.productId);
    if (!p || !p.is_available) return { ok: false, error: "unavailable" };
    const unit = Number(p.price);
    totalCents += Math.round(unit * 100) * item.quantity;
    lines.push({
      product_id: p.id,
      product_name: p.name,
      unit_price: unit,
      quantity: item.quantity,
    });
  }

  return { ok: true, lines, total: totalCents / 100 };
}
```

- [ ] **Étape 2 : Vérifier la logique (script Node temporaire)**

Crée `scripts/_test-orders-core.mjs` :

```js
import { buildOrderLines } from "../lib/actions/orders-core.ts";

// Impossible d'importer du .ts directement en Node sans loader → on duplique
// l'appel via tsx. Voir étape 3.
```

> Note : Node n'exécute pas `.ts` nativement. Utiliser `npx tsx` (déjà transitif via Next ? sinon `npx -y tsx`). Le script réel ci-dessous est en `.mts` lancé par tsx.

Crée `scripts/_test-orders-core.mts` :

```ts
import { buildOrderLines, type DbProduct } from "../lib/actions/orders-core";

const products: DbProduct[] = [
  { id: "a", name: "Maki Saumon", price: 4.9, is_available: true },
  { id: "b", name: "Gyoza", price: 5.9, is_available: true },
  { id: "c", name: "Nems", price: 5.2, is_available: false },
];

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.log("ÉCHEC:", msg);
    process.exit(1);
  }
}

// 1) Total recalculé depuis la base
const r1 = buildOrderLines(products, [
  { productId: "a", quantity: 2 },
  { productId: "b", quantity: 1 },
]);
assert(r1.ok, "r1 devrait réussir");
if (r1.ok) {
  assert(Math.abs(r1.total - (4.9 * 2 + 5.9)) < 1e-9, `total attendu 15.7, reçu ${r1.total}`);
  assert(r1.lines[0].unit_price === 4.9, "prix snapshot depuis la base");
}

// 2) Produit indisponible -> rejet
const r2 = buildOrderLines(products, [{ productId: "c", quantity: 1 }]);
assert(!r2.ok && r2.error === "unavailable", "indispo devrait être rejeté");

// 3) Produit inconnu -> rejet
const r3 = buildOrderLines(products, [{ productId: "zzz", quantity: 1 }]);
assert(!r3.ok && r3.error === "unavailable", "inconnu devrait être rejeté");

// 4) Panier vide -> rejet
const r4 = buildOrderLines(products, []);
assert(!r4.ok && r4.error === "empty", "vide devrait être rejeté");

console.log("OK  orders-core : 4/4 assertions passées.");
```

- [ ] **Étape 3 : Lancer le test**

Run: `npx -y tsx scripts/_test-orders-core.mts`
Expected: `OK  orders-core : 4/4 assertions passées.`

- [ ] **Étape 4 : Supprimer le script de test + typecheck**

Run:
```bash
rm -f scripts/_test-orders-core.mts scripts/_test-orders-core.mjs && rmdir scripts 2>/dev/null
npx tsc --noEmit
```
Expected: exit 0.

- [ ] **Étape 5 : Commit**

```bash
git add lib/actions/orders-core.ts
git commit -m "feat(orders): logique pure de construction des lignes (Zod + recalcul total)"
```

---

### Task 2 : Server Action `createOrder`

**Fichiers :** Create `lib/actions/orders.ts`

- [ ] **Étape 1 : Écrire `lib/actions/orders.ts`**

```ts
"use server";

import { createAdminClient } from "@/lib/supabase/server";
import {
  CreateOrderSchema,
  buildOrderLines,
  type DbProduct,
} from "./orders-core";

export type CreateOrderResult =
  | { ok: true; orderNumber: number }
  | { ok: false; error: "invalid" | "unavailable" | "db" };

/**
 * Enregistre une commande (status 'en_attente', paiement sur place par défaut).
 * Recalcule prix + total côté serveur depuis la base. Utilise le client
 * service_role car la RLS interdit la lecture publique de `orders`.
 */
export async function createOrder(raw: unknown): Promise<CreateOrderResult> {
  const parsed = CreateOrderSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const input = parsed.data;

  const supabase = createAdminClient();

  // 1. Produits authentiques
  const ids = input.items.map((i) => i.productId);
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, price, is_available")
    .in("id", ids);
  if (prodErr) return { ok: false, error: "db" };

  // 2. Lignes + total (depuis la base)
  const built = buildOrderLines(
    (products ?? []) as DbProduct[],
    input.items,
  );
  if (!built.ok) return { ok: false, error: "unavailable" };

  // 3. Insertion de la commande
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      pickup_time: input.pickupTime,
      total: built.total,
      notes: input.notes ?? null,
      // payment_method = 'sur_place', payment_status = 'non_paye' (défauts SQL)
    })
    .select("id, order_number")
    .single();
  if (orderErr || !order) return { ok: false, error: "db" };

  // 4. Insertion des lignes
  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(built.lines.map((l) => ({ ...l, order_id: order.id })));
  if (itemsErr) return { ok: false, error: "db" };

  return { ok: true, orderNumber: order.order_number };
}
```

- [ ] **Étape 2 : Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Étape 3 : Commit**

```bash
git add lib/actions/orders.ts
git commit -m "feat(orders): Server Action createOrder (insertion Supabase service_role)"
```

---

### Task 3 : Brancher le checkout (`CartSheet`)

**Fichiers :** Modify `components/cart/CartSheet.tsx`

- [ ] **Étape 1 : Importer l'action + ajouter les états**

En haut du fichier, après les imports existants, ajoute :

```tsx
import { createOrder } from "@/lib/actions/orders";
```

Dans le composant, à côté des autres `useState`, ajoute :

```tsx
const [submitting, setSubmitting] = useState(false);
const [serverError, setServerError] = useState(false);
```

- [ ] **Étape 2 : Remplacer `submit()` par une version async réelle**

Remplace toute la fonction `submit()` existante par :

```tsx
async function submit() {
  setServerError(false);
  if (!name.trim() || !phone.trim() || !pickup) {
    setError(true);
    return;
  }
  setError(false);
  setSubmitting(true);

  const chosen = slots.find((s) => s.value === pickup);
  const result = await createOrder({
    customerName: name,
    customerPhone: phone,
    pickupTime: pickup, // ISO (slot.value)
    notes: notes.trim() || null,
    items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  });

  setSubmitting(false);

  if (!result.ok) {
    setServerError(true);
    return;
  }

  setOrder({
    number: result.orderNumber,
    pickup: chosen ? slotLabel(chosen) : "",
  });
  clear();
  setName("");
  setPhone("");
  setPickup("");
  setNotes("");
  setStep("confirmation");
}
```

- [ ] **Étape 3 : Bouton de confirmation — état de chargement + message d'erreur serveur**

Dans l'étape checkout, remplace le bouton final :

```tsx
<Button size="lg" className="w-full" onClick={submit}>
  {tCheckout("confirm")}
</Button>
```

par :

```tsx
<Button size="lg" className="w-full" onClick={submit} disabled={submitting}>
  {submitting ? tCheckout("sending") : tCheckout("confirm")}
</Button>
```

Et juste avant le bloc `{error && (...)}` (message « champs requis »), ajoute un message d'erreur serveur :

```tsx
{serverError && (
  <p className="text-sm font-medium text-red-600">
    {tCheckout("serverError")}
  </p>
)}
```

- [ ] **Étape 4 : Ajouter les 2 clés i18n manquantes**

Dans `messages/fr.json`, sous l'objet `"checkout"`, ajoute :
```json
"sending": "Envoi…",
"serverError": "Une erreur est survenue. Réessayez ou appelez le restaurant."
```
Dans `messages/en.json`, sous `"checkout"` :
```json
"sending": "Sending…",
"serverError": "Something went wrong. Please try again or call the restaurant."
```

> Vérifie d'abord la forme exacte de l'objet `checkout` dans chaque fichier et respecte les virgules JSON.

- [ ] **Étape 5 : Typecheck + build**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Étape 6 : Commit**

```bash
git add components/cart/CartSheet.tsx messages/fr.json messages/en.json
git commit -m "feat(checkout): le panier enregistre une vraie commande via createOrder"
```

---

### Task 4 : Vérification de bout en bout

**Fichiers :** aucun durable (script d'intégration temporaire)

- [ ] **Étape 1 : Script d'intégration (insère une vraie commande de test puis nettoie)**

Crée `scripts/_test-create-order.mts` :

```ts
import { createClient } from "@supabase/supabase-js";
import { buildOrderLines, type DbProduct } from "../lib/actions/orders-core";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const db = createClient(url, service, { auth: { persistSession: false } });

// 1. Prendre 2 vrais produits disponibles
const { data: products } = await db
  .from("products")
  .select("id, name, price, is_available")
  .eq("is_available", true)
  .limit(2);
if (!products || products.length < 2) {
  console.log("ÉCHEC: pas assez de produits dispo"); process.exit(1);
}

const items = [
  { productId: products[0].id, quantity: 2 },
  { productId: products[1].id, quantity: 1 },
];
const built = buildOrderLines(products as DbProduct[], items);
if (!built.ok) { console.log("ÉCHEC build"); process.exit(1); }

// 2. Insérer la commande comme le fait createOrder
const { data: order, error: oErr } = await db
  .from("orders")
  .insert({
    customer_name: "TEST Intégration",
    customer_phone: "0600000000",
    pickup_time: new Date(Date.now() + 3600_000).toISOString(),
    total: built.total,
    notes: "commande de test — à supprimer",
  })
  .select("id, order_number, status, payment_method, payment_status, total")
  .single();
if (oErr || !order) { console.log("ÉCHEC insert order:", oErr?.message); process.exit(1); }

const { error: iErr } = await db
  .from("order_items")
  .insert(built.lines.map((l) => ({ ...l, order_id: order.id })));
if (iErr) { console.log("ÉCHEC insert items:", iErr.message); process.exit(1); }

// 3. Vérifs
console.log(`OK  commande #${order.order_number} créée — total ${order.total}€, status=${order.status}, paiement=${order.payment_method}/${order.payment_status}`);
const { count } = await db
  .from("order_items")
  .select("*", { count: "exact", head: true })
  .eq("order_id", order.id);
console.log(`OK  ${count} ligne(s) insérée(s) (attendu: 2).`);

// 4. Nettoyage (cascade supprime les order_items)
await db.from("orders").delete().eq("id", order.id);
console.log("OK  commande de test supprimée (nettoyage).");
```

- [ ] **Étape 2 : Lancer le test d'intégration**

Run: `node --env-file=.env.local --import tsx scripts/_test-create-order.mts`
(si `--import tsx` indisponible : `npx -y tsx scripts/_test-create-order.mts` après avoir exporté les variables, ou `node --env-file=.env.local $(npx -y tsx --print-path 2>/dev/null)`. Le plus simple : `set -a; source .env.local; set +a; npx -y tsx scripts/_test-create-order.mts`)

Expected :
```
OK  commande #N créée — total ...€, status=en_attente, paiement=sur_place/non_paye
OK  2 ligne(s) insérée(s) (attendu: 2).
OK  commande de test supprimée (nettoyage).
```

- [ ] **Étape 3 : Supprimer le script**

Run: `rm -f scripts/_test-create-order.mts && rmdir scripts 2>/dev/null`

- [ ] **Étape 4 : Vérification manuelle dans le navigateur (toi)**

1. `npm run dev`, ouvre http://localhost:3000/menu
2. Ajoute des plats au panier → **Commander** → remplis nom/téléphone, choisis un créneau → **Confirmer**.
3. Attendu : écran de confirmation avec un **vrai numéro** de commande.
4. Dans Supabase → Table Editor → `orders` : la commande apparaît (`status = en_attente`, `payment_method = sur_place`). `order_items` : les lignes avec les bons prix.

- [ ] **Étape 5 : Plan 2 terminé**

Les commandes s'enregistrent réellement. Prêt pour le **Plan 3 (admin temps réel + accept/décline)** — c'est lui qui affichera ces commandes au resto.

---

## Auto-revue (faite)

- **Spec §4.5 couverte :** Zod (Task 1), recalcul total serveur (`buildOrderLines`, Task 1+2), insert `orders`+`order_items` avec snapshot (Task 2), numéro retourné + confirmation (Task 3). ✓
- **Sécurité :** prix client ignoré (prix lus en base) ; service_role côté serveur uniquement ; total recalculé. ✓
- **Pas de placeholder :** tout le code est complet. Les 2 clés i18n sont explicitées. ✓
- **Cohérence types :** `CreateOrderInput`/`buildOrderLines`/`OrderLine`/`DbProduct` partagés entre `orders-core.ts` et `orders.ts`. `createOrder` renvoie `{ok, orderNumber}` consommé tel quel par `CartSheet`. ✓
- **Hors périmètre (noté) :** revalidation stricte du créneau contre les horaires (le sélecteur ne propose déjà que des créneaux valides ; durcissement possible plus tard). Pas de notification client (conforme CLAUDE.md §7).
