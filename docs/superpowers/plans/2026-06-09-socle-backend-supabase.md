# Socle backend Supabase — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brancher un vrai backend Supabase : commandes enregistrées, admin réel (accept/décline), email resto — avec le schéma préparé pour le paiement Stripe à venir.

**Architecture:** Next.js 14 (App Router, Server Components + Server Actions) lit/écrit dans Postgres via Supabase. La sécurité repose sur la RLS (lecture publique du menu, commandes en insertion publique mais lecture/écriture réservées à l'admin connecté). Les actions tokenisées (email) passent par des Route Handlers serveur avec le client `service role`.

**Tech Stack:** Next.js 14, TypeScript, Supabase (Postgres + Auth + Realtime), Resend, Zod, next-intl.

---

## Note sur les tests

Le projet n'a **pas de framework de test** (aucun script `test`, pas de Vitest/Jest), et l'essentiel de ce socle est de l'**intégration** avec un service externe (Supabase) difficile à tester unitairement sans infra. Ce plan utilise donc une **vérification manuelle explicite** (lancer `npm run dev`, observer le résultat) pour les parties intégration. Les parties de **logique pure** (validation Zod, recalcul du total — plans 2+) recevront des tests unitaires ciblés, avec mise en place de Vitest à ce moment-là.

## Découpage en plans séquentiels

Le socle est livré en 4 plans, chacun produisant quelque chose de fonctionnel :

| Plan | Contenu | Résultat testable |
|---|---|---|
| **1 (ce document)** | Projet Supabase + schéma complet + RLS + seed + menu lu depuis la base | Le site affiche le menu **réel** depuis Postgres |
| 2 | Enregistrement des commandes (Zod + Server Action + page confirmation) | Une commande passée s'**enregistre** en base |
| 3 | Admin réel : connexion (Auth) + dashboard temps réel + accept/décline | Le resto **gère** ses commandes pour de vrai |
| 4 | Email Resend (nouvelle commande) + liens tokenisés accepter/décliner | Le resto est **prévenu** et valide depuis l'email |

Puis chantier séparé : **paiement Stripe** (option A, Checkout hébergé).

> Le **schéma SQL du Plan 1 crée déjà TOUTES les tables** (orders, order_items, opening_hours) **et les colonnes paiement**, pour ne pas avoir à migrer ensuite. Les plans 2-4 ne font que brancher du code dessus.

---

# PLAN 1 — Fondations Supabase & menu en base

## Structure des fichiers

- Create: `supabase/schema.sql` — schéma complet (toutes les tables + colonnes paiement)
- Create: `supabase/policies.sql` — activation RLS + policies
- Create: `supabase/seed.sql` — menu de départ (catégories + plats) + horaires
- Create: `.env.local` — clés réelles (rempli par toi, jamais committé)
- Create: `lib/category-emoji.ts` — emojis par **slug** de catégorie (remplace la table de `mock-data.ts` keyée par id)
- Create: `lib/data/menu.ts` — accès données : `getMenu()` lit Supabase et renvoie la même forme que `getMockMenu()`
- Modify: `app/[locale]/(public)/menu/page.tsx` — utilise `getMenu()` au lieu de `getMockMenu()`
- Modify: `components/menu/MenuClient.tsx` — emoji par `category.slug` au lieu de `category.id`

`lib/mock-data.ts` est **conservé** pour l'instant (l'admin `AdminMenuManager.tsx` l'utilise encore — il sera traité dans un chantier ultérieur « gestion du menu »).

---

### Task 0 : Créer le projet Supabase (action manuelle — toi)

**Fichiers :** `.env.local` (création)

- [ ] **Étape 1 : Créer le compte et le projet**

1. Va sur https://supabase.com → **Sign in** (avec GitHub ou email).
2. **New project** → Organisation perso → Name : `sushi-smile` → **Database Password** : génère-en un fort et **garde-le** → **Region : `West EU (Paris)`** → Create.
3. Attends ~2 min que le projet se provisionne.

- [ ] **Étape 2 : Récupérer les clés**

Dans le projet → **Project Settings** (roue dentée) → **API** :
- copie **Project URL**
- copie **anon public** key
- copie **service_role** key (⚠️ secrète — ne jamais l'exposer côté client)

- [ ] **Étape 3 : Créer `.env.local`**

À la racine du projet, crée `.env.local` (copie de `.env.example`) et renseigne :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PREP_DELAY_MINUTES=20
```

(`RESEND_API_KEY` et `RESTAURANT_EMAIL` seront ajoutés au Plan 4.)

- [ ] **Étape 4 : Vérifier que `.env.local` est ignoré par git**

Run: `git check-ignore .env.local`
Expected: la commande affiche `.env.local` (donc bien ignoré). Si rien ne s'affiche, ajoute `.env.local` à `.gitignore`.

---

### Task 1 : Schéma de base de données

**Fichiers :** Create `supabase/schema.sql`

- [ ] **Étape 1 : Écrire `supabase/schema.sql`**

```sql
-- Schéma Sushi Smile — conforme à CLAUDE.md §5, avec colonnes paiement préparées.
-- À exécuter dans Supabase → SQL Editor.

create extension if not exists "pgcrypto";

-- Catégories du menu
create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  display_order int  not null default 0,
  is_active     bool not null default true,
  created_at    timestamptz not null default now()
);

-- Plats
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references categories(id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(10,2) not null,
  image_url     text,
  is_available  bool not null default true,
  display_order int  not null default 0,
  allergens     text[],
  created_at    timestamptz not null default now()
);
create index if not exists products_category_idx on products(category_id);

-- Commandes
create sequence if not exists order_number_seq start 1;
create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    int  not null unique default nextval('order_number_seq'),
  customer_name   text not null,
  customer_phone  text not null,
  pickup_time     timestamptz not null,
  status          text not null default 'en_attente'
                    check (status in ('en_attente','acceptee','prete','terminee','declinee')),
  total           numeric(10,2) not null,
  notes           text,
  -- Préparation paiement (chantier Stripe ultérieur)
  payment_method  text not null default 'sur_place'
                    check (payment_method in ('sur_place','en_ligne')),
  payment_status  text not null default 'non_paye'
                    check (payment_status in ('non_paye','autorise','paye','annule','rembourse')),
  stripe_payment_intent_id text,
  validation_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_at      timestamptz not null default now()
);

