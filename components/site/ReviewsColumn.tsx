"use client";

import React from "react";
import type { Review } from "@/lib/reviews";
import { Stars, GoogleG } from "@/components/site/Stars";

/** Initiales colorées en guise d'avatar (pas d'images externes cassables). */
function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="w-full max-w-sm rounded-3xl border border-black/5 bg-card p-7 shadow-xl shadow-ink/5 md:p-8">
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        <GoogleG className="size-5 shrink-0 opacity-90" />
      </div>
      <blockquote className="mt-4 text-[15px] leading-relaxed text-foreground/85">
        “{review.text}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
          {initials(review.name)}
        </span>
        <span className="flex flex-col">
          <span className="font-medium leading-5 tracking-tight">
            {review.name}
          </span>
          <span className="text-sm leading-5 tracking-tight text-muted-foreground">
            {review.role ?? "Avis Google"}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Colonne d'avis qui défile verticalement en boucle (translateY -50%).
 * Le contenu est dupliqué pour une boucle sans couture. La vitesse se règle
 * via `duration`. Défilement figé sur prefers-reduced-motion (voir globals.css)
 * et au survol (classe pause-on-hover sur le parent).
 */
export function ReviewsColumn({
  reviews,
  className,
  duration = 40,
}: {
  reviews: Review[];
  className?: string;
  duration?: number;
}) {
  return (
    <div className={className}>
      <div
        className="animate-scroll-y flex flex-col gap-6 pb-6"
        style={{ ["--scroll-duration" as string]: `${duration}s` }}
      >
        {[0, 1].map((dup) => (
          <React.Fragment key={dup}>
            {reviews.map((review, i) => (
              <ReviewCard key={`${dup}-${i}`} review={review} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export { ReviewCard };
