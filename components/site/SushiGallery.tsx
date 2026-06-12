import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Galerie défilante (carrousel infini) des vraies photos de plats Sushi Smile.
 * Sans bande de fond ni cadre : les photos « flottent » et défilent, avec des
 * tailles variées + ombres douces pour un effet de profondeur (3D).
 * Server Component (animation CSS pure).
 */
const PHOTO_NUMBERS = [99, 63, 45, 100, 187, 130, 84, 205, 60, 200, 110, 17];
const PHOTOS = PHOTO_NUMBERS.map((n) => `/photos/plats/plat-${n}.jpg`);

// Fondu des bords (le masque agit sur l'opacité, quel que soit le fond).
const FADE_MASK =
  "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)";

// Tailles variées (par index d'origine → la boucle reste sans couture).
const SIZES = [
  "h-40 w-52 md:h-52 md:w-64",
  "h-52 w-52 md:h-72 md:w-72",
  "h-44 w-60 md:h-60 md:w-80",
  "h-48 w-48 md:h-64 md:w-64",
];

export function SushiGallery() {
  // Liste dupliquée pour une boucle sans couture (translateX -50%).
  const loop = [...PHOTOS, ...PHOTOS];

  return (
    <section className="relative w-full overflow-hidden py-6">
      <div
        className="relative"
        style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
      >
        <div className="flex w-max items-center gap-8 animate-marquee hover:[animation-play-state:paused]">
          {loop.map((src, index) => {
            const size = SIZES[index % PHOTOS.length % SIZES.length];
            return (
              <div
                key={index}
                className={cn(
                  "group relative shrink-0 overflow-hidden rounded-2xl shadow-2xl shadow-black/25 transition-transform duration-500 hover:-translate-y-1",
                  size,
                )}
              >
                <Image
                  src={src}
                  alt={`Sushi Smile — création ${(index % PHOTOS.length) + 1}`}
                  fill
                  sizes="(max-width: 768px) 14rem, 20rem"
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
