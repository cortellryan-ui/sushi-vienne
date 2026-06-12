import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { AmbianceVideo } from "@/components/site/AmbianceVideo";
import { RestaurantHighlights } from "@/components/site/RestaurantHighlights";

export default function RestaurantPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = useTranslations("restaurant");

  return (
    <div className="bg-cream pb-20">
      {/* En-tête — grand titre orange animé (fond homogène, sans lueur) */}
      <header className="container pt-16 text-center md:pt-24">
        <Reveal>
          <h1 className="animate-shimmer bg-gradient-to-r from-brand via-brand-deep to-brand bg-[length:200%_auto] bg-clip-text py-2 font-serif font-medium text-6xl leading-[1.02] tracking-tight text-transparent sm:text-7xl md:text-8xl">
            {t("title")}
          </h1>
        </Reveal>
      </header>

      {/* Vidéo d'ambiance (parallaxe au scroll) */}
      <div className="my-12 md:my-16">
        <AmbianceVideo />
      </div>

      {/* Notre histoire — vrai restaurant japonais à Vienne depuis 2018 */}
      <section className="container text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            {t("pageKicker")}
          </span>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif font-medium text-3xl leading-tight sm:text-4xl md:text-5xl">
            {t("pageTitle")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t("story")}
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/menu">
              {t("viewMenu")} <ArrowRight />
            </Link>
          </Button>
        </Reveal>

        {/* Grande photo du lieu, avec badge « Depuis 2018 » */}
        <Reveal
          delay={120}
          className="relative mt-12 aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-xl sm:aspect-[16/9]"
        >
          <Image
            src="/photos/restaurant/resto-40.jpg"
            alt={t("imageAlt")}
            fill
            sizes="(max-width: 1024px) 100vw, 1100px"
            className="object-cover"
          />
          <span className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-ink shadow-md backdrop-blur">
            {t("since2018")}
          </span>
        </Reveal>
      </section>

      {/* Points forts (3 colonnes « Voir plus » + bande de réassurance) */}
      <div className="mt-20 md:mt-28">
        <RestaurantHighlights />
      </div>

      {/* Bandeau CTA */}
      <section className="container mt-20 md:mt-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-center text-white md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-brand/30 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-brand-deep/30 blur-[100px]"
          />
          <div className="relative">
            <h2 className="font-serif font-medium text-3xl sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/70">
              {t("ctaText")}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/menu">
                  {t("ctaOrder")} <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
                <Link href="/infos">
                  <Clock /> {t("ctaHours")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
