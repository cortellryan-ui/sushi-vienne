"use client";

import { useEffect, useRef } from "react";

/**
 * Fond « énergie orange » animé, en Canvas 2D (aucune dépendance, léger).
 * Inspiré du shader fourni (flux orange lumineux) : des orbes d'énergie
 * dérivent en fondu additif sur le fond noir du menu. Respecte
 * prefers-reduced-motion et se met en pause quand l'onglet est masqué.
 */
export function MenuEnergyBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Couleurs de marque (orange vif + rouge-orangé).
    const COLORS: [number, number, number][] = [
      [242, 101, 34],
      [230, 51, 18],
      [255, 140, 60],
    ];
    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: 0.15 + (i / 6) * 0.7,
      y: 0.2 + ((i * 0.37) % 0.6),
      r: 0.22 + ((i * 0.13) % 0.18),
      sp: 0.18 + (i % 3) * 0.12,
      ph: (i * Math.PI) / 3,
      c: COLORS[i % COLORS.length],
    }));

    let raf = 0;
    let t = 0;

    const draw = () => {
      t += 0.016;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const base = Math.min(w, h);
      for (const o of orbs) {
        const x = (o.x + Math.sin(t * o.sp + o.ph) * 0.14) * w;
        const y = (o.y + Math.cos(t * o.sp * 0.8 + o.ph) * 0.14) * h;
        const rad = o.r * base * (1 + Math.sin(t * 0.6 + o.ph) * 0.18);
        const [r, g, b] = o.c;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
        grad.addColorStop(0, `rgba(${r},${g},${b},0.30)`);
        grad.addColorStop(0.45, `rgba(${r},${g},${b},0.10)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      if (!reduce && !document.hidden) raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      if (!document.hidden && !reduce) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    draw();
    if (reduce) cancelAnimationFrame(raf); // une seule frame statique

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="sticky top-0 block h-[100svh] w-full"
    />
  );
}
