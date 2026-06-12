import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ChefHat,
  Route,
  ShieldCheck,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";

const ZINOU_IMG = "/photos/boucherie-zinou.jpg";

/**
 * Section « réassurance » de l'accueil : met en avant le partenariat avec la
 * boucherie ZINOU comme principal avantage concurrentiel (viande fraîche,
 * circuit court, traçabilité). Univers premium, fond noir profond pour faire
 * ressortir le visuel et inspirer confiance / savoir-faire.
 *
 * Server Component : les animations au scroll sont portées par <Reveal/>.
 */
export function ZinouButcher() {
  const t = useTranslations("zinou");

  const features = [
    { icon: CalendarCheck, title: t("feat1Title"), text: t("feat1Text") },
    { icon: Route, title: t("feat2Title"), text: t("feat2Text") },
    { icon: BadgeCheck, title: t("feat3Title"), text: t("feat3Text") },
    { icon: ChefHat, title: t("feat4Title"), text: t("feat4Text") },
  ];

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* Halos décoratifs (lueur orange premium) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 size-[28rem] rounded-full bg-brand/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-0 size-[24rem] rounded-full bg-brand-deep/20 blur-[120px]"
      />

      <div className="container relative grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-16">
        {/* ===== COLONNE TEXTE ===== */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand backdrop-blur">
              <ShieldCheck className="size-3.5" />
              {t("kicker")}
            </span>

            <h2 className="mt-5 font-serif font-medium text-3xl leading-[1.1] sm:text-4xl md:text-5xl">
              {t("title")}
            </h2>

            {/* Badge fort 100 % */}
            <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-brand-gradient px-5 py-3 shadow-lg shadow-brand/30">
              <BadgeCheck className="size-6 shrink-0 text-white" />
              <span className="text-sm font-bold leading-tight text-white sm:text-base">
                {t("badge")}
              </span>
            </div>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              {t("text")}
            </p>
          </Reveal>

          {/* ===== 4 POINTS FORTS ===== */}
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={120 + i * 90}>
                  <div className="flex h-full gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors duration-300 hover:border-brand/40 hover:bg-white/[0.07]">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-md shadow-brand/20">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold leading-snug">{f.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">
                        {f.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Produits concernés + CTA */}
          <Reveal delay={500}>
            <p className="mt-8 text-sm text-white/50">
              <span className="font-medium text-white/80">
                {t("productsLabel")}
              </span>{" "}
              {t("products")}
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/menu">
                {t("cta")} <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>

        {/* ===== COLONNE VISUEL ===== */}
        <Reveal delay={150} className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50 sm:aspect-[4/4.4]">
            <Image
              src={ZINOU_IMG}
              alt={t("imageAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Voile bas pour lisibilité du badge flottant */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />

            {/* Badge partenaire flottant */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-ink/70 px-4 py-3 backdrop-blur-md">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-gradient text-white">
                <ShieldCheck className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-white/50">
                  {t("partnerLabel")}
                </p>
                <p className="truncate font-display text-lg leading-tight text-white">
                  {t("partnerName")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
