"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Image de hero avec effet parallax : elle se déplace plus lentement que le
 * scroll, donnant l'impression qu'elle « suit » quand on descend. Combine un
 * léger zoom (ken-burns) sur l'image et un translate piloté au scroll sur le
 * conteneur. Désactivé si l'utilisateur préfère les animations réduites.
 */
export function HeroParallax({ src, alt }: { src: string; alt: string }) {
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
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="animate-kenburns object-cover"
      />
    </div>
  );
}
