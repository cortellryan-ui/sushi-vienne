import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, ChevronDown, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { OpenStatusBadge } from "@/components/site/OpenStatusBadge";
import { Reveal } from "@/components/site/Reveal";
import { HeroParallax } from "@/components/site/HeroParallax";
import { PromoBanner } from "@/components/site/PromoBanner";
import { CustomerReviews } from "@/components/site/CustomerReviews";
import { ZinouButcher } from "@/components/site/ZinouButcher";
import { SushiGallery } from "@/components/site/SushiGallery";
import { googleMeta } from "@/lib/reviews";
import { RESTAURANT } from "@/lib/restaurant";

const HERO_IMG = "/photos/hero-flamme.jpg";
const HERO_VIDEO = "/videos/hero.mp4";

// Vitrine catégories (photos propres, cohérentes avec le nom, sans carte de visite).
const CATEGORIES = [
  { label: "Plateaux", img: "/photos/plats/plat-100.jpg" },
  { label: "California", img: "/photos/plats/plat-84.jpg" },
  { label: "Makis", img: "/photos/plats/plat-118.jpg" },
  { label: "Sashimi", img: "/photos/plats/plat-187.jpg" },
  { label: "Croustillants", img: "/photos/plats/plat-82.jpg" },
  { label: "Desserts", img: "/photos/plats/plat-200.jpg" },
];

export default function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = useTranslations("home");

  return (
    <>
      {/* ===== HERO PLEIN ÉCRAN ===== */}
      <section className="relative flex h-[88vh] min-h-[560px] w-full items-end overflow-hidden bg-ink text-white">
        <HeroParallax
          src={HERO_IMG}
          video={HERO_VIDEO}
          alt="Cuisson au wok en flammes chez Sushi Smile"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/10 to-transparent" />

        <div className="container relative z-10 pb-16 md:pb-24">
          <Reveal>
            <p className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand backdrop-blur">
              {t("heroKicker")}
            </p>
            <h1 className="max-w-3xl whitespace-pre-line font-serif text-5xl font-medium leading-[1.08] sm:text-6xl lg:text-7xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-lg text-base text-white/80 sm:text-lg">
              {t("heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/menu">
                  {t("heroOrder")} <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Link href="/menu">{t("heroMenu")}</Link>
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white/60">
          <ChevronDown className="size-6" />
        </div>
      </section>

      {/* ===== BANDEAU COMMANDE ===== */}
      <section className="sticky top-16 z-20 border-b bg-white/95 backdrop-blur">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-brand-gradient px-4 py-1.5 text-sm font-semibold text-white">
              {t("takeaway")}
            </span>
            <OpenStatusBadge className="bg-ink/5 !text-foreground" />
          </div>
          <p className="hidden text-sm text-muted-foreground lg:block">
            {t("pickupShort")}
          </p>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${RESTAURANT.phone.tel}`}
              className="hidden items-center gap-1.5 text-sm font-medium text-foreground hover:text-brand sm:flex"
            >
              <Phone className="size-4 text-brand" /> {RESTAURANT.phone.display}
            </a>
            <Button asChild size="sm">
              <Link href="/menu">{t("heroOrder")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== BANDEAU PROMO ===== */}
      <PromoBanner
        badge={t("promoBadge")}
        title={t("promoTitle")}
        cta={t("promoCta")}
        features={[t("promoFeat1"), t("promoFeat2"), t("promoFeat3")]}
      />

      {/* ===== VITRINE CATÉGORIES (BENTO) ===== */}
      <section className="container py-16 md:py-24">
        <Reveal className="mb-10 text-center">
          <h2 className="font-serif text-4xl font-medium sm:text-5xl md:text-6xl">
            {t("categoriesTitle")}
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.label} delay={i * 80}>
              <Link
                href="/menu"
                className="group relative block aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-black/5 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl"
              >
                <Image
                  src={c.img}
                  alt={c.label}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
                  <span className="font-display text-xl text-white drop-shadow md:text-2xl">
                    {c.label}
                  </span>
                  <span className="grid size-9 place-items-center rounded-full bg-white/20 backdrop-blur transition duration-300 group-hover:scale-110 group-hover:bg-brand">
                    <ArrowRight className="size-4 text-white" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild size="lg" variant="ink">
            <Link href="/menu">
              {t("menuPreviewCta")} <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      {/* ===== GALERIE DÉFILANTE (vraies photos de plats) ===== */}
      <SushiGallery />

      {/* ===== AMBIANCE / LE RESTAURANT ===== */}
      <section className="bg-white py-16 md:py-24">
        <div className="container grid items-center gap-10 md:grid-cols-2">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="/photos/restaurant/resto-1.jpg"
              alt="L'équipe Sushi Smile au travail en cuisine"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>

          <Reveal delay={100}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">
              {t("ambianceTitle")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("ambianceText")}
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link href="/le-restaurant">
                {t("ambianceCta")} <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ===== AVIS CLIENTS (GOOGLE) ===== */}
      <CustomerReviews
        kicker={t("reviewsKicker")}
        title={t("reviewsTitle")}
        subtitle={t("reviewsSubtitle")}
        ratingText={googleMeta.rating.toLocaleString(locale, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}
        countText={`${googleMeta.count}+ ${t("reviewsWord")}`}
      />

      {/* ===== RÉASSURANCE : BOUCHERIE ZINOU ===== */}
      <ZinouButcher />

      {/* ===== BANDEAU UBER EATS ===== */}
      <section className="bg-cream">
        <div className="container py-12">
          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-ink px-8 py-8 text-center text-white sm:flex-row sm:text-left">
            <div>
              <h2 className="font-display text-2xl">{t("uberTitle")}</h2>
              <p className="mt-1 text-sm text-white/60">{t("uberText")}</p>
            </div>
            <Button asChild size="lg">
              <a
                href={RESTAURANT.uberEatsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("uberCta")} <ArrowRight />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
