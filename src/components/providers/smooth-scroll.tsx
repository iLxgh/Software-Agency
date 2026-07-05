"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scroll con Lenis. Se eligió Lenis (y no ScrollSmoother de GSAP) porque
 * Lenis anima la posición real de scroll en vez de transformar un wrapper, así
 * `position: sticky` (la superposición Organizations→Works) sigue funcionando.
 *
 * Lenis se mueve con el ticker de GSAP para compartir el mismo bucle de RAF que
 * ScrollTrigger, manteniendo sincronizadas las animaciones ligadas al scroll
 * (parallax, blur, etc.). Respeta prefers-reduced-motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const lenis = new Lenis({ lerp: 0.090});

    // Cada scroll de Lenis actualiza ScrollTrigger.
    lenis.on("scroll", ScrollTrigger.update);

    // Un solo bucle de RAF: GSAP maneja el ticker, Lenis se engancha a él.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
