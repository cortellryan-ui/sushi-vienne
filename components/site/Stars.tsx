import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Rangée d'étoiles Google (jaune doré). Gère les demi-étoiles pour les notes
 * décimales (ex. 4,8). Purement décoratif → masqué aux lecteurs d'écran,
 * la note chiffrée à côté porte l'information.
 */
export function Stars({
  rating = 5,
  className,
  size = "size-4",
}: {
  rating?: number;
  className?: string;
  size?: string;
}) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const total = 5;

  return (
    <div
      aria-hidden
      className={cn("flex items-center gap-0.5 text-amber-400", className)}
    >
      {Array.from({ length: total }).map((_, i) => {
        if (i < full) {
          return <Star key={i} className={cn(size, "fill-current")} />;
        }
        if (i === full && hasHalf) {
          return <StarHalf key={i} className={cn(size, "fill-current")} />;
        }
        return <Star key={i} className={cn(size, "text-amber-400/25")} />;
      })}
    </div>
  );
}

/** Logo « G » officiel multicolore de Google, en SVG inline. */
export function GoogleG({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 2.97 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.12l7.35 5.7C13.42 13.62 18.27 9.75 24 9.75z"
      />
    </svg>
  );
}
