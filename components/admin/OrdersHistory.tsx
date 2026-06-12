"use client";

import { useMemo, useState } from "react";
import type { AdminOrder } from "@/lib/data/admin-orders";
import type { OrderStatus } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type Range = "today" | "week" | "all";

const RANGES: { key: Range; label: string }[] = [
  { key: "today", label: "Aujourd'hui" },
  { key: "week", label: "Cette semaine" },
  { key: "all", label: "Tout" },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  en_attente: "En attente",
  acceptee: "Acceptée",
  prete: "Prête",
  terminee: "Terminée",
  declinee: "Déclinée",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  en_attente: "bg-brand/10 text-brand",
  acceptee: "bg-amber-100 text-amber-700",
  prete: "bg-emerald-100 text-emerald-700",
  terminee: "bg-neutral-200 text-neutral-600",
  declinee: "bg-red-100 text-red-700",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  non_paye: "Non payé",
  autorise: "Autorisé",
  paye: "Payé",
  annule: "Annulé",
  rembourse: "Remboursé",
};

function startOfToday(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfWeek(now: Date): Date {
  const d = startOfToday(now);
  const day = (d.getDay() + 6) % 7; // 0 = lundi
  d.setDate(d.getDate() - day);
  return d;
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrdersHistory({ orders }: { orders: AdminOrder[] }) {
  const [range, setRange] = useState<Range>("week");

  const { groups, grandTotal, grandSurPlace, grandEnLigne, count } = useMemo(() => {
    const now = new Date();
    const from =
      range === "today"
        ? startOfToday(now)
        : range === "week"
          ? startOfWeek(now)
          : null;

    const filtered = orders.filter(
      (o) => !from || new Date(o.createdAt) >= from,
    );

    // Regroupement par jour (déjà triés du plus récent au plus ancien).
    const map = new Map<string, AdminOrder[]>();
    for (const o of filtered) {
      const k = dayKey(o.createdAt);
      (map.get(k) ?? map.set(k, []).get(k)!).push(o);
    }

    // Le chiffre d'affaires ne compte pas les commandes déclinées.
    const isRevenue = (o: AdminOrder) => o.status !== "declinee";
    const sumBy = (list: AdminOrder[], method?: "sur_place" | "en_ligne") =>
      list
        .filter(isRevenue)
        .filter((o) => !method || o.paymentMethod === method)
        .reduce((s, o) => s + o.total, 0);

    const grandTotal = sumBy(filtered);
    const grandSurPlace = sumBy(filtered, "sur_place");
    const grandEnLigne = sumBy(filtered, "en_ligne");

    const groups = Array.from(map.entries()).map(([, list]) => ({
      label: dayLabel(list[0].createdAt),
      orders: list,
      subtotal: sumBy(list),
      surPlace: sumBy(list, "sur_place"),
      enLigne: sumBy(list, "en_ligne"),
    }));

    return {
      groups,
      grandTotal,
      grandSurPlace,
      grandEnLigne,
      count: filtered.length,
    };
  }, [orders, range]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Historique</h1>
          <p className="text-sm text-muted-foreground">
            {count} commande{count > 1 ? "s" : ""} ·{" "}
            <span className="font-medium text-foreground">
              {formatPrice(grandTotal, "fr")}
            </span>{" "}
            de chiffre d’affaires (hors déclinées)
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800">
              Sur place&nbsp;: {formatPrice(grandSurPlace, "fr")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 font-medium text-sky-800">
              En ligne&nbsp;: {formatPrice(grandEnLigne, "fr")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full border bg-white p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={cn(
                "rounded-full px-4 py-2.5 text-sm font-medium transition",
                range === r.key
                  ? "bg-brand text-white"
                  : "text-muted-foreground hover:bg-cream",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-white py-16 text-center text-muted-foreground">
          Aucune commande sur cette période.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.label}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <h2 className="font-display text-lg capitalize">{g.label}</h2>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    Sur place{" "}
                    <span className="font-medium text-foreground">
                      {formatPrice(g.surPlace, "fr")}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    En ligne{" "}
                    <span className="font-medium text-foreground">
                      {formatPrice(g.enLigne, "fr")}
                    </span>
                  </span>
                  <span className="rounded-lg bg-ink px-2.5 py-1 font-semibold text-white">
                    Total {formatPrice(g.subtotal, "fr")}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border bg-white">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="border-b bg-cream/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">N°</th>
                      <th className="px-3 py-2">Heure</th>
                      <th className="px-3 py-2">Client</th>
                      <th className="px-3 py-2">Articles</th>
                      <th className="px-3 py-2">Paiement</th>
                      <th className="px-3 py-2">Statut</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.orders.map((o) => (
                      <tr
                        key={o.id}
                        className={cn(
                          "border-b last:border-0 align-top",
                          o.status === "declinee" && "opacity-50",
                        )}
                      >
                        <td className="px-3 py-2 font-semibold tabular-nums">
                          #{o.number}
                        </td>
                        <td className="px-3 py-2 tabular-nums text-muted-foreground">
                          {timeLabel(o.createdAt)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium">{o.customerName}</div>
                          <div className="text-xs text-muted-foreground">
                            {o.customerPhone}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {o.items
                            .map((i) => `${i.quantity}× ${i.name}`)
                            .join(", ")}
                          {o.notes && (
                            <div className="text-xs italic text-amber-700">
                              Note : {o.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div>
                            {o.paymentMethod === "en_ligne"
                              ? "En ligne"
                              : "Sur place"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {PAYMENT_STATUS_LABEL[o.paymentStatus] ??
                              o.paymentStatus}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={cn(
                              "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                              STATUS_STYLE[o.status],
                            )}
                          >
                            {STATUS_LABEL[o.status]}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums">
                          {formatPrice(o.total, "fr")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
