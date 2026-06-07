import { useTranslations } from "next-intl";
import { MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RESTAURANT } from "@/lib/restaurant";
import { OpeningHoursTable } from "./OpeningHoursTable";

/** Pied de page noir : identité, horaires, contact, navigation. */
export function Footer() {
  const t = useTranslations();
  const year = 2026; // millésime statique (Date.now indisponible côté build)

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/menu", label: t("nav.menu") },
    { href: "/le-restaurant", label: t("nav.restaurant") },
    { href: "/infos", label: t("nav.infos") },
  ] as const;

  return (
    <footer className="bg-ink text-white">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        {/* Identité */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-gradient text-lg">
              🍣
            </span>
            <span className="font-display text-lg tracking-wide">
              SUSHI SMILE
            </span>
          </div>
          <p className="mt-3 text-sm text-white/60">{t("footer.tagline")}</p>
        </div>

        {/* Horaires */}
        <div>
          <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-white/90">
            {t("footer.hours")}
          </h3>
          <OpeningHoursTable className="text-white/80 [&_dt]:text-white/50" />
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-white/90">
            {t("footer.contact")}
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>{RESTAURANT.address.full}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-brand" />
              <a href={`tel:${RESTAURANT.phone.tel}`} className="hover:text-white">
                {RESTAURANT.phone.display}
              </a>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="mb-3 font-display text-sm uppercase tracking-wider text-white/90">
            {t("footer.navigation")}
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <p>
            © {year} {RESTAURANT.name}. {t("footer.rights")}
          </p>
          <p>{t("footer.madeBy")}</p>
        </div>
      </div>
    </footer>
  );
}
