"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { emojiForCategory } from "@/lib/category-emoji";
import { photoForCategory } from "@/lib/category-photos";
import { ProductCard } from "./ProductCard";

type MenuSection = { category: Category; products: Product[] };

export function MenuClient({ menu }: { menu: MenuSection[] }) {
  const t = useTranslations("menu");

  // Parallaxe : le calque néon glisse plus lentement que le contenu au scroll.
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = glowRef.current;
        if (el) el.style.transform = `translateY(${window.scrollY * 0.2}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative">
      {/* Fond néon orange : halos qui dérivent (animation) + parallaxe au scroll.
          overflow-hidden ici (et pas sur le parent) pour ne pas casser le sticky. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 overflow-hidden"
      >
        <div ref={glowRef} className="absolute inset-0 will-change-transform">
          <div className="absolute left-[4%] top-[8%] size-[26rem] rounded-full bg-brand/30 blur-[120px] animate-neon-1" />
          <div className="absolute right-[6%] top-[42%] size-[32rem] rounded-full bg-brand-deep/30 blur-[130px] animate-neon-2" />
          <div className="absolute left-[38%] top-[72%] size-[24rem] rounded-full bg-brand/25 blur-[120px] animate-neon-pulse" />
          <div className="absolute right-[30%] top-[96%] size-[22rem] rounded-full bg-brand/20 blur-[110px] animate-neon-1" />
        </div>
      </div>

      {/* Navigation par catégories (ancres, collante sous le header) */}
      <nav className="sticky top-16 z-30 border-y border-white/10 bg-ink/85 backdrop-blur">
        <div className="container -mx-0 overflow-x-auto py-3">
          <ul className="flex gap-2">
            {menu.map(({ category }) => (
              <li key={category.id}>
                <a
                  href={`#${category.slug}`}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 transition hover:border-brand hover:text-white"
                >
                  <span>{emojiForCategory(category.slug)}</span>
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="container relative z-10 py-12">
        {/* Note maquette (discrète) */}
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/50">
          <Info className="size-3.5 shrink-0" />
          {t("demoNote")}
        </div>

        {/* Sections par catégorie */}
        <div className="space-y-16">
          {menu.map(({ category, products }) => (
            <section key={category.id} id={category.slug} className="scroll-mt-32">
              <h2 className="mb-6 flex items-center gap-2.5 font-display text-3xl text-white">
                <span>{emojiForCategory(category.slug)}</span>
                {category.name}
              </h2>
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    image={photoForCategory(category.slug)}
                    emoji={emojiForCategory(category.slug)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
