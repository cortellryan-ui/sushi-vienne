# Socle backend Supabase + préparation au paiement en ligne

**Date :** 2026-06-09
**Projet :** Sushi Smile (site vitrine + commande en ligne)
**Statut :** Design validé, prêt pour le plan d'implémentation

---

## 1. Contexte

Le site est aujourd'hui une **maquette UI complète** (pages publiques + admin), mais le
backend n'est pas branché : les commandes affichées sont fictives (`lib/mock-orders.ts`),
passer commande sur `/menu` n'enregistre rien, et les boutons Accepter/Décliner de l'admin
ne sont reliés à aucune donnée réelle.

Le client (le restaurant) souhaite à terme **ajouter le paiement en ligne** (Stripe), en
complément du paiement sur place. Le paiement en ligne retenu suit l'**option A** : la carte
est *autorisée* à la commande, puis *débitée seulement quand le resto accepte* (annulée s'il
décline). Cette mécanique exige une vraie commande en base et un vrai bouton « Accepter ».

**Conséquence :** avant Stripe, il faut un socle backend solide. Ce document décrit ce socle.
Le paiement Stripe fera l'objet d'un chantier séparé, posé par-dessus ce socle.

## 2. Objectif du chantier

Remplacer les données fictives par un **vrai backend Supabase** :
- les commandes s'enregistrent en base ;
- le resto les accepte/décline réellement depuis un espace admin protégé ;
- le resto est prévenu en temps réel (dashboard) et par email (Resend).

**Et** préparer le terrain pour Stripe : les colonnes liées au paiement sont ajoutées dès
maintenant pour ne rien avoir à refaire ensuite.

### Hors périmètre de ce chantier
- **Gestion du menu par le resto** (écran admin où le client édite catégories/plats/prix/photos) :
  reportée à un chantier ultérieur. Non bloquante pour commander ou payer. Le menu de départ
  est inséré manuellement en base.
- **Le paiement Stripe lui-même** : chantier suivant (voir §8).
- **Paiement en ligne** : aucun appel Stripe dans ce chantier ; on ne fait que préparer le schéma.

## 3. État existant (à réutiliser)

- `lib/supabase/client.ts` — client navigateur (clé anon, soumis à la RLS). **Déjà écrit, OK.**
- `lib/supabase/server.ts` — client serveur (session via cookies) + `createAdminClient()`
  (clé service role, contourne la RLS, serveur uniquement). **Déjà écrit, OK.**
- `lib/types.ts` — types métier alignés sur le schéma cible. À étendre (champs paiement).
- `lib/mock-data.ts`, `lib/mock-orders.ts` — à remplacer par des lectures Supabase.
- `.env.example` présent ; **`.env.local` manquant** (clés réelles à créer).

## 4. Composants à construire

### 4.1 Projet Supabase (action manuelle, guidée)
Création du compte + projet Supabase (région Europe pour la latence/RGPD). Récupération de :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

→ renseignées dans `.env.local` (jamais committé).

### 4.2 Schéma de base de données (script SQL fourni, exécuté dans Supabase)
Tables conformes au `CLAUDE.md` §5 : `categories`, `products`, `orders`, `order_items`,
`opening_hours`.

**Ajouts dès maintenant sur `orders` (préparation Stripe) :**
| Colonne | Type | Rôle |
|---|---|---|
| `payment_method` | text (`sur_place` \| `en_ligne`) | mode choisi par le client |
| `payment_status` | text (`non_paye` \| `autorise` \| `paye` \| `annule` \| `rembourse`) | état du paiement |
| `stripe_payment_intent_id` | text, nullable | référence Stripe (rempli au chantier suivant) |
| `validation_token` | text unique | jeton pour les liens Accepter/Décliner par email |

Sur ce chantier, toute commande est créée avec `payment_method = 'sur_place'` et
`payment_status = 'non_paye'` (le choix en ligne arrive au chantier Stripe).

### 4.3 Sécurité (RLS — Row Level Security)
- `categories`, `products`, `opening_hours` : **lecture publique** (actifs/dispo uniquement
  côté front) ; écriture réservée à l'admin.
- `orders`, `order_items` : **insertion publique** (le client passe commande) ;
  **lecture et mise à jour réservées à l'admin authentifié**.
- Les actions tokenisées (Accepter/Décliner par email) passent par une Route Handler serveur
  utilisant le client admin + vérification du `validation_token` (pas d'auth Supabase requise
  côté lien email).

