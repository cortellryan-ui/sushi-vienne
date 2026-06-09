"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Média de hero avec effet parallax : il se déplace plus lentement que le
 * scroll, donnant l'impression qu'il « suit » quand on descend. Combine un
 * léger zoom (ken-burns) et un translate piloté au scroll sur le conteneur.
 * Désactivé si l'utilisateur préfère les animations réduites.
 *
 * Si `video` est fourni, la vidéo est jouée en boucle (muette, autoplay) avec
 * l'image `src` en poster pendant le chargement ; sinon l'image seule s'affiche.
 */
export function HeroParallax({
  src,
  alt,
  video,
}: {
  src: string;
  alt: string;
  video?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      el.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-x-0 -top-[15%] h-[130%] will-change-transform"
    >
      {video ? (
        <video
          src={video}
          poster={src}
          autoPlay
          muted
          loop
          playsInline
          aria-label={alt}
          className="animate-kenburns size-full object-cover"
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="animate-kenburns object-cover"
        />
      )}
    </div>
  );
}
