"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Leaf } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { isVegetarian } from "@/lib/veggie";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  image,
}: {
  product: Product;
  image: string | null;
}) {
  const t = useTranslations("menu");
  const locale = useLocale();
  const { add } = useCart();

  const available = product.isAvailable;
  const src = product.imageUrl ?? image;
  const veggie = isVegetarian(product);

  return (
    <div className="group">
      {/* Visuel sur tuile crème (les photos sur fond blanc s'y fondent) */}
      <button
        type="button"
        onClick={() => available && add(product)}
        disabled={!available}
        aria-label={`${t("order")} ${product.name}`}
        className={cn(
          "relative block aspect-square w-full overflow-hidden rounded-xl bg-[#f4efe6]",
          available ? "cursor-pointer" : "cursor-not-allowed",
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
            className={cn(
              "object-cover transition duration-500 group-hover:scale-105",
              !available && "grayscale",
            )}
          />
        ) : (
          <div className="grid h-full w-full place-items-center px-3 text-center text-sm font-medium text-muted-foreground">
            {product.name}
          </div>
        )}

        {veggie && (
          <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            <Leaf className="size-3" /> Veggie
          </span>
        )}

        {available ? (
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="translate-y-1 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white opacity-100 transition group-hover:translate-y-0 md:opacity-0 md:group-hover:opacity-100">
              {t("order")}
            </span>
          </span>
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-white/60">
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {t("unavailable")}
            </span>
          </div>
        )}
      </button>

      {/* Infos */}
      <div className="mt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-tight">{product.name}</h3>
          <span className="shrink-0 font-display text-lg">
            {formatPrice(product.price, locale)}
          </span>
        </div>
        {product.description && (
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}
      </div>
    </div>
  );
}
