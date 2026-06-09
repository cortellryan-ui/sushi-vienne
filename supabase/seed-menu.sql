-- Menu de départ Sushi Smile (catégories + plats). Idempotent.
-- À exécuter APRÈS schema.sql. Les horaires sont déjà seedés dans schema.sql.

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

-- Plats : on référence la catégorie par son slug. N'insère pas un plat déjà présent (par nom).
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