-- Lignes de commande (snapshot nom + prix figés)
create table if not exists order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  product_id    uuid references products(id) on delete set null,
  product_name  text not null,
  unit_price    numeric(10,2) not null,
  quantity      int  not null check (quantity > 0)
);
create index if not exists order_items_order_idx on order_items(order_id);

-- Horaires d'ouverture (plusieurs lignes par jour possibles : midi + soir)
create table if not exists opening_hours (
  id            uuid primary key default gen_random_uuid(),
  day_of_week   int  not null check (day_of_week between 0 and 6), -- 0 = dimanche
  open_time     time not null,
  close_time    time not null
);
```

- [ ] **Étape 2 : Exécuter le schéma**

Dans Supabase → **SQL Editor** → **New query** → colle le contenu de `supabase/schema.sql` → **Run**.
Expected: `Success. No rows returned.`

- [ ] **Étape 3 : Vérifier les tables**

Dans Supabase → **Table Editor** : tu dois voir `categories`, `products`, `orders`, `order_items`, `opening_hours`.

- [ ] **Étape 4 : Commit**

```bash
git add supabase/schema.sql
git commit -m "feat(db): schéma Supabase complet (tables + colonnes paiement)"
```

---

### Task 2 : Sécurité (RLS + policies)

**Fichiers :** Create `supabase/policies.sql`

- [ ] **Étape 1 : Écrire `supabase/policies.sql`**

```sql
-- RLS Sushi Smile. À exécuter APRÈS schema.sql.

alter table categories    enable row level security;
alter table products      enable row level security;
alter table opening_hours enable row level security;
alter table orders        enable row level security;
alter table order_items   enable row level security;

-- Menu + horaires : lecture publique (le front filtre actifs/dispo)
create policy "lecture publique categories"
  on categories for select using (true);
create policy "lecture publique products"
  on products for select using (true);
create policy "lecture publique horaires"
  on opening_hours for select using (true);

-- Écriture menu/horaires : admin connecté uniquement
create policy "ecriture admin categories"
  on categories for all to authenticated using (true) with check (true);
create policy "ecriture admin products"
  on products for all to authenticated using (true) with check (true);
create policy "ecriture admin horaires"
  on opening_hours for all to authenticated using (true) with check (true);

-- Commandes : insertion publique (le client commande)
create policy "insertion publique orders"
  on orders for insert to anon, authenticated with check (true);
