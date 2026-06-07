import { notFound } from "next/navigation";

// Capture toute route localisée inconnue → 404 localisé (rendu dans le layout [locale]).
export default function CatchAllPage() {
  notFound();
}
