import { OPENING_HOURS, isOpenNow, type OpeningSlot } from "./opening-hours";
import { PREP_DELAY_MINUTES } from "./restaurant";

/**
 * Génère les créneaux de retrait VALIDES (CLAUDE.md §6) :
 * uniquement pendant les heures d'ouverture, à partir de maintenant + délai
 * de préparation, par pas de 15 min, sur les prochains jours.
 *
 * Les créneaux sont calculés en heure **Europe/Paris** quel que soit le fuseau
 * du navigateur du client : « 12:00 » affiché = midi à Vienne, et l'instant ISO
 * envoyé correspond toujours à cette heure de Paris (symétrique avec la
 * validation serveur `isOpenNow`). Sinon un appareil réglé sur un autre fuseau
 * produirait des créneaux décalés, rejetés par le serveur.
 */

export const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type PickupSlot = {
  value: string; // ISO
  daysFromNow: number; // 0 = aujourd'hui, 1 = demain, …
  weekday: number; // 0 = dimanche … 6 = samedi
  time: string; // "HH:MM"
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Décalage (ms) du fuseau Europe/Paris par rapport à UTC à un instant donné
 * (positif : Paris est en avance, +1h hiver / +2h été).
 */
function parisOffsetMs(date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const m: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) m[p.type] = p.value;
  const hour = m.hour === "24" ? 0 : Number(m.hour);
  const asUtc = Date.UTC(
    Number(m.year),
    Number(m.month) - 1,
    Number(m.day),
    hour,
    Number(m.minute),
    Number(m.second),
  );
  return asUtc - date.getTime();
}

/**
 * Convertit une heure « murale » Europe/Paris (composants calendaires) en
 * instant absolu, indépendamment du fuseau du navigateur.
 */
function parisWallToDate(
  year: number,
  month0: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const utcGuess = Date.UTC(year, month0, day, hour, minute, 0);
  const offset = parisOffsetMs(new Date(utcGuess));
  return new Date(utcGuess - offset);
}

/** Composants de date Europe/Paris (mois 0-based, jour de semaine 0=dimanche). */
function parisDateParts(date: Date): {
  year: number;
  month0: number;
  day: number;
  weekday: number;
} {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const m: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) m[p.type] = p.value;
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    year: Number(m.year),
    month0: Number(m.month) - 1,
    day: Number(m.day),
    weekday: weekdayMap[m.weekday] ?? 0,
  };
}

export function generatePickupSlots(opts?: {
  now?: Date;
  slots?: OpeningSlot[];
  prepMinutes?: number;
  stepMinutes?: number;
  maxDays?: number;
  maxSlots?: number;
}): PickupSlot[] {
  const now = opts?.now ?? new Date();
  const slots = opts?.slots ?? OPENING_HOURS;
  const prep = opts?.prepMinutes ?? PREP_DELAY_MINUTES;
  const step = opts?.stepMinutes ?? 15;
  const maxDays = opts?.maxDays ?? 7;
  const maxSlots = opts?.maxSlots ?? 24;

  const earliest = now.getTime() + prep * 60_000;
  const today = parisDateParts(now);
  const out: PickupSlot[] = [];

  for (let d = 0; d < maxDays && out.length < maxSlots; d++) {
    // Date calendaire Europe/Paris à J+d (midi : à l'abri des bascules d'heure).
    const ref = parisWallToDate(today.year, today.month0, today.day + d, 12, 0);
    const { year, month0, day, weekday } = parisDateParts(ref);

    const daySlots = slots
      .filter((s) => s.dayOfWeek === weekday)
      .sort((a, b) => a.openTime.localeCompare(b.openTime));

    for (const s of daySlots) {
      const [oh, om] = s.openTime.split(":").map(Number);
      const [ch, cm] = s.closeTime.split(":").map(Number);
      const openMin = oh * 60 + om;
      const closeMin = ch * 60 + cm;

      for (let mins = openMin; mins < closeMin; mins += step) {
        const h = Math.floor(mins / 60);
        const mi = mins % 60;
        const t = parisWallToDate(year, month0, day, h, mi);
        if (t.getTime() < earliest) continue;
        out.push({
          value: t.toISOString(),
          daysFromNow: d,
          weekday,
          time: `${pad(h)}:${pad(mi)}`,
        });
        if (out.length >= maxSlots) break;
      }
      if (out.length >= maxSlots) break;
    }
  }

  return out;
}

/**
 * Validation SERVEUR d'un créneau de retrait choisi (défense contre un appel
 * direct aux Server Actions qui contournerait le sélecteur du navigateur).
 * Un créneau est valide s'il : n'est pas dans le passé (tolérance de soumission),
 * n'est pas trop lointain, et tombe dans une plage d'ouverture (Europe/Paris).
 */
export function isValidPickupTime(
  iso: string,
  opts?: { now?: Date; slots?: OpeningSlot[]; maxDays?: number },
): boolean {
  const pickup = new Date(iso);
  if (Number.isNaN(pickup.getTime())) return false;

  const now = opts?.now ?? new Date();
  const slots = opts?.slots ?? OPENING_HOURS;
  const maxDays = opts?.maxDays ?? 8;

  // Pas dans le passé (2 min de tolérance pour la latence de remplissage/soumission).
  if (pickup.getTime() < now.getTime() - 2 * 60_000) return false;
  // Pas trop loin dans le futur.
  if (pickup.getTime() > now.getTime() + maxDays * 24 * 60 * 60_000) return false;
  // Doit tomber dans une plage d'ouverture du restaurant (fuseau Europe/Paris).
  return isOpenNow(slots, pickup);
}