create policy "insertion publique order_items"
  on order_items for insert to anon, authenticated with check (true);

-- Commandes : lecture + mise à jour réservées à l'admin connecté
create policy "lecture admin orders"
  on orders for select to authenticated using (true);
create policy "maj admin orders"
  on orders for update to authenticated using (true) with check (true);
create policy "lecture admin order_items"
  on order_items for select to authenticated using (true);
```

> Note : les liens tokenisés de l'email (Plan 4) utiliseront le client **service role** (`createAdminClient()`), qui **contourne la RLS** — ils ne dépendent donc pas de ces policies.

- [ ] **Étape 2 : Exécuter les policies**

Supabase → SQL Editor → New query → colle `supabase/policies.sql` → Run.
Expected: `Success. No rows returned.`

- [ ] **Étape 3 : Vérifier**

Table Editor → chaque table affiche un cadenas **« RLS enabled »**. Dans **Authentication → Policies**, les policies ci-dessus apparaissent.

- [ ] **Étape 4 : Commit**

```bash
git add supabase/policies.sql
git commit -m "feat(db): RLS et policies (lecture publique menu, commandes admin)"
```

---

### Task 3 : Menu de départ (seed)

**Fichiers :** Create `supabase/seed.sql`

- [ ] **Étape 1 : Écrire `supabase/seed.sql`** (reprend le menu de la maquette `mock-data.ts`)

```sql
-- Menu de départ Sushi Smile. Idempotent grâce aux slugs uniques.

insert into categories (name, slug, display_order) values
  ('Makis',      'makis',      1),
  ('California', 'california', 2),
  ('Sushi',      'sushi',      3),
  ('Sashimi',    'sashimi',    4),
  ('Plateaux',   'plateaux',   5),
  ('Chauds',     'chauds',     6),
  ('Boissons',   'boissons',   7),
  ('Desserts',   'desserts',   8)
on conflict (slug) do nothing;

-- Helper : insère un plat en référençant la catégorie par slug
insert into products (category_id, name, description, price, is_available, display_order)
select c.id, v.name, v.description, v.price, v.is_available, v.display_order
from (values
  ('makis','Maki Saumon','6 pièces · riz, saumon frais, nori',4.9,true,1),
  ('makis','Maki Thon','6 pièces · riz, thon, nori',5.5,true,2),
  ('makis','Maki Concombre','6 pièces · riz, concombre, nori',3.9,true,3),
  ('makis','Maki Avocat','6 pièces · riz, avocat, nori',4.2,true,4),
  ('makis','Maki Saumon Avocat','6 pièces · saumon, avocat',5.2,true,5),
  ('california','California Saumon Avocat','6 pièces · saumon, avocat, sésame',5.9,true,1),
  ('california','California Thon Cuit','6 pièces · thon cuit, mayo, ciboulette',5.9,true,2),
  ('california','California Crevette Tempura','6 pièces · crevette croustillante, avocat',6.5,true,3),
  ('california','California Végétarien','6 pièces · avocat, concombre, mangue',5.5,true,4),
  ('sushi','Sushi Saumon','2 pièces · saumon frais sur riz vinaigré',3.9,true,1),
  ('sushi','Sushi Thon','2 pièces · thon rouge sur riz vinaigré',4.5,true,2),
  ('sushi','Sushi Daurade','2 pièces · daurade sur riz vinaigré',4.2,true,3),
  ('sushi','Sushi Crevette','2 pièces · crevette sur riz vinaigré',4.2,true,4),
  ('sashimi','Sashimi Saumon','9 tranches de saumon frais',8.9,true,1),
  ('sashimi','Sashimi Thon','9 tranches de thon rouge',10.9,true,2),
  ('sashimi','Assortiment Sashimi','saumon, thon, daurade — 15 tranches',13.9,true,3),
  ('plateaux','Plateau Découverte','24 pièces · makis, california, sushi',16.9,true,1),
  ('plateaux','Plateau Saumon Lover','28 pièces · 100% saumon',21.9,true,2),
  ('plateaux','Plateau Mixte','36 pièces · l''assortiment complet',27.9,true,3),
  ('plateaux','Plateau Famille','54 pièces · à partager',39.9,true,4),
  ('chauds','Yakitori Poulet','2 brochettes poulet, sauce teriyaki',5.5,true,1),
  ('chauds','Gyoza','6 raviolis japonais poêlés',5.9,true,2),
  ('chauds','Tempura Crevettes','5 crevettes en beignet croustillant',7.5,true,3),
  ('chauds','Nems Poulet','4 nems croustillants, sauce nuoc-mâm',5.2,false,4),
  ('boissons','Coca-Cola','33 cl',2.5,true,1),
  ('boissons','Eau minérale','50 cl',1.8,true,2),
  ('boissons','Thé vert glacé','33 cl',2.8,true,3),
  ('boissons','Ramune','Limonade japonaise à la bille · 20 cl',3.5,true,4),
  ('desserts','Mochi (x2)','Pâte de riz glacée · parfums variés',4.5,true,1),
  ('desserts','Perles de Coco','3 pièces · pâte de riz, noix de coco',3.9,true,2),
  ('desserts','Salade de fruits frais','mangue, litchi, ananas',4.2,true,3)
) as v(cat_slug, name, description, price, is_available, display_order)
join categories c on c.slug = v.cat_slug
where not exists (
  select 1 from products p where p.name = v.name
);

