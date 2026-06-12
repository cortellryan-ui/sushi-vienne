"use client";

import { createContext, useContext } from "react";
import { OPENING_HOURS, type OpeningSlot } from "@/lib/opening-hours";

/**
 * Diffuse les horaires d'ouverture (lus depuis Supabase côté serveur) aux
 * composants client : badge ouvert/fermé, tableau des horaires, créneaux de
 * retrait. Valeur par défaut = constante de repli (sécurité).
 */
const OpeningHoursContext = createContext<OpeningSlot[]>(OPENING_HOURS);

export function OpeningHoursProvider({
  hours,
  children,
}: {
  hours: OpeningSlot[];
  children: React.ReactNode;
}) {
  return (
    <OpeningHoursContext.Provider value={hours}>
      {children}
    </OpeningHoursContext.Provider>
  );
}

export function useOpeningHours(): OpeningSlot[] {
  return useContext(OpeningHoursContext);
}
