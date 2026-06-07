import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { OpenStatusBadge } from "./OpenStatusBadge";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { CartButton } from "@/components/cart/CartButton";

/** En-tête noir, présent sur toutes les pages publiques. */
export function Header() {
  const t = useTranslations("nav");

  const links = [
    { href: "/", label: t("home") },
    { href: "/menu", label: t("menu") },
    { href: "/le-restaurant", label: t("restaurant") },
    { href: "/infos", label: t("infos") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-ink text-white">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo (placeholder en attendant le logo maki souriant du client) */}
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-gradient text-lg">
            🍣
          </span>
          <span className="font-display text-lg leading-none tracking-wide">
            SUSHI<span className="text-gradient"> SMILE</span>
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <OpenStatusBadge className="hidden sm:inline-flex" />
          <LocaleSwitcher />
          <CartButton />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/menu">{t("order")}</Link>
          </Button>
        </div>
      </div>

      {/* Barre de navigation mobile */}
      <nav className="flex items-center justify-around border-t border-white/10 py-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-xs font-medium text-white/80 transition-colors hover:text-white"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
