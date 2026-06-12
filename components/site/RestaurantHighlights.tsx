"use client";

import Image from "next/image";
import { useState } from "react";
import { ChefHat, Leaf, ShieldCheck, Store } from "lucide-react";
import { cn } from "@/lib/utils";

// 3 colonnes (photo + titre + texte « Voir plus »). Copywriting propre à Sushi Smile.
const POINTS = [
  {
    src: "/photos/plats/plat-100.jpg",
    title: "Commandez en ligne, au prix du comptoir",
    text: "Retrouvez toute notre carte sur le site : makis, california, pokebowls, chirashis, spécialités… au même prix qu'au restaurant, et sans commission. Vous commandez en ligne, vous récupérez votre commande au comptoir, fraîche et prête au créneau choisi. Paiement sur place ou en ligne, comme vous préférez.",
  },
  {
    src: "/photos/plats/plat-130.jpg",
    title: "Qualité & fraîcheur",
    text: "Chez Sushi Smile, la qualité est au cœur de tout. Nos sushis sont roulés et dressés sur place, chaque jour, à partir de produits frais soigneusement sélectionnés. Hygiène stricte et savoir-faire à chaque étape, pour que chaque bouchée soit à la hauteur de vos attentes.",
  },
  {
    src: "/photos/plats/plat-99.jpg",
    title: "Votre fidélité récompensée",
    text: "Fidèle depuis 2018 ? On vous remercie comme il se doit. Avec notre carte de fidélité, chaque commande vous rapproche d'avantages gourmands. Demandez votre carte au comptoir et profitez-en à chaque passage chez Sushi Smile.",
  },
];

const BADGES = [
  { icon: Leaf, label: "Fraîcheur garantie" },
  { icon: ChefHat, label: "Fait maison" },
  { icon: ShieldCheck, label: "Paiement 100% sécurisé" },
  { icon: Store, label: "Retrait au restaurant" },
];

function Highlight({
  src,
  title,
  text,
}: {
  src: string;
  title: string;
  text: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-md">
        <Image
          src={src}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-5 font-display text-xl">{title}</h3>
      <p
        className={cn(
          "mt-2 leading-relaxed text-muted-foreground",
          !open && "line-clamp-4",
        )}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-2 text-sm font-semibold text-brand hover:underline"
      >
        {open ? "Voir moins" : "Voir plus"}
      </button>
    </div>
  );
}

export function RestaurantHighlights() {
  return (
    <section className="container">
      <div className="grid gap-8 md:grid-cols-3 md:gap-10">
        {POINTS.map((p) => (
          <Highlight key={p.title} {...p} />
        ))}
      </div>

      {/* Bande de réassurance */}
      <div className="mt-14 grid grid-cols-2 gap-6 border-t pt-10 sm:grid-cols-4">
        {BADGES.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.label}
              className="flex flex-col items-center gap-2 text-center"
            >
              <Icon className="size-7 text-brand" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {b.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
