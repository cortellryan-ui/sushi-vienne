import type { OrderStatus } from "./types";

/**
 * Commandes fictives prêtes à afficher (maquette dashboard tablette).
 * En production : lecture depuis Supabase `orders` + `order_items`, abonnement
 * Realtime aux changements (CLAUDE.md §7).
 */
export type AdminOrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type AdminOrder = {
  id: string;
  number: number;
  customerName: string;
  customerPhone: string;
  pickupLabel: string; // ex. "Aujourd'hui · 19:15"
  receivedLabel: string; // ex. "il y a 2 min"
  status: OrderStatus;
  notes: string | null;
  items: AdminOrderItem[];
};

export function orderTotal(o: AdminOrder): number {
  return o.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
}

export const MOCK_ORDERS: AdminOrder[] = [
  {
    id: "o-1042",
    number: 1042,
    customerName: "Camille Dubois",
    customerPhone: "06 12 34 56 78",
    pickupLabel: "Aujourd'hui · 19:15",
    receivedLabel: "il y a 1 min",
    status: "en_attente",
    notes: "Sans wasabi svp",
    items: [
      { name: "Plateau Découverte", quantity: 1, unitPrice: 16.9 },
      { name: "California Crevette Tempura", quantity: 2, unitPrice: 6.5 },
      { name: "Coca-Cola", quantity: 2, unitPrice: 2.5 },
    ],
  },
  {
    id: "o-1041",
    number: 1041,
    customerName: "Yanis Benali",
    customerPhone: "07 88 22 11 09",
    pickupLabel: "Aujourd'hui · 19:30",
    receivedLabel: "il y a 4 min",
    status: "en_attente",
    notes: null,
    items: [
      { name: "Maki Saumon", quantity: 3, unitPrice: 4.9 },
      { name: "Gyoza", quantity: 1, unitPrice: 5.9 },
    ],
  },
  {
    id: "o-1040",
    number: 1040,
    customerName: "Sophie Martin",
    customerPhone: "06 45 78 12 33",
    pickupLabel: "Aujourd'hui · 19:00",
    receivedLabel: "il y a 9 min",
    status: "acceptee",
    notes: "Allergie sésame",
    items: [
      { name: "Plateau Saumon Lover", quantity: 1, unitPrice: 21.9 },
      { name: "Mochi (x2)", quantity: 1, unitPrice: 4.5 },
    ],
  },
  {
    id: "o-1039",
    number: 1039,
    customerName: "Thomas Roche",
    customerPhone: "06 11 02 56 47",
    pickupLabel: "Aujourd'hui · 18:45",
    receivedLabel: "il y a 18 min",
    status: "prete",
    notes: null,
    items: [
      { name: "Plateau Mixte", quantity: 1, unitPrice: 27.9 },
      { name: "Ramune", quantity: 2, unitPrice: 3.5 },
    ],
  },
  {
    id: "o-1038",
    number: 1038,
    customerName: "Léa Fontaine",
    customerPhone: "07 60 33 21 88",
    pickupLabel: "Aujourd'hui · 18:30",
    receivedLabel: "il y a 32 min",
    status: "terminee",
    notes: null,
    items: [{ name: "Plateau Famille", quantity: 1, unitPrice: 39.9 }],
  },
];