-- Horaires (CLAUDE.md §6) : 0=dim .. 6=sam
insert into opening_hours (day_of_week, open_time, close_time) values
  (1,'11:00','14:00'),(1,'18:00','22:00'),
  (2,'11:00','14:00'),(2,'18:00','22:00'),
  (3,'11:00','14:00'),(3,'18:00','22:00'),
  (4,'11:00','14:00'),(4,'18:00','22:00'),
  (5,'18:00','22:30'),
  (6,'18:00','22:30'),
  (0,'18:00','22:00')
on conflict do nothing;
```

- [ ] **Étape 2 : Exécuter le seed**

Supabase → SQL Editor → New query → colle `supabase/seed.sql` → Run.
Expected: `Success. Rows returned` (les insertions). 

- [ ] **Étape 3 : Vérifier**

Table Editor → `categories` : 8 lignes. `products` : 31 lignes. `opening_hours` : 10 lignes.

- [ ] **Étape 4 : Commit**

```bash
git add supabase/seed.sql
git commit -m "feat(db): seed menu de départ + horaires"
```

---

### Task 4 : Couche d'accès données (menu depuis Supabase)

**Fichiers :**
- Create: `lib/category-emoji.ts`
- Create: `lib/data/menu.ts`

- [ ] **Étape 1 : Créer `lib/category-emoji.ts`** (emoji par slug, indépendant des id DB)

```ts
/** Emoji d'illustration par slug de catégorie (placeholder tant qu'il n'y a pas de photo). */
export const CATEGORY_EMOJI: Record<string, string> = {
  makis: "🍙",
  california: "🍣",
  sushi: "🍣",
  sashimi: "🐟",
  plateaux: "🍱",
  chauds: "🍜",
  boissons: "🥤",
  desserts: "🍡",
};

/** Emoji pour un slug donné, avec secours générique. */
export function emojiForCategory(slug: string): string {
  return CATEGORY_EMOJI[slug] ?? "🍣";
}
```

- [ ] **Étape 2 : Créer `lib/data/menu.ts`** (lecture Supabase → mêmes types que la maquette)

```ts
import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/types";

export type MenuSection = { category: Category; products: Product[] };

/**
 * Menu public depuis Supabase : catégories actives triées, avec leurs plats triés.
 * Renvoie la même forme que l'ancien getMockMenu() pour un branchement transparent.
 */
