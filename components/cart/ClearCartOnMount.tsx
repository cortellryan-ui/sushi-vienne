"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";

/** Vide le panier au montage (après un paiement en ligne réussi). */
export function ClearCartOnMount() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
