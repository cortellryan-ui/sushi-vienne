"use client";

import { useState } from "react";
import { GripVertical, ImagePlus, Pencil, Plus } from "lucide-react";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, CATEGORY_EMOJI } from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AdminMenuManager() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  function toggleAvailable(id: string) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isAvailable: !p.isAvailable } : p,
      ),
    );
  }

  const categories = [...MOCK_CATEGORIES].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Gestion du menu</h1>
          <p className="text-sm text-muted-foreground">
            Catégories, plats, prix, disponibilité et photos.
          </p>
        </div>
        <Button size="sm">
          <Plus /> Nouvelle catégorie
        </Button>
      </div>

      <p className="mb-4 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">
        Maquette : seule la bascule « disponible » est active. La création /
        édition / réorganisation et l’upload photo seront branchés sur Supabase.
      </p>

      <div className="space-y-6">
        {categories.map((cat) => {
          const list = products
            .filter((p) => p.categoryId === cat.id)
            .sort((a, b) => a.displayOrder - b.displayOrder);
          return (
            <section
              key={cat.id}
              className="overflow-hidden rounded-2xl border bg-white"
            >
              <header className="flex items-center justify-between gap-2 border-b bg-cream px-4 py-3">
                <h2 className="flex items-center gap-2 font-display text-lg">
                  <span>{CATEGORY_EMOJI[cat.id] ?? "🍣"}</span>
                  {cat.name}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({list.length})
                  </span>
                </h2>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost">
                    <Pencil />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Plus /> Plat
                  </Button>
                </div>
              </header>

              <ul className="divide-y">
                {list.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <GripVertical className="size-4 shrink-0 cursor-grab text-neutral-300" />
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cream to-muted text-xl">
                      {CATEGORY_EMOJI[cat.id] ?? "🍣"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {p.description}
                      </p>
                    </div>
                    <span className="font-display tabular-nums">
                      {formatPrice(p.price, "fr")}
                    </span>

                    {/* Toggle disponibilité */}
                    <button
                      type="button"
                      onClick={() => toggleAvailable(p.id)}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                        p.isAvailable ? "bg-emerald-500" : "bg-neutral-300",
                      )}
                      aria-pressed={p.isAvailable}
                      aria-label={`Disponibilité de ${p.name}`}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 size-5 rounded-full bg-white transition-all",
                          p.isAvailable ? "left-[22px]" : "left-0.5",
                        )}
                      />
                    </button>
                    {!p.isAvailable && (
                      <Badge variant="muted" className="hidden sm:inline-flex">
                        Indispo.
                      </Badge>
                    )}

                    <Button size="icon" variant="ghost" aria-label="Photo">
                      <ImagePlus />
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
