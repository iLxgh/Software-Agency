"use client";

import { createElement, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

type SplitType = "words" | "chars" | "lines";

type AnimatedTextProps = {
  children: ReactNode;

  as?: ElementType;
  className?: string;

  split?: SplitType;

  from?: number;
  duration?: number;

  stagger?: number;

  delay?: number;
  ease?: string;

  maskPadBottom?: number;
};

export function AnimatedText({
  children,
  as = "p",
  className,
  split = "words",
  from = 100,
  duration = 1.1,
  stagger = 0.09,
  delay = 0,
  ease = "power3.out",
  maskPadBottom = 0,
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      gsap.set(el, { autoAlpha: 0 });

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      let instance: SplitText | null = null;

      const run = () => {
        if (!ref.current) return;
        instance = new SplitText(el, { type: split, mask: split });
        const targets =
          split === "chars"
            ? instance.chars
            : split === "lines"
              ? instance.lines
              : instance.words;

        if (maskPadBottom) {
          targets.forEach((t) => {
            const unit = t as HTMLElement;
            unit.style.paddingBottom = `${maskPadBottom}px`;
            const mask = unit.parentElement;
            if (mask) mask.style.marginBottom = `${-maskPadBottom}px`;
          });
        }

        gsap.set(el, { autoAlpha: 1 });
        if (reduce) return;

        gsap.from(targets, { yPercent: from, duration, stagger, delay, ease });
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => instance?.revert();
    },
    { scope: ref },
  );

  return createElement(as, { ref, className }, children);
}
