# Plan 4 — Emails (Resend) : notification commande + validation tokenisée + contact

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development ou executing-plans.

**Goal:** À chaque nouvelle commande, le resto reçoit un **email** récapitulatif avec deux boutons **Accepter / Décliner** (liens sécurisés par token agissant sur la même commande que la tablette). Le **formulaire de contact** de `/infos` envoie aussi un email.

**Architecture:** Un client Resend partagé (`lib/email/resend.ts`). L'email de commande est envoyé **en best-effort** depuis la Server Action `createOrder` (si l'email échoue, la commande reste enregistrée). Les liens Accepter/Décliner pointent vers des **Route Handlers** `/api/orders/[id]/{accept,decline}` qui vérifient le `validation_token` + statut `en_attente` (client **service_role**, hors RLS) et renvoient une page HTML simple. Le contact passe par une Server Action.

**Tech Stack:** Resend (déjà installé), Next.js Route Handlers + Server Actions, Zod.

**Mode test Resend (important) :** sans domaine vérifié, Resend n'envoie **qu'à l'adresse du compte** et l'expéditeur doit être `onboarding@resend.dev`. Donc en test : `RESTAURANT_EMAIL` = l'email d'inscription Resend. En production : vérifier un domaine et changer `RESEND_FROM`.

---

### Task 0 : Compte Resend + clé API (action manuelle — toi)

- [ ] Crée un compte sur https://resend.com (gratuit).
- [ ] **API Keys** → **Create API Key** (nom : `sushi-smile`, permission *Sending access*) → copie la clé (`re_...`).
- [ ] Dans `.env.local`, renseigne :
  ```
  RESEND_API_KEY=re_xxx
  RESTAURANT_EMAIL=l-email-de-ton-compte-resend@exemple.com
  ```
  (En test, `RESTAURANT_EMAIL` doit être l'email du compte Resend, sinon l'envoi est refusé.)
- [ ] Redémarre `npm run dev` après avoir rempli `.env.local`.

---

### Task 1 : Client Resend partagé

**Fichiers :** Create `lib/email/resend.ts`

- [ ] **Étape 1 : Écrire `lib/email/resend.ts`**

```ts
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
```

- [ ] **Étape 2 : Typecheck** → exit 0.
- [ ] **Étape 3 : Commit** → `git add lib/email/resend.ts && git commit -m "feat(email): client Resend partagé"`

---

### Task 2 : Email de notification de commande

**Fichiers :**
- Create `lib/email/order-notification.ts`
- Modify `lib/actions/orders.ts`

- [ ] **Étape 1 : Créer `lib/email/order-notification.ts`**

```ts
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
      subject: `🍣 Commande #${order.orderNumber} — ${order.customerName}`,
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
```

- [ ] **Étape 2 : Brancher l'envoi dans `lib/actions/orders.ts`**

Dans `createOrder`, sur l'insertion de la commande, **ajouter `validation_token` au select** :

```ts
    .select("id, order_number, validation_token")
    .single();
```

Après l'insertion réussie des lignes (juste avant le `return { ok: true, ... }`), ajouter l'envoi best-effort :

```ts
  // Notification email au resto (best-effort : n'échoue pas la commande).
  await sendOrderNotification({
    id: order.id,
    orderNumber: order.order_number,
    validationToken: order.validation_token,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    pickupTime: input.pickupTime,
    notes: input.notes ?? null,
    total: built.total,
    items: built.lines.map((l) => ({
      name: l.product_name,
      quantity: l.quantity,
      unitPrice: l.unit_price,
    })),
  });
