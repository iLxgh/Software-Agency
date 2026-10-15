"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CoverBlurOptions = {
  /** Blur máximo en px, cuando la sección de arriba queda tapada del todo. */
  max?: number;
  /**
   * Dónde empieza a difuminarse, en posiciones de ScrollTrigger sobre la
   * sección que cubre. "top bottom" = en cuanto asoma por abajo (el blur se
   * reparte por todo un viewport y se nota pronto); "top 75%" lo retrasa hasta
   * que ya subió un cuarto de pantalla.
   */
  start?: string;
  /** Dónde llega al blur máximo. Por defecto, cobertura completa. */
  end?: string;
  /**
   * Curva del blur dentro de ese tramo. "power2.in" lo mantiene casi a cero al
   * principio y lo concentra al final, que es cuando de verdad tapa; "none" lo
   * reparte lineal.
   */
  ease?: string;
};

/**
 * Efecto de superposición: la sección se queda fija (necesita `sticky` en su
 * clase) y su hermana siguiente sube por encima cubriéndola, mientras esta se
 * difumina en proporción a cuánto la tapa.
 *
 * El progreso se lee del scroll de la sección de abajo: desde que asoma por el
 * borde inferior del viewport hasta que su borde superior llega arriba del todo.
 */
export function useCoverBlur<T extends HTMLElement>(
  sectionRef: RefObject<T | null>,
  {
    max = 12,
    start = "top 75%",
    end = "top top",
    ease = "power2.in",
  }: CoverBlurOptions = {}
) {
  useGSAP(
    () => {
      const section = sectionRef.current;
      const cover = section?.nextElementSibling as HTMLElement | null;
      if (!section || !cover) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduce) return;

      // Se anima un proxy y se aplica el filtro en onUpdate (GSAP no interpola
      // `filter: blur()` de forma nativa).
      const state = { blur: 0 };
      const apply = () => {
        section.style.filter = state.blur ? `blur(${state.blur}px)` : "";
      };

      const tween = gsap.to(state, {
        blur: max,
        ease,
        onUpdate: apply,
        scrollTrigger: { trigger: cover, start, end, scrub: true },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        section.style.filter = "";
      };
    },
    { scope: sectionRef, dependencies: [max, start, end, ease] }
  );
}
