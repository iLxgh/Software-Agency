"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP);

type MagneticOptions = {
  /** Qué tanto sigue el botón al cursor (0-1). */
  strength?: number;
};

/**
 * Botón magnético: mientras el cursor está dentro, el elemento se "pega" hacia él;
 * al entrar hace un rebote de scale (baja y sube) y al salir vuelve a su posición
 * con un mini rebote elástico. Respeta prefers-reduced-motion.
 */
export function useMagnetic<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { strength = 0.35 }: MagneticOptions = {},
) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      // Mientras el cursor está dentro, el botón se pega hacia él.
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const relX = e.clientX - (r.left + r.width / 2);
        const relY = e.clientY - (r.top + r.height / 2);
        gsap.to(el, {
          x: relX * strength,
          y: relY * strength,
          duration: 0.6,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      // Al entrar: el scale baja y luego rebota hacia arriba.
      const onEnter = () => {
        gsap
          .timeline()
          .to(el, { scale: 0.92, duration: 0.15, ease: "power2.out" })
          .to(el, { scale: 1.05, duration: 0.35, ease: "back.out(2.5)" });
      };

      // Al salir: vuelve a su posición con mini rebote y el scale a normal.
      const onLeave = () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)",
          overwrite: "auto",
        });
        gsap.to(el, {
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);

      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: ref, dependencies: [strength] },
  );
}
