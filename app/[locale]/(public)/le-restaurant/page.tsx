import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, ChefHat, Clock, Leaf, MapPin, ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { AmbianceVideo } from "@/components/site/AmbianceVideo";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: ChefHat, title: "Fait maison", text: "Tout est préparé sur place, chaque jour." },
  { icon: Leaf, title: "Produits frais", text: "Poisson, légumes et riz choisis pour leur fraîcheur." },
  { icon: ShoppingBag, title: "Sur place & à emporter", text: "Commandez en ligne, récupérez au comptoir." },
  { icon: MapPin, title: "À Vienne", text: "4 rue du 11 Novembre, 38200." },
];

// Grille « bento » : photos du lieu, de l'équipe et des plats, tailles variées.
const BENTO: { src: string; alt: string; span: string }[] = [
  { src: "/photos/restaurant/resto-40.jpg", alt: "Notre salle et le comptoir", span: "md:col-span-2 md:row-span-2" },
  { src: "/photos/restaurant/resto-8.jpg", alt: "Préparation des makis", span: "" },
  { src: "/photos/plats/plat-100.jpg", alt: "Plateau de sushis", span: "" },
  { src: "/photos/restaurant/resto-1.jpg", alt: "L'équipe en cuisine", span: "md:col-span-2" },
  { src: "/photos/plats/plat-130.jpg", alt: "Chirashi maison", span: "md:row-span-2" },
  { src: "/photos/restaurant/resto-62.jpg", alt: "Au comptoir, prise des commandes", span: "md:col-span-2" },
  { src: "/photos/plats/plat-99.jpg", alt: "Assortiment de sushis", span: "md:col-span-2" },
  { src: "/photos/restaurant/resto-20.jpg", alt: "Avocat frais", span: "" },
];

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

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-md shadow-brand/20">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold leading-snug">{f.title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {f.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Button asChild size="lg" className="mt-8">
            <Link href="/menu">
              Voir la carte <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </section>

      {/* Grille bento */}
      <section className="container mt-20 md:mt-28">
        <Reveal className="mb-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl">En images</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Le lieu, l’équipe et nos créations.
          </p>
        </Reveal>

        <div className="grid grid-flow-dense grid-cols-2 gap-3 [grid-auto-rows:9rem] md:grid-cols-4 md:gap-4 md:[grid-auto-rows:11rem]">
          {BENTO.map((p) => (
            <div
              key={p.src}
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-cream",
                p.span,
              )}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

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
