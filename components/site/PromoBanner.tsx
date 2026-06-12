"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, BadgePercent, HandCoins, Timer } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

type PromoBannerProps = {
  badge: string;
  title: string;
  cta: string;
  features: [string, string, string];
};

/**
 * Bandeau « commande directe » : fond néon orange animé sur noir, effet de
 * scroll spectaculaire (la carte se redresse en 3D + s'agrandit en entrant
 * dans le viewport) et néon au survol des textes.
 */
export function PromoBanner({ badge, title, cta, features }: PromoBannerProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const raw = (vh - rect.top) / (vh * 0.75);
      const p = reduce ? 1 : Math.min(1, Math.max(0, raw));
      el.style.transform = `perspective(1200px) rotateX(${(1 - p) * 12}deg) scale(${0.86 + p * 0.14}) translateY(${(1 - p) * 60}px)`;
      el.style.opacity = String(0.15 + p * 0.85);
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
    <section className="bg-cream py-12 [perspective:1200px] md:py-20">
      <div className="container">
        <div
          ref={cardRef}
          className="relative origin-bottom overflow-hidden rounded-[2rem] bg-ink text-white shadow-2xl ring-1 ring-white/10 will-change-transform"
        >
          {/* Néons orange animés en fond */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -left-10 top-0 size-72 rounded-full bg-brand/45 blur-[90px] animate-neon-1" />
            <div className="absolute -right-6 top-1/4 size-80 rounded-full bg-brand-deep/45 blur-[100px] animate-neon-2" />
            <div className="absolute bottom-[-3rem] left-1/3 size-72 rounded-full bg-brand/35 blur-[90px] animate-neon-pulse" />
          </div>

          {/* Liseré néon haut */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-brand to-transparent" />

          {/* Contenu */}
          <div className="relative z-10 px-8 py-12 sm:px-12 sm:py-16 md:px-16 md:py-20">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand ring-1 ring-white/15 backdrop-blur">
              <span className="size-1.5 rounded-full bg-brand shadow-[0_0_10px] shadow-brand" />
              {badge}
            </span>

            <h2 className="mt-6 max-w-2xl cursor-default font-serif font-medium text-4xl leading-[1.05] transition-[text-shadow,transform] duration-300 hover:scale-[1.01] hover:[text-shadow:0_0_30px_rgba(242,101,34,0.9)] sm:text-5xl md:text-6xl">
              {title}
            </h2>

            <ul className="mt-8 flex flex-wrap gap-2.5">
              {features.map((feat, i) => {
                const Icon = icons[i];
                return (
                  <li
                    key={feat}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur transition duration-300 hover:bg-brand/20 hover:text-white hover:ring-brand hover:[box-shadow:0_0_22px_rgba(242,101,34,0.55)]"
                  >
                    <Icon className="size-4 text-brand" />
                    {feat}
                  </li>
                );
              })}
            </ul>

            <Button
              asChild
              size="lg"
              className="mt-9 shadow-lg shadow-brand/40 transition hover:shadow-brand/60"
            >
              <Link href="/menu">
                {cta} <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
