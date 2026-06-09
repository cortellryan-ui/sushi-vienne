# Plan 3 — Admin réel : connexion + dashboard temps réel + validation

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development ou executing-plans.

**Goal:** Le restaurant se connecte (Supabase Auth), accède en exclusivité à `/admin/commandes`, y voit les vraies commandes arriver en temps réel (avec son), et les traite (Accepter / Décliner / Prête / Terminée) — les changements s'écrivant en base.

**Architecture:** Le middleware rafraîchit la session Supabase (cookies). Le login utilise le client navigateur (`signInWithPassword`). Les pages admin protégées appellent `requireUser()` (Server Component) → redirection vers `/admin` si pas de session. Le dashboard charge les commandes côté serveur (RLS `authenticated`), puis un client s'abonne au Realtime de `orders` et **re-fetch** à chaque changement (simple et robuste pour une tablette unique). Les transitions de statut passent par des Server Actions (RLS `authenticated`).

**Tech Stack:** Supabase Auth + Realtime (@supabase/ssr), Next.js middleware + Server Actions, next 14.

**Périmètre :** admin **FR uniquement** (CLAUDE.md §4) → redirections vers `/admin` non localisées. La page `/admin/menu` reste la maquette existante mais devient **protégée** (la gestion du menu est un chantier ultérieur).

---

### Task 0 : Créer l'utilisateur de connexion du resto (action manuelle — toi)

- [ ] Supabase → **Authentication** → **Users** → **Add user** → **Create new user**.
- [ ] Email (ex. `resto@sushismile.fr`) + mot de passe fort. **Coche « Auto Confirm User »** (sinon connexion impossible sans email de confirmation).
- [ ] Garde ces identifiants : c'est avec eux que le resto se connectera.

---

### Task 1 : Rafraîchissement de session dans le middleware

**Fichiers :** Modify `middleware.ts`

- [ ] **Étape 1 : Remplacer `middleware.ts`** (combine next-intl + refresh Supabase)

```ts
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. next-intl produit la réponse (redirections/rewrite de locale).
  const response = intlMiddleware(request);

  // 2. On greffe le rafraîchissement de la session Supabase sur cette réponse.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  await supabase.auth.getUser(); // rafraîchit le token si nécessaire

  return response;
}

export const config = {
  matcher: ["/", "/(fr|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Étape 2 : Typecheck** → `npx tsc --noEmit` → exit 0.
- [ ] **Étape 3 : Le site public charge toujours** → `npm run dev`, ouvrir `/menu` → 200, menu visible.
- [ ] **Étape 4 : Commit** → `git add middleware.ts && git commit -m "feat(auth): rafraîchissement de session Supabase dans le middleware"`

---

### Task 2 : Helpers d'authentification

**Fichiers :** Create `lib/supabase/auth.ts`

- [ ] **Étape 1 : Écrire `lib/supabase/auth.ts`**

```ts
import { redirect } from "next/navigation";
import { createClient } from "./server";