```

Et ajouter l'import en tête :

```ts
import { sendOrderNotification } from "@/lib/email/order-notification";
```

- [ ] **Étape 3 : Typecheck** → exit 0.
- [ ] **Étape 4 : Commit** → `git add lib/email/order-notification.ts lib/actions/orders.ts && git commit -m "feat(email): notification de commande au resto (best-effort)"`

---

### Task 3 : Liens tokenisés Accepter / Décliner

**Fichiers :**
- Create `lib/orders/validation.ts`
- Create `app/api/orders/[id]/accept/route.ts`
- Create `app/api/orders/[id]/decline/route.ts`

- [ ] **Étape 1 : Créer `lib/orders/validation.ts`** (logique partagée + page HTML)

```ts
import { createAdminClient } from "@/lib/supabase/server";

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
    return page("Lien invalide", "Cette commande est introuvable ou le lien est incorrect.", "#dc2626");
  }
  if (order.status !== "en_attente") {
    return page(
      `Commande #${order.order_number}`,
      `Déjà traitée (statut : ${order.status}). Aucune action effectuée.`,
      "#888",
    );
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: target })
    .eq("id", id);
  if (error) return page("Erreur", "La mise à jour a échoué, réessayez.", "#dc2626");

  return target === "acceptee"
    ? page(`Commande #${order.order_number} acceptée`, "Elle est passée en cuisine sur la tablette.", "#16a34a")
    : page(`Commande #${order.order_number} déclinée`, "Pensez à appeler le client pour le prévenir.", "#dc2626");
}
```

- [ ] **Étape 2 : Créer `app/api/orders/[id]/accept/route.ts`**

```ts
import { applyValidation } from "@/lib/orders/validation";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const token = new URL(request.url).searchParams.get("token");
  return applyValidation(params.id, token, "acceptee");
}
```

- [ ] **Étape 3 : Créer `app/api/orders/[id]/decline/route.ts`**

```ts
import { applyValidation } from "@/lib/orders/validation";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const token = new URL(request.url).searchParams.get("token");
  return applyValidation(params.id, token, "declinee");
}
```

- [ ] **Étape 4 : Typecheck** → exit 0.
- [ ] **Étape 5 : Commit** → `git add lib/orders/validation.ts "app/api/orders/[id]/accept/route.ts" "app/api/orders/[id]/decline/route.ts" && git commit -m "feat(email): routes tokenisées accepter/décliner (service_role)"`

---

### Task 4 : Formulaire de contact

**Fichiers :**
- Create `lib/actions/contact.ts`
- Create `components/site/ContactForm.tsx`
- Modify `app/[locale]/(public)/infos/page.tsx`
- Modify `messages/fr.json`, `messages/en.json`

- [ ] **Étape 1 : Créer `lib/actions/contact.ts`**

```ts
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
```

- [ ] **Étape 2 : Créer `components/site/ContactForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { sendContactMessage } from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const t = useTranslations("infos");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    const res = await sendContactMessage({ name, email, message });
    setLoading(false);
    if (res.ok) {
      setStatus("ok");
      setName("");
      setEmail("");
      setMessage("");
    } else {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {t("contactSuccess")}
      </p>
    );
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="ct-name">{t("contactName")}</Label>
        <Input id="ct-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ct-email">{t("contactEmail")}</Label>
        <Input id="ct-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ct-message">{t("contactMessage")}</Label>
        <Textarea id="ct-message" value={message} onChange={(e) => setMessage(e.target.value)} required />
      </div>
      {status === "error" && (
        <p className="text-sm font-medium text-red-600">{t("contactError")}</p>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        <Send /> {loading ? t("contactSending") : t("contactSend")}
      </Button>
    </form>
  );
}
```

- [ ] **Étape 3 : Brancher dans `app/[locale]/(public)/infos/page.tsx`**

Remplacer la section placeholder :
```tsx
          {/* Placeholder formulaire de contact (Resend) */}
          <section className="rounded-2xl border border-dashed bg-white p-6">
            <h2 className="mb-3 font-display text-xl">{t("contactTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("comingSoon")}</p>
          </section>
```
par :
```tsx
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="mb-3 font-display text-xl">{t("contactTitle")}</h2>
            <ContactForm />
          </section>
```
Et ajouter l'import en tête : `import { ContactForm } from "@/components/site/ContactForm";`

- [ ] **Étape 4 : Ajouter les clés i18n**

Dans `messages/fr.json`, objet `infos` (après `comingSoon`) :
```json
"contactName": "Nom",
"contactEmail": "Email",
"contactMessage": "Message",
"contactSend": "Envoyer",
"contactSending": "Envoi…",
"contactSuccess": "Merci ! Votre message a bien été envoyé.",
"contactError": "L'envoi a échoué. Réessayez ou appelez-nous."
```
Dans `messages/en.json`, objet `infos` :
```json
"contactName": "Name",
"contactEmail": "Email",
"contactMessage": "Message",
"contactSend": "Send",
"contactSending": "Sending…",
"contactSuccess": "Thanks! Your message has been sent.",
"contactError": "Sending failed. Please try again or call us."
```
> Respecter les virgules JSON (ajouter une virgule après `comingSoon`).

- [ ] **Étape 5 : Typecheck + JSON valides** → `python3 -c "import json;json.load(open('messages/fr.json'));json.load(open('messages/en.json'))"` puis `npx tsc --noEmit`.
- [ ] **Étape 6 : Commit** → `git add lib/actions/contact.ts components/site/ContactForm.tsx "app/[locale]/(public)/infos/page.tsx" messages/fr.json messages/en.json && git commit -m "feat(contact): formulaire de contact /infos via Resend"`

---

### Task 5 : Vérification de bout en bout (toi + moi)

- [ ] **Email commande** : passe une commande sur `/menu` → le resto reçoit l'email (boîte de l'adresse `RESTAURANT_EMAIL`) avec le récap + 2 boutons.
- [ ] **Lien Accepter** : clique **Accepter** dans l'email → page « Commande #N acceptée » ; sur la tablette (dashboard ouvert), la commande passe en « En cuisine » **toute seule** (Realtime).
- [ ] **Token à usage unique** : re-clique le même lien → « Déjà traitée ». Pas de double action.
- [ ] **Décliner** : sur une autre commande, lien Décliner → statut `declinee`.
- [ ] **Contact** : sur `/infos`, envoie le formulaire → email reçu, message de succès affiché.
- [ ] **Robustesse** : sans `RESEND_API_KEY`, passer commande fonctionne quand même (email best-effort = pas d'envoi, pas d'erreur bloquante).

---

## Auto-revue (faite)

- **Spec §8 couverte :** email commande au resto (Task 2), liens tokenisés §7 (Task 3), formulaire contact (Task 4). ✓
- **Sécurité :** routes tokenisées en `service_role` côté serveur ; token vérifié + statut `en_attente` (usage unique de fait) ; `RESEND_API_KEY` jamais exposée au client. ✓
- **Robustesse :** email best-effort — une commande s'enregistre même si Resend tombe ; `getResend()` renvoie null si non configuré. ✓
- **Cohérence types :** `sendOrderNotification(OrderEmailData)` alimenté depuis `createOrder` ; `applyValidation(id, token, target)` partagé par les 2 routes. ✓
- **Hors périmètre (noté) :** pas de notification au client (conforme §7) ; domaine email à vérifier pour la prod (test = onboarding@resend.dev → boîte du compte).
