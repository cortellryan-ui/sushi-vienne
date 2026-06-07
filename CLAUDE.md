# CLAUDE.md — Sushi Smile

> Site vitrine + commande en ligne (sans paiement) pour le restaurant de sushi **Sushi Smile**, à Vienne (38200). Projet réalisé par Velios AI. *(Le dossier de travail s'appelle « sushi vienne » pour des raisons historiques ; la marque officielle est « Sushi Smile ».)*

Ce fichier est la source de vérité du projet. Respecte-le strictement. Si une décision n'est pas couverte ici, demande avant d'improviser.

---

## 1. Contexte & objectif

**Sushi Smile** est un restaurant de sushi à emporter situé au **4 rue du 11 Novembre, 38200 Vienne**. Tél : **04 26 05 79 62**. Déjà présent sur Uber Eats.

Le site a deux buts :
1. **Vitrine** : présenter le restaurant, les plats, les horaires, l'adresse.
2. **Commande en ligne directe** (retrait uniquement, **sans paiement en ligne** — paiement sur place au retrait), pour éviter les commissions des plateformes.

Le restaurant gère les commandes entrantes via une **tablette posée au comptoir** (mode kiosque, dashboard temps réel) et reçoit aussi un **email** à chaque commande. Chaque commande doit être **explicitement acceptée ou déclinée** avant de partir en cuisine.

---

## 2. Stack technique

- **Next.js 14** (App Router, Server Components par défaut, Server Actions)
- **TypeScript** (strict)
- **Tailwind CSS**
- **shadcn/ui** (composants UI)
- **Supabase** (Postgres + Auth + Realtime + Storage)
- **Resend** (emails transactionnels : nouvelle commande au resto, formulaire de contact)
- **next-intl** (i18n FR/EN)
- **Lucide** (icônes)

Hébergement cible : Vercel (front) + Supabase (backend). Conventions : composants en `PascalCase`, hooks `useXxx`, fichiers de route App Router standard.

---

## 3. Direction artistique (DA)

Univers **street-food japonaise** : chaleureux, gourmand, accessible. **PAS** de sushi luxe/minimaliste épuré. Le visuel (photos des plats et du lieu) porte l'expérience — mettre les photos en grand et en valeur partout.

### Palette

| Rôle | Couleur | Hex |
|------|---------|-----|
| Accent principal (dégradé) | Orange vif → rouge-orangé | `#F26522` → `#E63312` |
| Noir profond (header/footer, contrastes) | Noir | `#0A0A0A` |
| Fond clair | Blanc cassé / texturé | `#FAF7F2` |
| Texte principal | Quasi-noir | `#1A1A1A` |
| Accents secondaires | Rouge tomate / verts frais (herbes, avocat) | usage ponctuel |

- **CTA et accents** : toujours le dégradé orange `#F26522 → #E63312`.
- **Header / footer** : fond noir `#0A0A0A`.
- Le bouton **Commander** est en accent orange, toujours visible dans le header.

### Logo & identité
- Logo : maki stylisé souriant + baguettes (fourni par le client, à placer dans `/public/logo`).
- Typographie titres : impactante, façon "blocky/arcade" japonaise pop. Choisir une Google Font proche (ex. *Bungee*, *Russo One*) pour les gros titres ; texte courant en sans-serif lisible (ex. *Inter*).

---

## 4. Architecture des pages

### Pages publiques

```
/                  Accueil
/menu              Carte + commande (panier latéral + checkout)
/le-restaurant     Galerie photos, ambiance, présentation
/infos             Horaires, adresse + map, tel, Uber Eats, formulaire contact
```

### Pages admin (protégées par Supabase Auth)

```
/admin             Login
/admin/commandes   Dashboard tablette temps réel + validation des commandes
/admin/menu        Gestion catégories / plats / prix / dispo / photos
```

Toutes les pages publiques sont **bilingues FR/EN** (FR par défaut). Switch de langue dans le header. L'admin peut rester FR uniquement.

---

### `/` Accueil
- **Hero** : grande photo (plat signature / plateau), logo, accroche courte, bouton **Commander** (orange) + bouton secondaire "Voir la carte".
- **Bandeau infos rapides** : badge **Ouvert / Fermé en temps réel** + horaires du jour, adresse, téléphone cliquable.
- **Aperçu menu** : 3-4 catégories phares avec une photo chacune → lien `/menu`.
- **Section ambiance** : 2-3 photos du resto + accroche → lien `/le-restaurant`.
- **Bandeau Uber Eats** : "Aussi disponible sur Uber Eats" + lien.
- **Footer** : adresse, horaires complets, tel, réseaux, mentions légales.

### `/menu` — Carte + commande (page centrale)
- Plats organisés **par catégories** (navigation par onglets/ancres : ex. Makis, California, Plateaux, Chauds, Boissons, Desserts — catégories réelles définies par le client via l'admin).
- Chaque plat : **photo, nom, description, prix, bouton "+ Ajouter"**.
- Badge **"Indisponible"** (et bouton désactivé) si `is_available = false`.
- **Panier** : volet latéral sur desktop ; bouton flottant "Panier · N articles · XX €" en bas sur mobile. Permet +/- quantités, suppression, voir total.
- **Checkout** (déclenché depuis le panier, en overlay/étapes) : `nom`, `téléphone`, `créneau de retrait` (créneaux valides uniquement — voir §6), `note` libre → récapitulatif → validation.
- **Page de confirmation** : numéro de commande + message "Votre commande a bien été reçue. Le restaurant doit la valider. Présentez-vous au créneau choisi pour le retrait." (Pas de notification automatique envoyée au client — voir §7.)

### `/le-restaurant`
- **Galerie photos** en grille (lieu + plats).
- Texte d'ambiance / présentation du concept.
- (Optionnel) équipe.

### `/infos`
- **Horaires complets** + badge ouvert/fermé live (voir §6).
- **Adresse** + **Google Maps embed** : 4 rue du 11 Novembre, 38200 Vienne.
- **Téléphone** cliquable : 04 26 05 79 62.
- Lien **Uber Eats**.
- **Formulaire de contact** (nom, email, message) → envoi email au resto via Resend.

### `/admin/commandes` — la tablette
- Conçu pour une **tablette en mode kiosque**, écran toujours allumé.
- **Temps réel** via Supabase Realtime (abonnement aux inserts/updates de `orders`).
- **Alerte sonore** déclenchée à chaque nouvelle commande (`status = 'en_attente'`).
- Vue par statut / colonnes : **À valider** · En cuisine · Prêtes · Terminées.
- **Carte commande** lisible à distance (gros texte, façon ticket) : numéro, nom, téléphone, créneau de retrait, liste des articles + quantités, note, total.
- Boutons tactiles : **Accepter** / **Décliner** (sur les commandes `en_attente`), puis **Prête**, puis **Terminée**.

### `/admin/menu`
- Gestion **catégories** : créer, renommer, réordonner (`display_order`), activer/désactiver.
- Gestion **plats** par catégorie : créer/éditer (nom, description, prix, photo, dispo), réordonner, supprimer.
- **Upload photo** vers Supabase Storage.
- C'est **le client** qui gère le menu lui-même dès la v1.

---

## 5. Modèle de données (Supabase)

```
categories
  id            uuid PK
  name          text
  slug          text unique
  display_order int
  is_active     bool default true
  created_at    timestamptz default now()

products
  id            uuid PK
  category_id   uuid FK -> categories(id)
  name          text
  description   text
  price         numeric(10,2)
  image_url     text
  is_available  bool default true
  display_order int
  allergens     text[]            -- optionnel
  created_at    timestamptz default now()

orders
  id            uuid PK
  order_number  serial / int unique     -- numéro lisible (#0042)
  customer_name text
  customer_phone text
  pickup_time   timestamptz             -- créneau de retrait choisi
  status        text default 'en_attente'
  total         numeric(10,2)
  notes         text
  validation_token text unique          -- token pour validation par email
  created_at    timestamptz default now()

order_items
  id            uuid PK
  order_id      uuid FK -> orders(id)
  product_id    uuid FK -> products(id)
  product_name  text          -- SNAPSHOT (figé au moment de la commande)
  unit_price    numeric(10,2) -- SNAPSHOT
  quantity      int

opening_hours        -- config horaires, modifiable
  id            uuid PK
  day_of_week   int           -- 0 = dimanche ... 6 = samedi
  open_time     time
  close_time    time
  -- plusieurs lignes possibles par jour (service midi + service soir)
```

### Statuts de commande
```
en_attente  →  acceptee  →  prete  →  terminee
     │
     └──────→  declinee
```
- `en_attente` : reçue, **pas encore validée** (ne part PAS en cuisine).
- `acceptee` : validée par le resto, en préparation.
- `prete` : prête à être retirée.
- `terminee` : retirée par le client.
- `declinee` : refusée par le resto.

### Snapshot prix/nom
Dans `order_items`, on **fige** `product_name` et `unit_price` au moment de la commande. Si le client modifie un prix dans l'admin ensuite, les commandes historiques restent exactes.

### RLS (Row Level Security)
- `categories`, `products` : **lecture publique** (uniquement actifs/dispo côté front).
- `orders`, `order_items` : **insert public** (le client passe commande), **lecture/update réservés à l'admin authentifié**.
- Route de validation par email : voir §7 (token, pas d'auth Supabase requise côté client email).
- `opening_hours` : lecture publique, écriture admin.

---

## 6. Horaires & créneaux de retrait

### Horaires d'ouverture
```
Lundi à Jeudi : 11h–14h  et  18h–22h
Vendredi & Samedi : 18h–22h30
Dimanche : 18h–22h
```
Stockés dans la table `opening_hours` (source de vérité, modifiable). Ne jamais les coder en dur dans la logique métier — lire depuis la table.

### Règles
- **Commande possible 24/7.** Pas de blocage de la commande hors horaires.
- **Le retrait** n'est possible **que pendant les horaires d'ouverture.**
- Le sélecteur de créneau au checkout ne propose **que des créneaux valides** :
  - Si le resto est ouvert maintenant : créneaux à partir de `maintenant + délai de préparation`.
  - Si fermé : créneaux à partir de la **prochaine ouverture**.
  - **Délai de préparation minimum** : 20 min (constante `PREP_DELAY_MINUTES`, à confirmer avec le client).
- **Badge Ouvert / Fermé en temps réel** affiché dans le header, l'accueil et `/infos`, calculé à partir de `opening_hours` et de l'heure courante (fuseau Europe/Paris).

---

## 7. Flux de commande & validation (CŒUR DU PROJET)

```
Client passe commande sur /menu
        │
        ▼
  INSERT orders (status = 'en_attente') + order_items
        │
        ├──► Dashboard tablette : carte surlignée + SON + [Accepter] / [Décliner]
        └──► Email Resend au resto : récap commande + 2 boutons [Accepter] / [Décliner]
        │
        ▼
  Le resto tranche depuis L'UN OU L'AUTRE canal
        │
   ┌────┴─────┐
   ▼          ▼
Accepter   Décliner
status=     status=
'acceptee'  'declinee'
(cuisine)
        │
        ▼
   'prete' → 'terminee'
```

### Règles de validation
- **Double canal, source unique** : tablette ET email pointent vers le **même enregistrement** Supabase. Grâce à Realtime, valider depuis l'email met à jour la tablette instantanément (et inversement). Pas de double traitement.
- **Tant que `en_attente`** : la commande n'apparaît pas comme "à préparer". Rien ne part en cuisine avant l'acceptation explicite.
- **Validation par email** = lien sécurisé par token :
  - `GET /api/orders/[id]/accept?token=...`
  - `GET /api/orders/[id]/decline?token=...`
  - Le `validation_token` est unique par commande. Au clic → mise à jour du statut → page de confirmation simple ("Commande #0042 acceptée / déclinée").
  - Le token devient invalide une fois la commande sortie de `en_attente` (évite double action).

### Notifications client
- **AUCUNE notification automatique au client** (ni email, ni SMS).
- Si le resto **décline**, il appelle le client via le numéro fourni (manuel).
- Le client voit seulement la **page de confirmation** au moment de la commande.

---

## 8. Emails (Resend)

1. **Nouvelle commande** → email au resto à chaque commande `en_attente` : récap (numéro, nom, tel, créneau, articles, total, note) + boutons **Accepter** / **Décliner** (liens tokenisés §7).
2. **Formulaire de contact** (`/infos`) → email au resto avec le message.

Adresse de réception resto : à définir dans `.env`. Pas d'email envoyé au client.

---

## 9. Internationalisation (i18n)

- `next-intl`, locales `fr` (défaut) et `en`.
- Tout le contenu public traduit. Les **noms/descriptions de plats** : prévoir des champs traduisibles OU laisser le client gérer en FR seulement en v1 (à confirmer — par défaut, **textes d'interface bilingues**, contenu menu en FR avec possibilité d'étendre).
- Switch de langue dans le header.

---

## 10. Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESTAURANT_EMAIL=            # destinataire des commandes & contact
NEXT_PUBLIC_SITE_URL=
PREP_DELAY_MINUTES=20
```

---

## 11. Assets

- **Photos** des plats et du restaurant : fournies par le client (nombreuses). À placer dans Supabase Storage (plats, liés aux `products.image_url`) et `/public` (photos vitrine/galerie/hero).
- **Logo** : maki souriant, dans `/public/logo`.
- ⚠️ Les photos ne sont pas encore toutes fournies — prévoir des placeholders propres en attendant.

---

## 12. Conventions & règles de travail

- App Router, **Server Components** par défaut ; `"use client"` seulement si nécessaire (panier, dashboard temps réel, formulaires interactifs).
- **Server Actions** pour les mutations simples ; **Route Handlers** (`/api/...`) pour les endpoints tokenisés (validation email).
- Validation des données avec **Zod**.
- Composants UI via **shadcn/ui** ; ne pas réinventer ce que shadcn fournit.
- Accessibilité : boutons admin gros et tactiles (tablette), contrastes respectés.
- Mobile-first sur le public (la majorité des commandes seront sur mobile).
- Code et commentaires en **français**.
- Ne pas ajouter de paiement en ligne (hors scope v1).
- Demander avant toute dépendance lourde non listée ici.

---

## 13. Phasage

**v1 (scope actuel)**
- Vitrine complète (4 pages publiques, bilingue, badge ouvert/fermé).
- Menu + commande + checkout (retrait, sans paiement).
- Flux de validation double canal (tablette + email).
- Admin : dashboard commandes temps réel + gestion menu par le client.
- Emails Resend (commande + contact).

**Phase 2 (idées, hors scope v1)**
- Paiement en ligne (Stripe).
- Livraison.
- Programme de fidélité.
- Statistiques de ventes dans l'admin.
