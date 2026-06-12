"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart-context";

/** Vide le panier au montage (après un paiement en ligne réussi). */
export function ClearCartOnMount() {
  const { clear } = useCart();
  const done = useRef(false);
  useEffect(() => {
    // Garde-fou : ne vider qu'une seule fois, quelle que soit l'identité de
    // `clear` ou le nombre de re-rendus (évite toute boucle de rendu).
    if (done.current) return;
    done.current = true;
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
