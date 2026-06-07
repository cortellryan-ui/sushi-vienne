/**
 * Types métier alignés sur le schéma Supabase (CLAUDE.md §5).
 * En mode maquette, les données viennent de lib/mock-data.ts ;
 * le branchement Supabase plus tard renverra la même forme.
 */

export type Category = {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  displayOrder: number;
  allergens?: string[];
};

export type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
};

export type OrderStatus =
  | "en_attente"
  | "acceptee"
  | "prete"
  | "terminee"
  | "declinee";

export type Order = {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  pickupTime: string; // ISO
  status: OrderStatus;
  total: number;
  notes: string | null;
  createdAt: string; // ISO
  items: {
    productName: string;
    unitPrice: number;
    quantity: number;
  }[];
};
