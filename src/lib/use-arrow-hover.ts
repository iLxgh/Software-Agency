"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP);

/** Dirección hacia la que apunta (y sale) la flecha. */
type ArrowDirection = "up-right" | "down";

// Vector de salida por dirección; el reingreso viene del lado opuesto (negado).
const OUT_VECTORS: Record<ArrowDirection, { x: number; y: number }> = {
  "up-right": { x: 160, y: -160 },
  down: { x: 0, y: 160 },
};

type ArrowHoverOptions = {
  direction?: ArrowDirection;
};

/**
 * Al hacer hover sobre `triggerRef`, la flecha (el <svg> que contiene) sale en la
 * dirección a la que apunta, reaparece desde el lado opuesto y vuelve al centro;
 * al salir hace el recorrido inverso. Recorta la flecha en su badge mientras
 * viaja. Respeta prefers-reduced-motion.
 */
export function useArrowHover<T extends HTMLElement>(
  triggerRef: RefObject<T | null>,
  { direction = "up-right" }: ArrowHoverOptions = {},
) {
  useGSAP(
    () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      const arrow = trigger.querySelector("svg");
      if (!arrow) return;

      // El badge debe recortar la flecha mientras viaja fuera de vista.
      const badge = arrow.parentElement;
      if (badge) badge.style.overflow = "hidden";

      const out = OUT_VECTORS[direction];

      const tl = gsap
        .timeline({ paused: true })
        // Parte del centro y sale hacia donde apunta.
        .fromTo(
          arrow,
          { xPercent: 0, yPercent: 0 },
          {
            xPercent: out.x,
            yPercent: out.y,
            duration: 0.4,
            ease: "power2.inOut",
            immediateRender: false,
          },
        )
        // Reaparece desde el lado opuesto y regresa al centro.
        .fromTo(
          arrow,
          { xPercent: -out.x, yPercent: -out.y },
          {
            xPercent: 0,
            yPercent: 0,
            duration: 0.55,
            ease: "power2.out",
            immediateRender: false,
          },
        );

      const onEnter = () => tl.play();
      const onLeave = () => tl.reverse();

      trigger.addEventListener("mouseenter", onEnter);
      trigger.addEventListener("mouseleave", onLeave);

      return () => {
        trigger.removeEventListener("mouseenter", onEnter);
        trigger.removeEventListener("mouseleave", onLeave);
        tl.kill();
      };
    },
    { scope: triggerRef, dependencies: [direction] },
  );
}
