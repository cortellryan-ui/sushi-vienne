"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

/** Bouton panier pour le header (affiche le nombre d'articles). */
export function CartButton({ className }: { className?: string }) {
  const { count, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Panier"
      className={cn(
        "relative grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20",
        className,
      )}
    >
      <ShoppingBag className="size-5" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-gradient px-1 text-[11px] font-bold">
          {count}
        </span>
      )}
    </button>
  );
}
