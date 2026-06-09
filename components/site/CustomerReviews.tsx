import { reviews, googleMeta } from "@/lib/reviews";
import { ReviewsColumn } from "@/components/site/ReviewsColumn";
import { Stars, GoogleG } from "@/components/site/Stars";
import { Reveal } from "@/components/site/Reveal";

/** Décale un tableau pour varier le contenu d'une colonne à l'autre. */
function rotate<T>(arr: T[], by: number): T[] {
  const n = arr.length;
  return arr.map((_, i) => arr[(i + by) % n]);
}

/**
 * Section « Avis clients » de l'accueil : en-tête avec note Google globale,
 * puis 1 à 3 colonnes d'avis défilant verticalement (responsive). Effet de
 * fondu haut/bas pour une intégration premium.
 */
export function CustomerReviews({
  kicker,
  title,
  subtitle,
  ratingText,
  countText,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  ratingText: string;
  countText: string;
}) {
  const col1 = reviews;
  const col2 = rotate(reviews, 2);
  const col3 = rotate(reviews, 4);

  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="container">
        {/* En-tête */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            {kicker}
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            {subtitle}
          </p>

          {/* Badge note Google */}
          <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border border-black/5 bg-card px-6 py-4 shadow-lg shadow-ink/5">
            <div className="flex items-center gap-2">
              <GoogleG className="size-6" />
              <span className="font-medium tracking-tight">Google</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl leading-none text-foreground">
                {ratingText}
              </span>
              <Stars rating={googleMeta.rating} size="size-5" />
            </div>
            <span className="text-sm text-muted-foreground">{countText}</span>
          </div>
        </Reveal>

        {/* Colonnes défilantes */}
        <div className="pause-on-hover relative mt-12 flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]">
          <div className="h-[34rem] overflow-hidden md:h-[40rem]">
            <ReviewsColumn reviews={col1} duration={42} />
          </div>
          <div className="hidden h-[34rem] overflow-hidden md:block md:h-[40rem]">
            <ReviewsColumn reviews={col2} duration={54} />
          </div>
          <div className="hidden h-[34rem] overflow-hidden lg:block lg:h-[40rem]">
            <ReviewsColumn reviews={col3} duration={48} />
          </div>
        </div>
      </div>
    </section>
  );
}
