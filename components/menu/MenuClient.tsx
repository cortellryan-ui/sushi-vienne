"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Info } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { photoForCategory } from "@/lib/category-photos";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";

type MenuSection = { category: Category; products: Product[] };

export function MenuClient({ menu }: { menu: MenuSection[] }) {
  const t = useTranslations("menu");
  const [active, setActive] = useState(menu[0]?.category.slug ?? "");
  const [navOpen, setNavOpen] = useState(false); // dépli mobile

  const current = menu.find((s) => s.category.slug === active) ?? menu[0];

  return (
    <div className="container py-10 md:py-12">
      {/* Note maquette (discrète) */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-xs text-muted-foreground">
        <Info className="size-3.5 shrink-0" />
        {t("demoNote")}
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        {/* ===== Catégories sur le côté (dépli) ===== */}
        <aside className="md:w-56 md:shrink-0">
          {/* Mobile : bouton qui déplie la liste */}
          <button
            type="button"
            onClick={() => setNavOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 font-medium shadow-sm md:hidden"
            aria-expanded={navOpen}
          >
            <span>{current?.category.name}</span>
            <ChevronDown
              className={cn("size-4 transition", navOpen && "rotate-180")}
            />
          </button>

          <nav
            className={cn(
              "mt-2 md:mt-0 md:sticky md:top-24",
              !navOpen && "hidden md:block",
            )}
          >
            <ul className="space-y-1 rounded-2xl border bg-white p-2 shadow-sm md:border-0 md:bg-transparent md:p-0 md:shadow-none">
              {menu.map(({ category }) => {
                const isActive = category.slug === active;
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActive(category.slug);
                        setNavOpen(false);
                      }}
                      className={cn(
                        "w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition",
                        isActive
                          ? "bg-brand-gradient text-white shadow-sm shadow-brand/30"
                          : category.slug === "specialites"
                            ? "text-brand-deep hover:bg-cream"
                            : "text-foreground hover:bg-cream",
                      )}
                    >
                      {category.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* ===== Plats de la catégorie sélectionnée ===== */}
        <div className="min-w-0 flex-1">
          {current && (
            <section>
              <h2 className="mb-6 font-serif font-medium text-3xl">
                {current.category.name}
              </h2>
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-3">
                {current.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    image={photoForCategory(current.category.slug)}
                    special={current.category.slug === "specialites"}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