### 4.4 Menu lu depuis la base
Lecture des `categories` + `products` depuis Supabase (remplace `mock-data.ts`). Quelques plats
de départ insérés pour pouvoir tester de bout en bout.

### 4.5 Enregistrement de la commande
À la validation du panier (`/menu` → checkout), une **Server Action** :
1. valide les données avec **Zod** (nom, téléphone, créneau de retrait, note, lignes) ;
2. recalcule le total côté serveur à partir des prix en base (jamais faire confiance au client) ;
3. insère `orders` (`status = 'en_attente'`, `payment_method = 'sur_place'`) + `order_items`
   avec **snapshot** de `product_name` et `unit_price` ;
4. génère un `validation_token` ;
5. déclenche l'email au resto (§4.7) ;
6. renvoie le numéro de commande → page de confirmation.

### 4.6 Espace admin réel
- **Connexion** du resto via Supabase Auth (email/mot de passe). Accès exclusif aux pages
  `/admin/*` (middleware de protection ; redirection vers login si non connecté).
- **Dashboard `/admin/commandes`** branché sur la base :
  - lecture des commandes par statut (À valider / En cuisine / Prêtes / Terminées) ;
  - **temps réel** via Supabase Realtime (nouvelles commandes qui apparaissent) ;
  - **alerte sonore** sur nouvelle commande `en_attente` ;
  - boutons **Accepter** (`en_attente` → `acceptee`) / **Décliner** (`en_attente` → `declinee`),
    puis **Prête** → **Terminée**, qui écrivent réellement le statut en base.

### 4.7 Email au resto (Resend)
À chaque nouvelle commande `en_attente` : email au resto avec le récapitulatif (numéro, nom,
téléphone, créneau, articles, total, note) + deux liens **Accepter / Décliner** tokenisés
(Route Handlers `GET /api/orders/[id]/accept?token=...` et `.../decline?token=...`). Le token
devient inopérant une fois la commande sortie de `en_attente` (évite la double action).
Grâce au Realtime, valider depuis l'email met à jour la tablette instantanément, et inversement.

## 5. Flux de données (vue d'ensemble)

```
Client /menu (panier) ──valide──▶ Server Action
        │                          ├─ Zod + recalcul total
        │                          ├─ INSERT orders + order_items (en_attente)
        │                          ├─ génère validation_token
        │                          └─ email Resend au resto
        ▼
Page de confirmation (numéro de commande)

Resto :
  Dashboard /admin/commandes (Realtime + son)  ─┐
  OU lien email tokenisé                         ├─▶ UPDATE orders.status
                                                 ┘     (acceptee / declinee)
        │
        ▼
  acceptee → prete → terminee   (ou declinee)
```

## 6. Variables d'environnement (`.env.local`)
Déjà listées dans `.env.example`. Pour ce chantier :
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESTAURANT_EMAIL=
NEXT_PUBLIC_SITE_URL=
PREP_DELAY_MINUTES=20
```
(Les clés Stripe seront ajoutées au chantier suivant.)

## 7. Tests / validation
- Passer une commande de test depuis `/menu` → vérifier la ligne créée en base (`orders` +
  `order_items` avec snapshots).
- Total recalculé serveur insensible à une manipulation côté client.
- Connexion admin : pages `/admin` inaccessibles sans session.
- Nouvelle commande → apparition temps réel sur le dashboard + son + email reçu.
- Accepter/Décliner depuis le dashboard ET depuis l'email → statut mis à jour, token invalidé.
- RLS : un visiteur non authentifié ne peut pas lire/mettre à jour les commandes.

## 8. Suite : chantier paiement Stripe (séparé)
Posé par-dessus ce socle, sans rien refaire :
- création du compte Stripe (SIRET + IBAN du resto) ;
- choix « payer en ligne / payer sur place » au checkout ;
- **Stripe Checkout (page hébergée)**, `capture_method: manual` (option A) ;
- webhook Stripe : à l'autorisation, stocker `stripe_payment_intent_id` + `payment_status = 'autorise'` ;
- à l'**Accepter** : capture du paiement (`payment_status = 'paye'`) ; à **Décliner** : annulation
  de l'autorisation (`payment_status = 'annule'`).

## 9. Décisions prises
- Paiement en ligne : **option A** (autorisation à la commande, débit à l'acceptation).
- Saisie carte : **Stripe Checkout hébergé** (et non Elements intégré), pour une première
  intégration plus simple et sécurisée.
- Gestion du menu par le resto : **reportée** (hors de ce chantier).
- Compte Supabase et compte Stripe : **à créer** (le restaurant n'en a aucun).
