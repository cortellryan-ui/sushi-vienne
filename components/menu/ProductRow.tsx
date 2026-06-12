"use client";

import { useLocale, useTranslations } from "next-intl";
import { Leaf, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { isVegetarian } from "@/lib/veggie";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Ligne de plat sans photo : nom · description · prix · bouton.
 * Utilisée pour les plats dont la photo n'est pas encore disponible
 * (évite d'afficher une image dupliquée).
 */
export function ProductRow({
  product,
  special = false,
}: {
  product: Product;
  special?: boolean;
}) {
  const t = useTranslations("menu");
  const locale = useLocale();
  const { add } = useCart();

  const available = product.isAvailable;
  const veggie = isVegetarian(product);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border bg-white p-4 transition hover:shadow-sm",
        special && "border-brand-deep/40",
        !available && "opacity-60",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium">{product.name}</h3>
          {veggie && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              <Leaf className="size-2.5" /> Veggie
            </span>
          )}
          {special && (
            <span className="rounded-full bg-brand-deep px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Spécialité
            </span>
          )}
        </div>
        {product.description && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {product.description}
          </p>
        )}
      </div>

      <span
        className={cn(
          "shrink-0 font-display text-lg tabular-nums",
          special && "text-brand-deep",
        )}
      >
        {formatPrice(product.price, locale)}
      </span>

      <Button
        size="sm"
        onClick={() => add(product)}
        disabled={!available}
        aria-label={`${t("order")} ${product.name}`}
        className="shrink-0"
      >
        {available ? (
          <>
            <Plus /> {t("order")}
          </>
        ) : (
          t("unavailable")
        )}
      </Button>
    </div>
  );
}
