"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

/**
 * Renvoie à l'accueil quand l'utilisateur RECHARGE une page publique (F5 /
 * pull-to-refresh). Ne se déclenche QUE sur un vrai rechargement (type
 * "reload") : un lien interne ou un lien partagé ouvre normalement la page.
 * Monté dans le layout public uniquement → l'admin n'est pas concerné.
 * Exceptions : l'accueil lui-même et la page de confirmation de paiement.
 */
export function RefreshToHome() {
  const pathname = usePathname(); // chemin SANS préfixe de locale ("/menu", …)
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/") return; // déjà à l'accueil
    if (pathname.startsWith("/commande/confirmee")) return; // garder la confirmation

    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav?.type === "reload") {
      router.replace("/");
    }
  }, [pathname, router]);

  return null;
}
