import { OPENING_HOURS, type OpeningSlot } from "./opening-hours";
import { PREP_DELAY_MINUTES } from "./restaurant";

/**
 * Génère les créneaux de retrait VALIDES (CLAUDE.md §6) :
 * uniquement pendant les heures d'ouverture, à partir de maintenant + délai
 * de préparation, par pas de 15 min, sur les prochains jours.
 *
 * ⚠️ Maquette : calcul en heure locale du navigateur (≈ Europe/Paris pour la
 * clientèle locale). La version finale lira `opening_hours` (Supabase) et
 * épinglera le fuseau Europe/Paris.
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

  const earliest = new Date(now.getTime() + prep * 60_000);
  const out: PickupSlot[] = [];

  for (let d = 0; d < maxDays && out.length < maxSlots; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    day.setHours(0, 0, 0, 0);
    const weekday = day.getDay();

    const daySlots = slots
      .filter((s) => s.dayOfWeek === weekday)
      .sort((a, b) => a.openTime.localeCompare(b.openTime));

    for (const s of daySlots) {
      const [oh, om] = s.openTime.split(":").map(Number);
      const [ch, cm] = s.closeTime.split(":").map(Number);
      const close = new Date(day);
      close.setHours(ch, cm, 0, 0);

      let t = new Date(day);
      t.setHours(oh, om, 0, 0);

      for (; t < close; t = new Date(t.getTime() + step * 60_000)) {
        if (t < earliest) continue;
        out.push({
          value: t.toISOString(),
          daysFromNow: d,
          weekday,
          time: `${pad(t.getHours())}:${pad(t.getMinutes())}`,
        });
        if (out.length >= maxSlots) break;
      }
      if (out.length >= maxSlots) break;
    }
  }

  return out;
}
