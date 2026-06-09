"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowRight, BadgePercent, HandCoins, Timer } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";

type PromoBannerProps = {
  img: string;
  badge: string;
  title: string;
  cta: string;
  features: [string, string, string];
};

/**
 * Bandeau « commande directe » premium : photo plein cadre traitée en sombre,
 * parallax piloté au scroll (la photo dérive plus lentement que la page),
 * halo orange diffus, panneau de contenu en verre dépoli et chips d'arguments.
 * Remplace l'ancien split plat orange / photo sur fond blanc.
 */
export function PromoBanner({
  img,
  badge,
  title,
  cta,
  features,
}: PromoBannerProps) {
  const imgRef = useRef<HTMLDivElement>(null);

  // Parallax : on translate la photo selon la progression du bloc dans le
  // viewport, ce qui crée une légère dérive verticale quand on scrolle.
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      const card = el.parentElement;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress : 0 quand le bloc arrive par le bas, 1 quand il sort par le haut.
      const progress = (vh - rect.top) / (vh + rect.height);
      const clamped = Math.min(1, Math.max(0, progress));
      el.style.transform = `translate3d(0, ${(clamped - 0.5) * 70}px, 0)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const icons = [BadgePercent, HandCoins, Timer];

  return (
    <section className="bg-cream py-10 md:py-16">
      <div className="container">
        <Reveal className="group relative overflow-hidden rounded-[2rem] bg-ink text-white shadow-2xl ring-1 ring-white/10">
          {/* Photo plein cadre + parallax + ken-burns */}
          <div
            ref={imgRef}
            className="absolute inset-x-0 -top-[12%] h-[124%] will-change-transform"
          >
            <Image
              src={img}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 1280px"
              className="animate-kenburns object-cover"
            />
          </div>

          {/* Dégradés : sombre à gauche (lisibilité texte) + ancrage bas */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/30" />

          {/* Halo orange diffus */}
          <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-brand/40 blur-3xl" />

          {/* Liseré dégradé animé en haut */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-80" />

          {/* Contenu */}
          <div className="relative z-10 max-w-xl p-8 sm:p-12 md:p-16">
            <Reveal delay={80}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand backdrop-blur ring-1 ring-white/15">
                <span className="size-1.5 rounded-full bg-brand shadow-[0_0_8px] shadow-brand" />
                {badge}
              </span>
            </Reveal>

            <Reveal delay={140}>
              <h2 className="mt-5 font-display text-3xl leading-[1.05] drop-shadow-sm sm:text-4xl md:text-5xl">
                {title}
              </h2>
            </Reveal>

            <Reveal delay={220}>
              <ul className="mt-7 flex flex-wrap gap-2.5">
                {features.map((feat, i) => {
                  const Icon = icons[i];
                  return (
                    <li
                      key={feat}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur ring-1 ring-white/15 transition hover:bg-white/15"
                    >
                      <Icon className="size-4 text-brand" />
                      {feat}
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            <Reveal delay={300}>
              <Button asChild size="lg" className="mt-9 shadow-lg shadow-brand/30">
                <Link href="/menu">
                  {cta} <ArrowRight />
                </Link>
              </Button>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
