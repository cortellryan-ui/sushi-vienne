import Image from "next/image";

/**
 * Galerie défilante (carrousel infini) des vraies photos de plats Sushi Smile.
 * Bande sombre pleine largeur, animation CSS pure (Server Component).
 * Adapté d'un composant 21st.dev : Unsplash → photos locales + next/image + DA.
 */

// Sélection de plats propres et appétissants (variété de la carte).
const PHOTO_NUMBERS = [99, 63, 45, 100, 187, 130, 84, 205, 60, 200, 110, 17];
const PHOTOS = PHOTO_NUMBERS.map((n) => `/photos/plats/plat-${n}.jpg`);

// Masque de dégradé pour faire disparaître les bords en fondu.
const FADE_MASK =
  "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)";

export function SushiGallery() {
  // Liste dupliquée pour une boucle sans couture (translateX -50%).
  const loop = [...PHOTOS, ...PHOTOS];

  return (
    <section className="relative w-full overflow-hidden bg-ink py-10">
      <div
        className="relative"
        style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
      >
        <div className="flex w-max gap-5 animate-marquee hover:[animation-play-state:paused]">
          {loop.map((src, index) => (
            <div
              key={index}
              className="group relative h-44 w-44 shrink-0 overflow-hidden rounded-2xl shadow-2xl shadow-black/40 sm:h-56 sm:w-56 lg:h-72 lg:w-72"
            >
              <Image
                src={src}
                alt={`Sushi Smile — création ${(index % PHOTOS.length) + 1}`}
                fill
                sizes="(max-width: 640px) 11rem, (max-width: 1024px) 14rem, 18rem"
                className="object-cover transition duration-500 group-hover:scale-110 group-hover:brightness-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
