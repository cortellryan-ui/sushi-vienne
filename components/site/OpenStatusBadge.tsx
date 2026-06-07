"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { isOpenNow } from "@/lib/opening-hours";
import { cn } from "@/lib/utils";

/**
 * Badge Ouvert / Fermé calculé côté client à partir des horaires (fuseau
 * Europe/Paris), rafraîchi chaque minute. Affiche un état neutre avant le
 * premier calcul pour éviter tout décalage d'hydratation.
 */
export function OpenStatusBadge({ className }: { className?: string }) {
  const t = useTranslations("status");
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOpen(isOpenNow());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        open === null && "bg-white/10 text-white/70",
        open === true && "bg-emerald-500/15 text-emerald-300",
        open === false && "bg-red-500/15 text-red-300",
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          open === null && "bg-white/40",
          open === true && "animate-pulse bg-emerald-400",
          open === false && "bg-red-400",
        )}
      />
      {open === null ? "—" : open ? t("open") : t("closed")}
    </span>
  );
}
