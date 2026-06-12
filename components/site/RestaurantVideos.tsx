/**
 * Bande « ambiance » : 2 vidéos (photos animées) du restaurant, en autoplay
 * silencieux et en boucle. Remplace l'ancien carrousel de photos.
 * Server Component (attributs HTML natifs, aucun JS).
 */
const VIDEOS = ["/videos/ambiance-1.mp4", "/videos/ambiance-2.mp4"];

export function RestaurantVideos() {
  return (
    <section className="container">
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {VIDEOS.map((src) => (
          <video
            key={src}
            src={src}
            className="aspect-video w-full rounded-3xl object-cover shadow-xl"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Vidéo d'ambiance Sushi Smile"
          />
        ))}
      </div>
    </section>
  );
}
