"use client";

import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

/** Bouton panier flottant (mobile uniquement), visible quand le panier n'est pas vide. */
export function FloatingCartButton() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { count, total, open } = useCart();

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
      <button
        type="button"
        onClick={open}
        className="flex w-full items-center justify-between rounded-full bg-brand-gradient px-5 py-3.5 text-white shadow-lg"
      >
        <span className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="size-5" />
          {t("floating")} · {t("items", { count })}
        </span>
        <span className="font-display text-lg">{formatPrice(total, locale)}</span>
      </button>
    </div>
  );
}
