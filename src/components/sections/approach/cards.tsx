"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NoiseBackground } from "@/components/ui/noise-background";
import { cx } from "@/components/ui/icon-glyph-styles";
import { approachCards } from "./slides";
import { Card } from "./card";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SPEED = 38;

const SWING = {
  stiffness: 60,

  damping: 7.5,

  tiltPerVelocity: 0.008,

  maxTilt: 9,

  scrollToPush: 0.55,

  maxPush: 900,

  pushDecay: 0.08,
} as const;

const LAYOUT = [
  { y: 72, rotate: -3, tone: "light", z: 2, h: "h-[23rem]", height: 368 },
  { y: -64, rotate: 2.5, tone: "green", z: 1, h: "h-[27rem]", height: 432 },
  { y: 48, rotate: 2, tone: "light", z: 3, h: "h-[25rem]", height: 400 },
  { y: -80, rotate: -2.5, tone: "green", z: 1, h: "h-[24rem]", height: 384 },
] as const;

const CENTER_FIX = (() => {
  const box = Math.max(...LAYOUT.map((l) => l.height));
  const top = Math.min(...LAYOUT.map((l) => l.y));
  const bottom = Math.max(...LAYOUT.map((l) => l.y + l.height));
  return (box - (top + bottom)) / 2;
})();

const ADVANCE = "w-[20.8rem]";

const ADVANCE_PX = 20.8 * 16;

export function ApproachCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const [copies, setCopies] = useState(2);

  useEffect(() => {
    const copyWidth = approachCards.length * ADVANCE_PX;
    const sync = () => {
      const needed = 2 * (Math.ceil(window.innerWidth / copyWidth) + 1);
      setCopies((c) => (c === needed ? c : needed));
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      let cancelled = false;

      const run = () => {
        if (cancelled || !trackRef.current) return;

        const half = track.scrollWidth / 2;
        if (!half) return;

        gsap.to(track, {
          xPercent: -50,
          ease: "none",
          duration: half / SPEED,
          repeat: -1,
        });
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      void fonts.then(run);

      return () => {
        cancelled = true;

        gsap.killTweensOf(track);
      };
    },
    { scope: trackRef, dependencies: [copies] },
  );

  useGSAP(
    () => {
      const track = trackRef.current;
      const zone = dragRef.current;
      const section = sectionRef.current;
      if (!track || !zone || !section) return;

      const swings = gsap.utils.toArray<HTMLElement>(track.children);
      const bases = swings.map((_, i) => LAYOUT[i % LAYOUT.length].rotate);
      const tilters = swings.map((el) =>
        gsap.quickSetter(el, "rotation", "deg"),
      );

      swings.forEach((el, i) => {
        gsap.set(el, {
          y: LAYOUT[i % LAYOUT.length].y,
          rotation: bases[i],
          transformOrigin: "50% 0%",
        });
      });

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduce) return;

      const setX = gsap.quickSetter(track, "x", "px");

      let offset = 0;

      let push = 0;

      let tilt = 0;
      let tiltVel = 0;

      let dragging = false;
      let startX = 0;
      let startOffset = 0;
      let lastX = 0;
      let lastT = 0;

      let dragVel = 0;

      let active = true;

      const batchWidth = () => {
        const batches = track.children.length / approachCards.length;
        return batches ? track.scrollWidth / batches : 0;
      };

      const frame = () => {
        if (!active) return;

        const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 1 / 20);
        const decay = Math.pow(SWING.pushDecay, dt);

        if (dragging) {
          dragVel *= decay;
        } else {
          push *= decay;
          offset += push * dt;
        }

        const batch = batchWidth();
        if (batch) {
          offset = gsap.utils.wrap(-batch, 0, offset);
          setX(offset);
        }

        const extra = dragging ? dragVel : push;
        const target = gsap.utils.clamp(
          -SWING.maxTilt,
          SWING.maxTilt,
          -extra * SWING.tiltPerVelocity,
        );

        tiltVel +=
          ((target - tilt) * SWING.stiffness - tiltVel * SWING.damping) * dt;
        tilt += tiltVel * dt;

        for (let i = 0; i < tilters.length; i++) tilters[i](bases[i] + tilt);
      };

      gsap.ticker.add(frame);

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          active = self.isActive;
        },
        onUpdate: (self) => {
          if (dragging) return;

          push = -gsap.utils.clamp(
            -SWING.maxPush,
            SWING.maxPush,
            self.getVelocity() * SWING.scrollToPush,
          );
        },
      });

      const onDown = (e: PointerEvent) => {
        dragging = true;
        startX = lastX = e.clientX;
        lastT = e.timeStamp;
        startOffset = offset;

        push = 0;
        dragVel = 0;
        zone.setPointerCapture(e.pointerId);
        zone.style.cursor = "grabbing";
      };

      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const batch = batchWidth();
        if (!batch) return;

        offset = gsap.utils.wrap(-batch, 0, startOffset + (e.clientX - startX));

        const dt = Math.max(e.timeStamp - lastT, 8) / 1000;
        dragVel = (e.clientX - lastX) / dt;
        lastX = e.clientX;
        lastT = e.timeStamp;
      };

      const onUp = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;

        push = dragVel;
        if (zone.hasPointerCapture(e.pointerId)) {
          zone.releasePointerCapture(e.pointerId);
        }
        zone.style.cursor = "";
      };

      zone.addEventListener("pointerdown", onDown);
      zone.addEventListener("pointermove", onMove);
      zone.addEventListener("pointerup", onUp);
      zone.addEventListener("pointercancel", onUp);

      return () => {
        gsap.ticker.remove(frame);
        st.kill();
        zone.removeEventListener("pointerdown", onDown);
        zone.removeEventListener("pointermove", onMove);
        zone.removeEventListener("pointerup", onUp);
        zone.removeEventListener("pointercancel", onUp);
      };
    },
    { scope: sectionRef, dependencies: [copies] },
  );

  return (
    <section
      ref={sectionRef}
      id="approach"

      className="relative z-10 mt-[150px] flex min-h-screen flex-col overflow-hidden bg-[#131313] text-white"
      aria-label="Cuatro formas de trabajo"
    >
      <NoiseBackground
        className="absolute inset-0 h-full w-full mix-blend-screen"
        opacity={0.05}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-white/10" />
      </div>

      <div
        ref={dragRef}
        className="relative z-10 flex flex-1 touch-pan-y items-center py-12"
      >
        <div
          ref={trackRef}
          className="flex w-max will-change-transform"

          style={{ marginTop: CENTER_FIX }}
        >
          {Array.from({ length: copies }, (_, copy) =>
            approachCards.map((card, i) => {
              const { tone, z, h } = LAYOUT[i % LAYOUT.length];
              return (
                <div
                  key={`${copy}-${card.title}`}
                  className={cx("relative", ADVANCE)}

                  style={{ zIndex: z }}

                  aria-hidden={copy > 0 || undefined}
                >
                  <Card {...card} tone={tone} index={i} className={h} />
                </div>
              );
            }),
          )}
        </div>
      </div>
    </section>
  );
}
