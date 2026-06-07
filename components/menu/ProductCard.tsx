"use client";

import { useLocale, useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProductCard({
  product,
  emoji,
}: {
  product: Product;
  emoji: string;
}) {
  const t = useTranslations("menu");
  const locale = useLocale();
  const { add } = useCart();

  return (
    <div className="flex gap-4 rounded-2xl border bg-white p-3 shadow-sm transition hover:shadow-md">
      {/* Visuel placeholder (vraie photo à associer plus tard) */}
      <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-cream to-muted text-4xl">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{emoji}</span>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <Badge variant="destructive">{t("unavailable")}</Badge>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-semibold leading-tight">{product.name}</h3>
        {product.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-lg">
            {formatPrice(product.price, locale)}
          </span>
          <Button
            size="sm"
            onClick={() => add(product)}
            disabled={!product.isAvailable}
            aria-label={`${t("add")} ${product.name}`}
          >
            <Plus /> {t("add")}
          </Button>
        </div>
      </div>
    </div>
  );
}
