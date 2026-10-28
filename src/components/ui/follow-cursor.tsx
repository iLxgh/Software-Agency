"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cx } from "./icon-glyph-styles";

gsap.registerPlugin(useGSAP);

type FollowCursorProps = {
  children: ReactNode;

  className?: string;

  content: ReactNode;
};

export function FollowCursor({
  children,
  className,
  content,
}: FollowCursorProps) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const zone = zoneRef.current;
      const dot = dotRef.current;
      if (!zone || !dot) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const fine = window.matchMedia("(pointer: fine)").matches;
      if (reduce || !fine) return;

      gsap.set(dot, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
      zone.style.cursor = "none";

      const moveX = gsap.quickTo(dot, "x", { duration: 0.45, ease: "power3" });
      const moveY = gsap.quickTo(dot, "y", { duration: 0.45, ease: "power3" });

      const onMove = (e: PointerEvent) => {
        moveX(e.clientX);
        moveY(e.clientY);
      };

      const onEnter = (e: PointerEvent) => {
        gsap.set(dot, { x: e.clientX, y: e.clientY });
        gsap.to(dot, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          ease: "back.out(1.7)",

          overwrite: "auto",
        });
      };

      const onLeave = () => {
        gsap.to(dot, {
          scale: 0,
          autoAlpha: 0,
          duration: 0.35,
          ease: "power3.in",
          overwrite: "auto",
        });
      };

      zone.addEventListener("pointermove", onMove);
      zone.addEventListener("pointerenter", onEnter);
      zone.addEventListener("pointerleave", onLeave);

      return () => {
        zone.removeEventListener("pointermove", onMove);
        zone.removeEventListener("pointerenter", onEnter);
        zone.removeEventListener("pointerleave", onLeave);
        zone.style.cursor = "";
      };
    },
    { scope: zoneRef },
  );

  return (
    <div ref={zoneRef} className={className}>
      {content}

      <div
        ref={dotRef}
        aria-hidden
        className={cx(
          "pointer-events-none fixed top-0 left-0 z-50 grid size-11 place-items-center",
          "rounded-full bg-brand text-brand-foreground shadow-[0_4px_20px_rgba(0,0,0,0.2)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
