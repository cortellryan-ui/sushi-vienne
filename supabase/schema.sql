-- =============================================================================
-- Sushi Vienne — Schéma Supabase (CLAUDE.md §5)
-- À exécuter dans le SQL Editor de Supabase sur un projet vierge.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  display_order int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references categories(id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(10,2) not null check (price >= 0),
  image_url     text,
  is_available  boolean not null default true,
  display_order int not null default 0,
  allergens     text[] default '{}',
  created_at    timestamptz not null default now()
);

create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     bigint generated always as identity, -- numéro lisible (#0042)
  customer_name    text not null,
  customer_phone   text not null,
  pickup_time      timestamptz not null,
  status           text not null default 'en_attente'
                     check (status in ('en_attente','acceptee','prete','terminee','declinee')),
  total            numeric(10,2) not null default 0,
  notes            text,
  -- Paiement (préparation chantier Stripe — option A : autorisation puis débit à l'acceptation)
  payment_method   text not null default 'sur_place'
                     check (payment_method in ('sur_place','en_ligne')),
  payment_status   text not null default 'non_paye'
                     check (payment_status in ('non_paye','autorise','paye','annule','rembourse')),
  stripe_payment_intent_id text,
  validation_token uuid not null default gen_random_uuid() unique, -- validation par email
  created_at       timestamptz not null default now()
);

create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  product_name text not null,           -- SNAPSHOT (figé à la commande)
  unit_price   numeric(10,2) not null,  -- SNAPSHOT
  quantity     int not null check (quantity > 0)
);

create table if not exists opening_hours (
  id          uuid primary key default gen_random_uuid(),
  day_of_week int not null check (day_of_week between 0 and 6), -- 0 = dimanche
  open_time   time not null,
  close_time  time not null
  -- plusieurs lignes possibles par jour (service midi + service soir)
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_orders_status on orders(status);

-- ---------------------------------------------------------------------------
-- Realtime : la tablette s'abonne aux changements de `orders`
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table orders;

-- ---------------------------------------------------------------------------
-- Row Level Security (CLAUDE.md §5)
-- ---------------------------------------------------------------------------
alter table categories    enable row level security;
alter table products      enable row level security;
alter table orders        enable row level security;
alter table order_items   enable row level security;
alter table opening_hours enable row level security;

-- Lecture publique du menu et des horaires
create policy "categories_public_read" on categories
  for select using (true);
create policy "products_public_read" on products
  for select using (true);
create policy "opening_hours_public_read" on opening_hours
  for select using (true);

-- Écriture du menu / horaires : admin authentifié uniquement
create policy "categories_admin_write" on categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "products_admin_write" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "opening_hours_admin_write" on opening_hours
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Commandes : le client (anon) peut INSÉRER, seul l'admin peut lire/modifier
create policy "orders_public_insert" on orders
  for insert with check (true);
create policy "orders_admin_read" on orders
  for select using (auth.role() = 'authenticated');
create policy "orders_admin_update" on orders
  for update using (auth.role() = 'authenticated');

create policy "order_items_public_insert" on order_items
  for insert with check (true);
create policy "order_items_admin_read" on order_items
  for select using (auth.role() = 'authenticated');

-- NB : la validation par email (accept/decline via token) passe par une Route
-- Handler côté serveur utilisant la clé service_role (contourne la RLS),
-- en vérifiant `validation_token` + statut 'en_attente'. Voir CLAUDE.md §7.

-- ---------------------------------------------------------------------------
-- Seed horaires (CLAUDE.md §6) — source de vérité une fois la base en place
-- ---------------------------------------------------------------------------
insert into opening_hours (day_of_week, open_time, close_time) values
  (1,'11:00','14:00'), (1,'18:00','22:00'),   -- Lundi
  (2,'11:00','14:00'), (2,'18:00','22:00'),   -- Mardi
  (3,'11:00','14:00'), (3,'18:00','22:00'),   -- Mercredi
  (4,'11:00','14:00'), (4,'18:00','22:00'),   -- Jeudi
  (5,'18:00','22:30'),                        -- Vendredi
  (6,'18:00','22:30'),                        -- Samedi
  (0,'18:00','22:00')                         -- Dimanche
on conflict do nothing;
