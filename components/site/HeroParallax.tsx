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
  const videoRef = useRef<HTMLVideoElement>(null);

  // Autoplay mobile fiable : iOS/Safari exigent la *propriété* `muted` (l'attribut
  // JSX ne suffit pas avec React) puis un play() explicite. Repli si le navigateur
  // traîne (canplay) ou bloque jusqu'à la 1re interaction.
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = true;
    vid.defaultMuted = true;

    const tryPlay = () => {
      const p = vid.play();
      if (p) p.catch(() => {});
    };
    tryPlay();
    vid.addEventListener("canplay", tryPlay);
    const onInteract = () => tryPlay();
    window.addEventListener("touchstart", onInteract, { passive: true, once: true });
    window.addEventListener("scroll", onInteract, { passive: true, once: true });

    return () => {
      vid.removeEventListener("canplay", tryPlay);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("scroll", onInteract);
    };
  }, [video]);

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
          ref={videoRef}
          src={video}
          poster={src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
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