/** Utilisateur courant (ou null) — pour Server Components / Actions. */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Exige une session ; redirige vers la page de connexion admin sinon. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin");
  return user;
}
```

- [ ] **Étape 2 : Typecheck** → exit 0.
- [ ] **Étape 3 : Commit** → `git add lib/supabase/auth.ts && git commit -m "feat(auth): helpers getCurrentUser / requireUser"`

---

### Task 3 : Page de connexion fonctionnelle

**Fichiers :**
- Create `components/admin/AdminLoginForm.tsx`
- Modify `app/[locale]/(admin)/admin/page.tsx`

- [ ] **Étape 1 : Créer `components/admin/AdminLoginForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(true);
      return;
    }
    router.push("/admin/commandes");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="resto@sushismile.fr"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      {error && (
        <p className="text-sm font-medium text-red-600">
          Email ou mot de passe incorrect.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        <LogIn /> {loading ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
```

- [ ] **Étape 2 : Remplacer le `<form>` maquette dans `app/[locale]/(admin)/admin/page.tsx`**

Remplacer l'import et le `<form>...</form>` + la note maquette par le composant. Le fichier devient :

```tsx
import { setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  // Déjà connecté → directement au dashboard.
  if (await getCurrentUser()) redirect("/admin/commandes");

  return (
    <div className="grid place-items-center px-4 py-16">
      <div className="w-full max-w-sm rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-gradient text-2xl">
            🍣
          </span>
          <h1 className="font-display text-2xl">Espace restaurant</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connectez-vous pour gérer les commandes et le menu.
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
```

- [ ] **Étape 3 : Typecheck** → exit 0.
- [ ] **Étape 4 : Commit** → `git add components/admin/AdminLoginForm.tsx "app/[locale]/(admin)/admin/page.tsx" && git commit -m "feat(auth): page de connexion admin fonctionnelle (Supabase)"`

---

### Task 4 : Couche données admin + actions de statut

**Fichiers :**
- Create `lib/data/admin-orders.ts`
- Create `lib/actions/admin-orders.ts`

- [ ] **Étape 1 : Créer `lib/data/admin-orders.ts`** (lecture des commandes pour l'admin)

```ts
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

export type AdminOrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type AdminOrder = {
  id: string;
  number: number;
  customerName: string;
  customerPhone: string;
  pickupTime: string; // ISO
  createdAt: string; // ISO
  status: OrderStatus;
  notes: string | null;
  total: number;
  items: AdminOrderItem[];
};

/** Toutes les commandes (récentes d'abord) avec leurs lignes — pour le dashboard. */
export async function getAdminOrders(): Promise<AdminOrder[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, pickup_time, created_at, status, notes, total, order_items ( product_name, quantity, unit_price )",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Lecture commandes: ${error.message}`);

  return (data ?? []).map((o) => ({
    id: o.id,
    number: o.order_number,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    pickupTime: o.pickup_time,
    createdAt: o.created_at,
    status: o.status as OrderStatus,
    notes: o.notes,
    total: Number(o.total),
    items: (o.order_items ?? []).map(
      (i: { product_name: string; quantity: number; unit_price: number }) => ({
        name: i.product_name,
        quantity: i.quantity,
        unitPrice: Number(i.unit_price),
      }),
    ),
  }));
}
```

- [ ] **Étape 2 : Créer `lib/actions/admin-orders.ts`** (Server Actions)

```ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminOrders, type AdminOrder } from "@/lib/data/admin-orders";
import type { OrderStatus } from "@/lib/types";

const ALLOWED: OrderStatus[] = [
  "en_attente",
  "acceptee",
  "prete",
  "terminee",
  "declinee",
];

export type ActionResult = { ok: boolean };

/** Change le statut d'une commande (réservé à l'admin connecté via RLS). */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  if (!ALLOWED.includes(status)) return { ok: false };
  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  return { ok: !error };
}

/** Re-lecture des commandes (appelée par le dashboard après un événement Realtime). */
export async function refreshAdminOrders(): Promise<AdminOrder[]> {
  return getAdminOrders();
}
```

- [ ] **Étape 3 : Typecheck** → exit 0.
- [ ] **Étape 4 : Commit** → `git add lib/data/admin-orders.ts lib/actions/admin-orders.ts && git commit -m "feat(admin): lecture des commandes + actions de statut (RLS authenticated)"`

---

### Task 5 : Dashboard temps réel (remplacer la maquette)

**Fichiers :**
- Rewrite `components/admin/AdminOrdersBoard.tsx`
- Modify `app/[locale]/(admin)/admin/commandes/page.tsx`

- [ ] **Étape 1 : Réécrire `components/admin/AdminOrdersBoard.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BellOff,
  Check,
  CircleCheck,
  Clock,
  LogOut,
  Phone,
  StickyNote,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/lib/types";
import type { AdminOrder } from "@/lib/data/admin-orders";
import { refreshAdminOrders, updateOrderStatus } from "@/lib/actions/admin-orders";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLUMNS: { key: OrderStatus; title: string; accent: string }[] = [
  { key: "en_attente", title: "À valider", accent: "text-brand" },
  { key: "acceptee", title: "En cuisine", accent: "text-amber-600" },
  { key: "prete", title: "Prêtes", accent: "text-emerald-600" },
  { key: "terminee", title: "Terminées", accent: "text-neutral-500" },
];

function beep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    /* audio indisponible */
  }
}

const DAY_MS = 86_400_000;

function pickupLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((startTarget.getTime() - startToday.getTime()) / DAY_MS);
  const time = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const day =
    days === 0
      ? "Aujourd'hui"
      : days === 1
        ? "Demain"
        : d.toLocaleDateString("fr-FR", { weekday: "long" });
  return `${day} · ${time}`;
}

