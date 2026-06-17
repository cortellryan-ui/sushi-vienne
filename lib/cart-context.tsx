"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { CartItem, Product } from "./types";

export const STORAGE_KEY = "sushi-vienne-cart";

type State = { items: CartItem[] };

type Action =
  | { type: "ADD"; product: Product }
  | { type: "INC"; productId: string }
  | { type: "DEC"; productId: string }
  | { type: "REMOVE"; productId: string }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items };
    case "ADD": {
      const existing = state.items.find(
        (i) => i.productId === action.product.id,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: action.product.id,
            name: action.product.name,
            unitPrice: action.product.price,
            quantity: 1,
            imageUrl: action.product.imageUrl,
          },
        ],
      };
    }
    case "INC":
      return {
        items: state.items.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        ),
      };
    case "DEC":
      return {
        items: state.items
          .map((i) =>
            i.productId === action.productId
              ? { ...i, quantity: i.quantity - 1 }
              : i,
          )
          .filter((i) => i.quantity > 0),
      };
    case "REMOVE":
      return {
        items: state.items.filter((i) => i.productId !== action.productId),
      };
    case "CLEAR":
      // Idempotent : panier déjà vide → on garde la même référence de state
      // (évite un re-render inutile et toute boucle d'effet sur `clear`).
      return state.items.length === 0 ? state : { items: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product) => void;
  inc: (productId: string) => void;
  dec: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [isOpen, setIsOpen] = useState(false);

  // Hydratation depuis localStorage (après montage, pour éviter les écarts SSR).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", items: JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      /* ignore */
    }
  }, [state.items]);

  // Callbacks à identité STABLE : `dispatch` et `setIsOpen` ne changent jamais,
  // donc ces fonctions non plus. Indispensable pour les consommateurs qui les
  // mettent en dépendance d'un useEffect (ex. ClearCartOnMount) — sinon boucle.
  const actions = useMemo(
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add: (product: Product) => {
        dispatch({ type: "ADD", product });
        setIsOpen(true);
      },
      inc: (productId: string) => dispatch({ type: "INC", productId }),
      dec: (productId: string) => dispatch({ type: "DEC", productId }),
      remove: (productId: string) => dispatch({ type: "REMOVE", productId }),
      clear: () => dispatch({ type: "CLEAR" }),
    }),
    [],
  );

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((n, i) => n + i.quantity, 0);
    const total = state.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    return { items: state.items, count, total, isOpen, ...actions };
  }, [state.items, isOpen, actions]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
