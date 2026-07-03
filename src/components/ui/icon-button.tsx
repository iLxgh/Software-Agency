"use client";

import { useRef, type ButtonHTMLAttributes } from "react";
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

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  size?: IconGlyphSize;
  variant?: IconGlyphVariant;
  /** Anima la entrada con un "pop" (escala + rotación). */
  animateIn?: boolean;
  /** Retraso del pop, en segundos. */
  delay?: number;
};

/** Standalone clickable icon button (e.g. sound toggle). Use IconBadge instead when nesting inside an <a>. */
export function IconButton({
  icon: Icon,
  size = "md",
  variant = "solid",
  className,
  animateIn = false,
  delay = 0,
  ...props
}: IconButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

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
    <button
      ref={ref}
      type="button"
      className={cx(
        "flex items-center justify-center rounded-lg",
        iconGlyphSizeClasses[size],
        iconGlyphVariantClasses[variant],
        className
      )}
      {...props}
    >
      <Icon className={iconGlyphIconSizeClasses[size]} strokeWidth={2.5} />
    </button>
  );
}
