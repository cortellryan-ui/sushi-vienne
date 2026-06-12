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
    <div className="pb-20">
      {/* En-tête */}
      <Reveal className="container pt-12 text-center md:pt-16">
        <h1 className="font-display text-4xl sm:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </Reveal>

      {/* Vidéo d'ambiance (parallaxe au scroll) */}
      <div className="my-12 md:my-16">
        <AmbianceVideo />
      </div>

      {/* Intro éditoriale (image + texte + points forts) */}
      <section className="container grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl">
          <Image
            src="/photos/restaurant/resto-40.jpg"
            alt="Notre salle à Vienne"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </Reveal>

        <Reveal delay={100}>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Notre maison
          </span>
          <h2 className="mt-5 font-display text-3xl leading-tight sm:text-4xl">
            Le sushi street-food, fait maison à Vienne
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Chez Sushi Smile, on assume une cuisine japonaise généreuse et
            accessible : makis, california, spécialités… préparés sur place avec
            des produits frais. À déguster au comptoir ou à emporter — et toujours
            sans commission quand vous commandez ici.
          </p>

          <Button asChild size="lg" className="mt-8">
            <Link href="/menu">
              Voir la carte <ArrowRight />
            </Link>
          </Button>
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
            <h2 className="font-display text-3xl sm:text-4xl">
              Une envie ? Commandez en quelques clics.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/70">
              Retrait au restaurant, paiement sur place ou en ligne.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/menu">
                  Commander <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
                <Link href="/infos">
                  <Clock /> Horaires & adresse
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
