import { RESTAURANT } from "./restaurant";

/**
 * Horaires d'ouverture — SOURCE TEMPORAIRE.
 *
 * ⚠️ Le CLAUDE.md impose que les horaires vivent dans la table Supabase
 * `opening_hours` (modifiables par le resto). Tant que la base n'est pas
 * provisionnée, on utilise cette config typée comme source unique.
 * À remplacer par un fetch de `opening_hours` (même forme) sans toucher au
 * reste de la logique.
 *
 * Horaires (CLAUDE.md §6) :
 *   Lundi → Jeudi : 11h–14h et 18h–22h
 *   Vendredi & Samedi : 18h–22h30
 *   Dimanche : 18h–22h
 */

export type OpeningSlot = {
  /** 0 = dimanche … 6 = samedi (compatible Date.getDay / colonne day_of_week). */
  dayOfWeek: number;
  /** "HH:MM" */
  openTime: string;
  /** "HH:MM" */
  closeTime: string;
};

export const OPENING_HOURS: OpeningSlot[] = [
  // Lundi (1) → Jeudi (4) : midi + soir
  ...[1, 2, 3, 4].flatMap((d) => [
    { dayOfWeek: d, openTime: "11:00", closeTime: "14:00" },
    { dayOfWeek: d, openTime: "18:00", closeTime: "22:00" },
  ]),
  // Vendredi (5) & Samedi (6) : soir élargi
  { dayOfWeek: 5, openTime: "18:00", closeTime: "22:30" },
  { dayOfWeek: 6, openTime: "18:00", closeTime: "22:30" },
  // Dimanche (0) : soir
  { dayOfWeek: 0, openTime: "18:00", closeTime: "22:00" },
];

/** Minutes depuis minuit pour "HH:MM". */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Heure courante dans le fuseau du restaurant (Europe/Paris), indépendamment
 * du fuseau du serveur. Retourne le jour de semaine et les minutes du jour.
 */
export function nowInRestaurantTz(date = new Date()): {
  dayOfWeek: number;
  minutes: number;
} {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: RESTAURANT.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dayOfWeek = weekdayMap[get("weekday")] ?? 0;
  let hour = Number(get("hour"));
  if (hour === 24) hour = 0; // certains environnements renvoient "24" à minuit
  const minutes = hour * 60 + Number(get("minute"));
  return { dayOfWeek, minutes };
}

/** Le restaurant est-il ouvert maintenant ? */
export function isOpenNow(
  slots: OpeningSlot[] = OPENING_HOURS,
  date = new Date(),
): boolean {
  const { dayOfWeek, minutes } = nowInRestaurantTz(date);
  return slots.some(
    (s) =>
      s.dayOfWeek === dayOfWeek &&
      minutes >= toMinutes(s.openTime) &&
      minutes < toMinutes(s.closeTime),
  );
}

/** Créneaux d'un jour donné, triés par heure d'ouverture. */
export function slotsForDay(
  dayOfWeek: number,
  slots: OpeningSlot[] = OPENING_HOURS,
): OpeningSlot[] {
  return slots
    .filter((s) => s.dayOfWeek === dayOfWeek)
    .sort((a, b) => toMinutes(a.openTime) - toMinutes(b.openTime));
}
