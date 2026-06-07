"use client";

import { useRef, useState } from "react";
import {
  Bell,
  BellOff,
  Check,
  CircleCheck,
  Clock,
  Phone,
  Plus,
  StickyNote,
  X,
} from "lucide-react";
import type { OrderStatus } from "@/lib/types";
import {
  MOCK_ORDERS,
  orderTotal,
  type AdminOrder,
} from "@/lib/mock-orders";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLUMNS: { key: OrderStatus; title: string; accent: string }[] = [
  { key: "en_attente", title: "À valider", accent: "text-brand" },
  { key: "acceptee", title: "En cuisine", accent: "text-amber-600" },
  { key: "prete", title: "Prêtes", accent: "text-emerald-600" },
  { key: "terminee", title: "Terminées", accent: "text-neutral-500" },
];

// Pool pour simuler de nouvelles commandes entrantes.
const SAMPLE = [
  {
    customerName: "Inès Lopez",
    customerPhone: "06 22 44 88 10",
    items: [
      { name: "California Saumon Avocat", quantity: 2, unitPrice: 5.9 },
      { name: "Eau minérale", quantity: 1, unitPrice: 1.8 },
    ],
    notes: null as string | null,
  },
  {
    customerName: "Marc Petit",
    customerPhone: "07 11 99 33 21",
    items: [
      { name: "Plateau Mixte", quantity: 1, unitPrice: 27.9 },
      { name: "Tempura Crevettes", quantity: 1, unitPrice: 7.5 },
    ],
    notes: "Baguettes en plus",
  },
  {
    customerName: "Aya Traoré",
    customerPhone: "06 70 12 65 09",
    items: [{ name: "Sashimi Saumon", quantity: 2, unitPrice: 8.9 }],
    notes: null,
  },
];

function beep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    /* audio indisponible */
  }
}

export function AdminOrdersBoard() {
  const [orders, setOrders] = useState<AdminOrder[]>(MOCK_ORDERS);
  const [soundOn, setSoundOn] = useState(true);
  const nextNumber = useRef(1043);

  function setStatus(id: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o)),
    );
  }

  function simulate() {
    const sample = SAMPLE[Math.floor(Math.random() * SAMPLE.length)];
    const number = nextNumber.current++;
    const order: AdminOrder = {
      id: `o-${number}`,
      number,
      pickupLabel: "Aujourd'hui · bientôt",
      receivedLabel: "à l'instant",
      status: "en_attente",
      ...sample,
    };
    setOrders((prev) => [order, ...prev]);
    if (soundOn) beep();
  }

  const pendingCount = orders.filter((o) => o.status === "en_attente").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Barre d'actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Commandes</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount > 0
              ? `${pendingCount} commande(s) à valider`
              : "Aucune commande en attente"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundOn((s) => !s)}
          >
            {soundOn ? <Bell /> : <BellOff />}
            {soundOn ? "Son activé" : "Son coupé"}
          </Button>
          <Button size="sm" onClick={simulate}>
            <Plus /> Simuler une commande
          </Button>
        </div>
      </div>

      {/* Note maquette */}
      <p className="mb-4 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">
        Maquette : les commandes sont fictives. En production, ce tableau se met
        à jour en temps réel (Supabase Realtime) et l’email de validation agit
        sur les mêmes commandes.
      </p>

      {/* Colonnes par statut */}
      <div className="grid gap-4 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const list = orders.filter((o) => o.status === col.key);
          return (
            <div key={col.key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className={cn("font-display text-lg", col.accent)}>
                  {col.title}
                </h2>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-semibold tabular-nums shadow-sm">
                  {list.length}
                </span>
              </div>

              {list.length === 0 && (
                <p className="rounded-2xl border border-dashed bg-white/50 py-8 text-center text-sm text-muted-foreground">
                  —
                </p>
              )}

              {list.map((o) => (
                <OrderCard key={o.id} order={o} onStatus={setStatus} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onStatus,
}: {
  order: AdminOrder;
  onStatus: (id: string, status: OrderStatus) => void;
}) {
  const isPending = order.status === "en_attente";

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm",
        isPending && "ring-2 ring-brand",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="font-display text-xl">#{order.number}</span>
        <span className="text-xs text-muted-foreground">
          {order.receivedLabel}
        </span>
      </div>

      <p className="mt-1 font-semibold">{order.customerName}</p>
      <a
        href={`tel:${order.customerPhone.replace(/\s/g, "")}`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-brand"
      >
        <Phone className="size-3.5" /> {order.customerPhone}
      </a>

      <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-cream px-2.5 py-1 text-sm font-medium">
        <Clock className="size-4 text-brand" /> {order.pickupLabel}
      </p>

      <ul className="mt-3 space-y-1 border-t pt-3 text-sm">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex justify-between gap-2">
            <span>
              <span className="font-semibold tabular-nums">{i.quantity}×</span>{" "}
              {i.name}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {formatPrice(i.unitPrice * i.quantity, "fr")}
            </span>
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-sm text-amber-800">
          <StickyNote className="mt-0.5 size-3.5 shrink-0" /> {order.notes}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-display text-lg">
          {formatPrice(orderTotal(order), "fr")}
        </span>
      </div>

      {/* Actions selon le statut */}
      <div className="mt-3 flex gap-2">
        {order.status === "en_attente" && (
          <>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onStatus(order.id, "acceptee")}
            >
              <Check /> Accepter
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onStatus(order.id, "declinee")}
            >
              <X /> Décliner
            </Button>
          </>
        )}
        {order.status === "acceptee" && (
          <Button
            size="sm"
            className="flex-1"
            variant="ink"
            onClick={() => onStatus(order.id, "prete")}
          >
            <CircleCheck /> Marquer prête
          </Button>
        )}
        {order.status === "prete" && (
          <Button
            size="sm"
            className="flex-1"
            variant="outline"
            onClick={() => onStatus(order.id, "terminee")}
          >
            <Check /> Terminée
          </Button>
        )}
        {order.status === "terminee" && (
          <p className="w-full text-center text-sm text-emerald-600">
            ✓ Retirée
          </p>
        )}
      </div>
    </div>
  );
}
