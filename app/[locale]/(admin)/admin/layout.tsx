import { setRequestLocale } from "next-intl/server";
import { ClipboardList, History, UtensilsCrossed } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * Habillage admin (kiosque) — distinct des pages publiques : pas de header
 * client, fond sombre, navigation Commandes / Menu. Français uniquement.
 *
 * Accès réservé : ces routes sont protégées par Supabase Auth
 * (middleware + requireUser dans chaque page admin).
 *
 * NB : on n’appelle PAS requireUser() ici. La page de connexion `/admin`
 * (app/[locale]/(admin)/admin/page.tsx) est rendue À L’INTÉRIEUR de ce layout.
 * Un requireUser() au niveau du layout redirigerait un visiteur non connecté
 * vers `/admin` → qui repasse par ce même layout → boucle de redirection
 * infinie, rendant le formulaire de connexion inaccessible. La défense en
 * profondeur reste donc portée par chaque page admin individuellement.
 */
export default function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
          <Link href="/admin/commandes" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-gradient font-display text-sm font-bold text-white">
              S
            </span>
            <span className="font-display tracking-wide">SUSHI SMILE</span>
            <span className="ml-1 rounded bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-wider text-white/70">
              Admin
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {/* Sur mobile : icônes seules (libellés masqués) pour éviter
                le débordement horizontal ; libellés visibles dès sm. */}
            <Link
              href="/admin/commandes"
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <ClipboardList className="size-4" />
              <span className="hidden sm:inline">Commandes</span>
            </Link>
            <Link
              href="/admin/historique"
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <History className="size-4" />
              <span className="hidden sm:inline">Historique</span>
            </Link>
            <Link
              href="/admin/menu"
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <UtensilsCrossed className="size-4" />
              <span className="hidden sm:inline">Menu</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
