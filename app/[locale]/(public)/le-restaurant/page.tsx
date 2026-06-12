import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/site/Reveal";
import { SushiGallery } from "@/components/site/SushiGallery";

// Grandes photos pleine largeur (style Sushi Shop) — pas de petites vignettes.
const PHOTOS: { src: string; caption: string }[] = [
  { src: "/photos/hero-flamme.jpg", caption: "Cuisson au wok, en flammes" },
  { src: "/photos/restaurant/resto-56.jpg", caption: "Préparation maison, ingrédients frais" },
  { src: "/photos/restaurant/resto-40.jpg", caption: "Notre salle — 4 rue du 11 Novembre, Vienne" },
  { src: "/photos/restaurant/resto-8.jpg", caption: "Découpe du saumon" },
  { src: "/photos/restaurant/resto-62.jpg", caption: "Au comptoir" },
];

export default function RestaurantPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = useTranslations("restaurant");

  return (
    <div className="py-16 md:py-24">
      <Reveal className="container mb-10 text-center">
        <h1 className="font-display text-4xl sm:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </Reveal>

      {/* Galerie défilante de nos créations (pleine largeur) */}
      <div className="mb-16 md:mb-24">
        <SushiGallery />
      </div>

      <div className="container space-y-6 md:space-y-10">
        {PHOTOS.map((p, i) => (
          <Reveal key={p.src} delay={i * 60}>
            <figure className="group relative overflow-hidden rounded-3xl">
              <div className="relative aspect-[16/10] w-full md:aspect-[16/8]">
                <Image
                  src={p.src}
                  alt={p.caption}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <figcaption className="absolute bottom-0 left-0 p-6 font-display text-xl text-white md:text-2xl">
                {p.caption}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
