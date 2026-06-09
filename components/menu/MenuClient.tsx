"use client";

import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { emojiForCategory } from "@/lib/category-emoji";
import { ProductCard } from "./ProductCard";

type MenuSection = { category: Category; products: Product[] };

export function MenuClient({ menu }: { menu: MenuSection[] }) {
  const t = useTranslations("menu");

  return (
    <div>
      {/* Note maquette */}
      <div className="mb-6 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">
        <Info className="size-4 shrink-0" />
        {t("demoNote")}
      </div>

      {/* Navigation par catégories (ancres, collante sous le header) */}
      <nav className="sticky top-16 z-30 -mx-5 mb-8 overflow-x-auto border-b bg-cream/90 px-5 py-3 backdrop-blur">
        <ul className="flex gap-2">
          {menu.map(({ category }) => (
            <li key={category.id}>
              <a
                href={`#${category.slug}`}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-white px-4 py-1.5 text-sm font-medium transition hover:border-brand hover:text-brand"
              >
                <span>{emojiForCategory(category.slug)}</span>
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sections par catégorie */}
      <div className="space-y-12">
        {menu.map(({ category, products }) => (
          <section
            key={category.id}
            id={category.slug}
            className="scroll-mt-32"
          >
            <h2 className="mb-4 flex items-center gap-2 font-display text-2xl">
              <span>{emojiForCategory(category.slug)}</span>
              {category.name}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  emoji={emojiForCategory(category.slug)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
