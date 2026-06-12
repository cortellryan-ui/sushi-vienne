import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { OPENING_HOURS, type OpeningSlot } from "@/lib/opening-hours";

/**
 * Horaires d'ouverture depuis la table Supabase `opening_hours` (lecture
 * publique). Repli automatique sur la constante OPENING_HOURS si la table est
 * vide ou en erreur — le badge ouvert/fermé et les créneaux ne doivent jamais
 * casser. `cache()` déduplique l'appel sur une même requête serveur.
 */
export const getOpeningHours = cache(async (): Promise<OpeningSlot[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("opening_hours")
      .select("day_of_week, open_time, close_time")
      .order("day_of_week", { ascending: true });

    if (error || !data || data.length === 0) return OPENING_HOURS;

    return data.map((r) => ({
      dayOfWeek: r.day_of_week as number,
      // "HH:MM:SS" (type Postgres) → "HH:MM"
      openTime: String(r.open_time).slice(0, 5),
      closeTime: String(r.close_time).slice(0, 5),
    }));
  } catch {
    return OPENING_HOURS;
  }
});