function receivedLabel(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const h = Math.floor(mins / 60);
  return `il y a ${h} h`;
}

export function AdminOrdersBoard({
  initialOrders,
}: {
  initialOrders: AdminOrder[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  // Abonnement Realtime : à chaque changement sur `orders`, on re-fetch.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("orders-board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          refreshAdminOrders().then(setOrders);
          if (
            payload.eventType === "INSERT" &&
            (payload.new as { status?: string }).status === "en_attente" &&
            soundRef.current
          ) {
            beep();
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function setStatus(id: string, status: OrderStatus) {
    // Optimiste : on met à jour localement, le Realtime confirmera.
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await updateOrderStatus(id, status);
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin");
    router.refresh();
  }

  const pendingCount = orders.filter((o) => o.status === "en_attente").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Commandes</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount > 0
              ? `${pendingCount} commande(s) à valider`
              : "Aucune commande en attente"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSoundOn((s) => !s)}>
            {soundOn ? <Bell /> : <BellOff />}
            {soundOn ? "Son activé" : "Son coupé"}
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut /> Déconnexion
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const list = orders.filter((o) => o.status === col.key);
          return (
            <div key={col.key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className={cn("font-display text-lg", col.accent)}>
                  {col.title}
                </h2>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-semibold tabular-nums shadow-sm">
                  {list.length}
                </span>
              </div>
              {list.length === 0 && (
                <p className="rounded-2xl border border-dashed bg-white/50 py-8 text-center text-sm text-muted-foreground">
                  —
                </p>
              )}
              {list.map((o) => (
                <OrderCard key={o.id} order={o} onStatus={setStatus} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onStatus,
}: {
  order: AdminOrder;
  onStatus: (id: string, status: OrderStatus) => void;
}) {
  const isPending = order.status === "en_attente";
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm",
        isPending && "ring-2 ring-brand",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="font-display text-xl">#{order.number}</span>
        <span className="text-xs text-muted-foreground">
          {receivedLabel(order.createdAt)}
        </span>
      </div>
      <p className="mt-1 font-semibold">{order.customerName}</p>
      <a
        href={`tel:${order.customerPhone.replace(/\s/g, "")}`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-brand"
      >
        <Phone className="size-3.5" /> {order.customerPhone}
      </a>
      <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-cream px-2.5 py-1 text-sm font-medium">
        <Clock className="size-4 text-brand" /> {pickupLabel(order.pickupTime)}
      </p>
      <ul className="mt-3 space-y-1 border-t pt-3 text-sm">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex justify-between gap-2">
            <span>
              <span className="font-semibold tabular-nums">{i.quantity}×</span> {i.name}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {formatPrice(i.unitPrice * i.quantity, "fr")}
            </span>
          </li>
        ))}
      </ul>
      {order.notes && (
        <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-sm text-amber-800">
          <StickyNote className="mt-0.5 size-3.5 shrink-0" /> {order.notes}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-display text-lg">
          {formatPrice(order.total, "fr")}
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        {order.status === "en_attente" && (
          <>
            <Button size="sm" className="flex-1" onClick={() => onStatus(order.id, "acceptee")}>
              <Check /> Accepter
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onStatus(order.id, "declinee")}>
              <X /> Décliner
            </Button>
          </>
        )}
        {order.status === "acceptee" && (
          <Button size="sm" className="flex-1" variant="ink" onClick={() => onStatus(order.id, "prete")}>
            <CircleCheck /> Marquer prête
          </Button>
        )}
        {order.status === "prete" && (
          <Button size="sm" className="flex-1" variant="outline" onClick={() => onStatus(order.id, "terminee")}>
            <Check /> Terminée
          </Button>
        )}
        {order.status === "terminee" && (
          <p className="w-full text-center text-sm text-emerald-600">✓ Retirée</p>
        )}
        {order.status === "declinee" && (
          <p className="w-full text-center text-sm text-red-600">✕ Déclinée</p>
        )}
      </div>
    </div>
  );
}
```

> Note : la colonne « Terminées » n'affiche pas les `declinee`. Les commandes déclinées disparaissent des 4 colonnes (statut hors colonnes) — acceptable en v1 (historique consultable en base). Si besoin, on ajoutera une vue « Déclinées » plus tard.

- [ ] **Étape 2 : Protéger + brancher `app/[locale]/(admin)/admin/commandes/page.tsx`**

```tsx
import { setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/supabase/auth";
import { getAdminOrders } from "@/lib/data/admin-orders";
import { AdminOrdersBoard } from "@/components/admin/AdminOrdersBoard";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  await requireUser();
  const orders = await getAdminOrders();
  return <AdminOrdersBoard initialOrders={orders} />;
}
```

- [ ] **Étape 3 : Typecheck** → exit 0. (Le mock `lib/mock-orders.ts` n'est plus importé par le board ; le laisser si `AdminMenuManager` ou d'autres l'utilisent — vérifier les imports résiduels.)
- [ ] **Étape 4 : Commit** → `git add components/admin/AdminOrdersBoard.tsx "app/[locale]/(admin)/admin/commandes/page.tsx" && git commit -m "feat(admin): dashboard commandes temps réel (Realtime) + actions de statut"`

---

### Task 6 : Protéger `/admin/menu`

**Fichiers :** Modify `app/[locale]/(admin)/admin/menu/page.tsx`

- [ ] **Étape 1 : Ajouter la protection** en tête du composant (après `setRequestLocale`) :

```tsx
import { requireUser } from "@/lib/supabase/auth";
// ...
export default async function AdminMenuPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  await requireUser();
  // ... reste inchangé
}
```

> Si la page n'est pas `async`, la rendre `async` et ajouter `await requireUser();`.

- [ ] **Étape 2 : Typecheck** → exit 0.
- [ ] **Étape 3 : Commit** → `git add "app/[locale]/(admin)/admin/menu/page.tsx" && git commit -m "feat(admin): protège /admin/menu derrière l'authentification"`

---

### Task 7 : Vérification de bout en bout (toi + moi)

- [ ] **Routes protégées** : déconnecté, ouvrir `/admin/commandes` → redirige vers `/admin` (login). (Je vérifie via curl que `/admin/commandes` répond par une redirection.)
- [ ] **Connexion** : sur `/admin`, saisir l'email/mot de passe créés (Task 0) → arrive sur le dashboard, qui affiche les **vraies commandes** existantes (dont la n° 2).
- [ ] **Temps réel** : garder le dashboard ouvert ; dans un autre onglet, passer une commande sur `/menu`. → elle **apparaît** dans « À valider » avec un **bip**, sans recharger.
- [ ] **Validation** : cliquer **Accepter** → la carte passe en « En cuisine » ; vérifier dans Supabase que `status = acceptee`. Idem **Décliner** (`declinee`), **Prête**, **Terminée**.
- [ ] **Déconnexion** : bouton Déconnexion → retour login ; `/admin/commandes` re-protégée.

---

## Auto-revue (faite)

- **Spec §4.6 couverte :** connexion Supabase (Task 1-3), accès exclusif via `requireUser` (Task 5-6), dashboard temps réel + son (Task 5), boutons de statut branchés (Task 4-5). ✓
- **Sécurité :** RLS `authenticated` pour lecture/maj `orders` ; middleware rafraîchit la session ; pas de service_role côté navigateur. ✓
- **Cohérence types :** `AdminOrder`/`AdminOrderItem` définis dans `lib/data/admin-orders.ts`, consommés par le board et les actions. `updateOrderStatus(id, status)` / `refreshAdminOrders()` signatures stables. ✓
- **Dépendances Realtime :** `orders` est déjà dans la publication `supabase_realtime` (schema.sql). ✓
- **Hors périmètre (noté) :** validation par email tokenisée (Plan 4) ; vue dédiée des commandes déclinées ; gestion du menu par le resto (chantier ultérieur). `lib/mock-orders.ts` conservé tant qu'il sert ailleurs.
