import { setRequestLocale } from "next-intl/server";
import { ClipboardList, UtensilsCrossed } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * Habillage admin (kiosque) — distinct des pages publiques : pas de header
 * client, fond sombre, navigation Commandes / Menu. Français uniquement.
 *
 * ⚠️ Maquette : aucune authentification réelle. La v1 protégera ces routes
 * via Supabase Auth (middleware + vérification de session).
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
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/admin/commandes" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-gradient">
              🍣
            </span>
            <span className="font-display tracking-wide">SUSHI SMILE</span>
            <span className="ml-1 rounded bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-wider text-white/70">
              Admin
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/admin/commandes"
              className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <ClipboardList className="size-4" /> Commandes
            </Link>
            <Link
              href="/admin/menu"
              className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <UtensilsCrossed className="size-4" /> Menu
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
