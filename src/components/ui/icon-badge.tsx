"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { LucideIcon } from "lucide-react";
import {
  cx,
  iconGlyphIconSizeClasses,
  iconGlyphSizeClasses,
  iconGlyphVariantClasses,
  type IconGlyphSize,
  type IconGlyphVariant,
} from "./icon-glyph-styles";
import { ENTRANCE } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

type IconBadgeProps = {
  icon: LucideIcon;
  size?: IconGlyphSize;
  variant?: IconGlyphVariant;
  className?: string;
  /** Anima la entrada con un "pop" (escala + rotación). */
  animateIn?: boolean;
  /** Retraso del pop, en segundos. */
  delay?: number;
};

/** Decorative icon bubble for use inside links (e.g. arrow badges next to a CTA label). */
export function IconBadge({
  icon: Icon,
  size = "md",
  variant = "brand",
  className,
  animateIn = false,
  delay = 0,
}: IconBadgeProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!animateIn) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduce) return;

      gsap.from(ref.current, {
        scale: 0,
        rotate: -35,
        autoAlpha: 0,
        transformOrigin: "center",
        duration: ENTRANCE.icon.duration,
        delay,
        ease: ENTRANCE.icon.ease,
      });
    },
    { scope: ref, dependencies: [animateIn, delay] }
  );

  return (
    <span
      ref={ref}
      className={cx(
        "flex shrink-0 items-center justify-center rounded-lg",
        iconGlyphSizeClasses[size],
        iconGlyphVariantClasses[variant],
        className
      )}
    >
      <Icon className={iconGlyphIconSizeClasses[size]} strokeWidth={2.5} />
    </span>
  );
}
