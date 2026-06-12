"use client";

import { useEffect, useRef } from "react";

/**
 * Grande vidéo d'ambiance avec effet parallaxe au scroll : la vidéo (plus haute
 * que son cadre) se décale doucement quand on descend → elle « suit » le scroll.
 * Autoplay silencieux + boucle.
 */
export function AmbianceVideo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const wrap = wrapRef.current;
      const vid = videoRef.current;
      if (!wrap || !vid) return;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress ~ -1 (cadre sous le viewport) .. 1 (au-dessus)
      const progress = (vh / 2 - (rect.top + rect.height / 2)) / vh;
      const clamped = Math.max(-1, Math.min(1, progress));
      // La vidéo fait 140% de hauteur ; on la garde toujours couvrante (-24%..-4%)
      const ty = -14 + clamped * 10;
      vid.style.transform = `translateY(${ty}%)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="container">
      <div
        ref={wrapRef}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] sm:aspect-video lg:aspect-[21/9]"
      >
        <video
          ref={videoRef}
          src="/videos/ambiance-1.mp4"
          className="absolute inset-x-0 top-0 h-[140%] w-full object-cover will-change-transform"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Vidéo d'ambiance Sushi Smile"
        />
      </div>
    </section>
  );
}
