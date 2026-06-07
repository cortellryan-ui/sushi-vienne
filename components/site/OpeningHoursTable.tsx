import { useLocale, useTranslations } from "next-intl";
import { OPENING_HOURS, slotsForDay } from "@/lib/opening-hours";
import { cn } from "@/lib/utils";

// Ordre d'affichage : lundi → dimanche (les dayOfWeek suivent Date.getDay, 0 = dimanche).
const DISPLAY_ORDER: { day: number; key: string }[] = [
  { day: 1, key: "monday" },
  { day: 2, key: "tuesday" },
  { day: 3, key: "wednesday" },
  { day: 4, key: "thursday" },
  { day: 5, key: "friday" },
  { day: 6, key: "saturday" },
  { day: 0, key: "sunday" },
];

function fmt(hhmm: string, locale: string) {
  return locale === "fr" ? hhmm.replace(":", "h") : hhmm;
}

/** Tableau des horaires d'ouverture, lu depuis la config (future table `opening_hours`). */
export function OpeningHoursTable({ className }: { className?: string }) {
  const tDays = useTranslations("days");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <dl className={cn("space-y-1.5 text-sm", className)}>
      {DISPLAY_ORDER.map(({ day, key }) => {
        const slots = slotsForDay(day, OPENING_HOURS);
        return (
          <div key={key} className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">{tDays(key)}</dt>
            <dd className="text-right font-medium tabular-nums">
              {slots.length === 0
                ? tCommon("closed")
                : slots
                    .map(
                      (s) =>
                        `${fmt(s.openTime, locale)}–${fmt(s.closeTime, locale)}`,
                    )
                    .join(" · ")}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
