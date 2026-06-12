"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  image,
  emoji,
}: {
  product: Product;
  image: string | null;
  emoji: string;
}) {
  const t = useTranslations("menu");
  const locale = useLocale();
  const { add } = useCart();

  const available = product.isAvailable;
  const src = product.imageUrl ?? image;

  return (
    <div className="group">
      {/* Visuel cliquable */}
      <button
        type="button"
        onClick={() => available && add(product)}
        disabled={!available}
        aria-label={`${t("order")} ${product.name}`}
        className={cn(
          "relative block aspect-square w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10",
          available
            ? "cursor-pointer transition hover:ring-brand/60"
            : "cursor-not-allowed",
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
          <div className="grid h-full w-full place-items-center text-5xl opacity-80">
            {emoji}
          </div>
        )}

        {/* Voile + bouton Commander (toujours visible sur mobile, au survol sur desktop) */}
        {available ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="translate-y-1 rounded-full bg-white px-5 py-2 text-sm font-semibold text-ink opacity-100 transition group-hover:translate-y-0 md:opacity-0 md:group-hover:opacity-100">
                {t("order")}
              </span>
            </span>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-black/60">
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {t("unavailable")}
            </span>
          </div>
        )}
      </button>

      {/* Infos */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-white">{product.name}</h3>
          {product.description && (
            <p className="truncate text-sm text-white/45">
              {product.description}
            </p>
          )}
        </div>
        <span className="shrink-0 font-display text-lg text-white">
          {formatPrice(product.price, locale)}
        </span>
      </div>
    </div>
  );
}
