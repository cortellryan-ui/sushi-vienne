"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChefHat, Leaf, ShieldCheck, Store } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

// 3 colonnes (photo + titre + texte « Voir plus »). Textes via i18n (namespace « highlights »).
const POINTS = [
  { src: "/photos/plats/plat-100.jpg", titleKey: "point1Title", textKey: "point1Text" },
  { src: "/photos/plats/plat-130.jpg", titleKey: "point2Title", textKey: "point2Text" },
  { src: "/photos/plats/plat-99.jpg", titleKey: "point3Title", textKey: "point3Text" },
] as const;

const BADGES = [
  { icon: Leaf, labelKey: "badgeFreshness" },
  { icon: ChefHat, labelKey: "badgeHomemade" },
  { icon: ShieldCheck, labelKey: "badgeSecurePayment" },
  { icon: Store, labelKey: "badgePickup" },
] as const;

function Highlight({
  src,
  title,
  text,
}: {
  src: string;
  title: string;
  text: string;
}) {
  const t = useTranslations("highlights");
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
      <h3 className="mt-5 font-serif font-medium text-xl">{title}</h3>
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
        {open ? t("seeLess") : t("seeMore")}
      </button>
    </div>
  );
}

export function RestaurantHighlights() {
  const t = useTranslations("highlights");
  return (
    <section className="container">
      <div className="grid gap-8 md:grid-cols-3 md:gap-10">
        {POINTS.map((p) => (
          <Highlight
            key={p.titleKey}
            src={p.src}
            title={t(p.titleKey)}
            text={t(p.textKey)}
          />
        ))}
      </div>

      {/* Bande de réassurance */}
      <div className="mt-14 grid grid-cols-2 gap-4 border-t pt-12 sm:grid-cols-4 sm:gap-6">
        {BADGES.map((b, i) => {
          const Icon = b.icon;
          return (
            <Reveal
              key={b.labelKey}
              delay={i * 110}
              className="group flex flex-col items-center gap-3 rounded-2xl border bg-white p-5 text-center shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-[0_14px_34px_-12px_rgba(242,101,34,0.55)]"
            >
              <span className="grid size-14 place-items-center rounded-full bg-brand/10 text-brand transition duration-300 group-hover:scale-110 group-hover:bg-brand-gradient group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand/40">
                <Icon className="size-7" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wide text-foreground">
                {t(b.labelKey)}
              </span>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