export async function getMenu(): Promise<MenuSection[]> {
  const supabase = createClient();

  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("id, name, slug, display_order, is_active")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (catErr) throw new Error(`Lecture catégories: ${catErr.message}`);

  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select(
      "id, category_id, name, description, price, image_url, is_available, display_order, allergens",
    )
    .order("display_order", { ascending: true });
  if (prodErr) throw new Error(`Lecture plats: ${prodErr.message}`);

  return (categories ?? []).map((c) => ({
    category: {
      id: c.id,
      name: c.name,
      slug: c.slug,
      displayOrder: c.display_order,
      isActive: c.is_active,
    } satisfies Category,
    products: (products ?? [])
      .filter((p) => p.category_id === c.id)
      .map(
        (p): Product => ({
          id: p.id,
          categoryId: p.category_id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          imageUrl: p.image_url,
          isAvailable: p.is_available,
          displayOrder: p.display_order,
          allergens: p.allergens ?? undefined,
        }),
      ),
  }));
}
```

- [ ] **Étape 3 : Commit**

```bash
git add lib/category-emoji.ts lib/data/menu.ts
git commit -m "feat(menu): couche d'accès données Supabase pour le menu"
```

---

### Task 5 : Brancher la page menu sur la base

**Fichiers :**
- Modify: `app/[locale]/(public)/menu/page.tsx`
- Modify: `components/menu/MenuClient.tsx`

- [ ] **Étape 1 : Passer `MenuPage` en async + utiliser `getMenu()`**

Dans `app/[locale]/(public)/menu/page.tsx` :
- remplace l'import `import { getMockMenu } from "@/lib/mock-data";` par `import { getMenu } from "@/lib/data/menu";`
- rends le composant `async` et `await` le menu :

```tsx
export default async function MenuPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = useTranslations("menu");
  const menu = await getMenu();
  // ... reste inchangé : <MenuClient menu={menu} />
}
```

> `useTranslations` fonctionne dans un Server Component async avec next-intl ; conserve `setRequestLocale(locale)` en première ligne.

- [ ] **Étape 2 : `MenuClient` — emoji par slug**

Dans `components/menu/MenuClient.tsx` :
- remplace `import { CATEGORY_EMOJI } from "@/lib/mock-data";` par `import { emojiForCategory } from "@/lib/category-emoji";`
- remplace les **3** occurrences de `CATEGORY_EMOJI[category.id] ?? "🍣"` par `emojiForCategory(category.slug)` (nav, titre de section, et la prop `emoji={...}` passée à `ProductCard`).

- [ ] **Étape 3 : Vérifier la compilation**

Run: `npm run build` (ou laisse `npm run dev` recompiler)
Expected: build OK, aucune erreur TypeScript sur `menu/page.tsx` ni `MenuClient.tsx`.

- [ ] **Étape 4 : Commit**

```bash
git add "app/[locale]/(public)/menu/page.tsx" components/menu/MenuClient.tsx
git commit -m "feat(menu): la page /menu lit le menu depuis Supabase"
```

---

### Task 6 : Vérification de bout en bout

**Fichiers :** aucun (vérification manuelle)

- [ ] **Étape 1 : Lancer le site**

Run: `npm run dev`
Ouvre http://localhost:3000/fr/menu

- [ ] **Étape 2 : Vérifier l'affichage**

Expected : les 8 catégories et leurs plats s'affichent **depuis la base** (mêmes libellés/prix que le seed). « Nems Poulet » apparaît en **Indisponible** (is_available = false).

- [ ] **Étape 3 : Preuve que ça vient bien de la base**

Dans Supabase → Table Editor → `products` : change le prix d'un plat (ex. « Maki Saumon » → `9.90`) → **Save**. Recharge la page `/menu`.
Expected : le nouveau prix `9,90 €` s'affiche. (Remets l'ancien prix ensuite si tu veux.)

- [ ] **Étape 4 : Vérifier qu'aucune commande n'est lisible publiquement (RLS)**

La page `/menu` charge sans erreur même si `orders` est protégée (on ne lit pas les commandes ici). Test direct de la RLS : dans Supabase → SQL Editor, exécute en tant qu'anon n'est pas trivial ici ; ce point sera vérifié au Plan 3 (lecture admin). Pour l'instant, confirme juste que le menu s'affiche sans fuite d'autres données.

- [ ] **Étape 5 : Plan 1 terminé**

Le menu est servi depuis Supabase. Prêt pour le **Plan 2 (enregistrement des commandes)**.

---

## Auto-revue du plan (faite)

- **Couverture spec §4.1–4.4 :** Task 0 (projet), Task 1 (schéma incl. colonnes paiement), Task 2 (RLS), Task 3 (seed), Tasks 4-5 (menu depuis la base). ✓
- **§4.5 commande, §4.6 admin, §4.7 email :** couverts par les Plans 2-4 (schéma déjà prêt ici). ✓
- **Pas de placeholder :** tout le SQL et le code sont complets. ✓
- **Cohérence des types :** `getMenu()` renvoie `MenuSection[]` (`{category, products}`), forme consommée telle quelle par `MenuClient`. `emojiForCategory(slug)` utilisé partout au lieu de l'ancienne map par id. ✓
