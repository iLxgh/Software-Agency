"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CoverBlurOptions = {
  max?: number;

  start?: string;

  end?: string;

  ease?: string;
};

export function useCoverBlur<T extends HTMLElement>(
  sectionRef: RefObject<T | null>,
  {
    max = 12,
    start = "top 75%",
    end = "top top",
    ease = "power2.in",
  }: CoverBlurOptions = {},
) {
  useGSAP(
    () => {
      const section = sectionRef.current;
      const cover = section?.nextElementSibling as HTMLElement | null;
      if (!section || !cover) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

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
    { scope: sectionRef, dependencies: [max, start, end, ease] },
  );
}
