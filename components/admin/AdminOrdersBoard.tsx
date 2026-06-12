"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BellOff,
  Check,
  CircleCheck,
  Clock,
  LogOut,
  Phone,
  StickyNote,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/lib/types";
import type { AdminOrder } from "@/lib/data/admin-orders";
import {
  refreshAdminOrders,
  updateOrderStatus,
} from "@/lib/actions/admin-orders";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLUMNS: { key: OrderStatus; title: string; accent: string }[] = [
  { key: "en_attente", title: "À valider", accent: "text-brand" },
  { key: "acceptee", title: "En cuisine", accent: "text-amber-600" },
  { key: "prete", title: "Prêtes", accent: "text-emerald-600" },
  { key: "terminee", title: "Terminées", accent: "text-neutral-500" },
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

const DAY_MS = 86_400_000;

function pickupLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round(
    (startTarget.getTime() - startToday.getTime()) / DAY_MS,
  );
  const time = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const day =
    days === 0
      ? "Aujourd'hui"
      : days === 1
        ? "Demain"
        : d.toLocaleDateString("fr-FR", { weekday: "long" });
  return `${day} · ${time}`;
}

function receivedLabel(iso: string): string {
  const mins = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 60000),
  );
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const h = Math.floor(mins / 60);
  return `il y a ${h} h`;
}

export function AdminOrdersBoard({
  initialOrders,
}: {
  initialOrders: AdminOrder[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  // Abonnement Realtime : à chaque changement sur `orders`, on re-fetch.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("orders-board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          refreshAdminOrders().then(setOrders);
          if (
            payload.eventType === "INSERT" &&
            (payload.new as { status?: string }).status === "en_attente" &&
            soundRef.current
          ) {
            beep();
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function setStatus(id: string, status: OrderStatus) {
    // Optimiste : on met à jour localement, le Realtime confirmera.
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await updateOrderStatus(id, status);
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin");
    router.refresh();
  }

  const pendingCount = orders.filter((o) => o.status === "en_attente").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
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
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut /> Déconnexion
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <span className="font-display text-2xl">#{order.number}</span>
        <span className="text-xs text-muted-foreground">
          {receivedLabel(order.createdAt)}
        </span>
      </div>
      <p className="mt-1 text-base font-semibold">{order.customerName}</p>
      <a
        href={`tel:${order.customerPhone.replace(/\s/g, "")}`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-brand"
      >
        <Phone className="size-3.5" /> {order.customerPhone}
      </a>
      <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-cream px-2.5 py-1 text-sm font-medium">
        <Clock className="size-4 text-brand" /> {pickupLabel(order.pickupTime)}
      </p>
      <ul className="mt-3 space-y-1 border-t pt-3 text-base">
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
          {formatPrice(order.total, "fr")}
        </span>
      </div>
      {/* Rangée d’actions : gros boutons tactiles (kiosque tablette).
          gap-3 pour éloigner l’action destructive « Décliner ». */}
      <div className="mt-3 flex gap-3">
        {order.status === "en_attente" && (
          <>
            <Button
              size="default"
              className="h-12 flex-1 text-base"
              onClick={() => onStatus(order.id, "acceptee")}
            >
              <Check /> Accepter
            </Button>
            <Button
              size="default"
              variant="destructive"
              className="h-12 text-base"
              onClick={() => onStatus(order.id, "declinee")}
            >
              <X /> Décliner
            </Button>
          </>
        )}
        {order.status === "acceptee" && (
          <Button
            size="default"
            className="h-12 flex-1 text-base"
            variant="ink"
            onClick={() => onStatus(order.id, "prete")}
          >
            <CircleCheck /> Marquer prête
          </Button>
        )}
        {order.status === "prete" && (
          <Button
            size="default"
            className="h-12 flex-1 text-base"
            variant="outline"
            onClick={() => onStatus(order.id, "terminee")}
          >
            <Check /> Terminée
          </Button>
        )}
        {order.status === "terminee" && (
          <p className="w-full text-center text-sm text-emerald-600">
            Retirée
          </p>
        )}
        {order.status === "declinee" && (
          <p className="w-full text-center text-sm text-red-600">Déclinée</p>
        )}
      </div>
    </div>
  );
}
