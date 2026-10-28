"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LogoMark } from "@/components/ui/logo-mark";
import { LogoWordmark, WORDMARK_HEIGHT } from "@/components/ui/logo-wordmark";
import { lockScroll, unlockScroll } from "@/lib/scroll-to";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const WORD = {
  at: 0.2,
  duration: 1.0,
  stagger: 0.065,
  ease: "power3.out",

  height: 13,

  pad: 13,
} as const;

const TIMING = {
  shape: {
    from: 2,

    to: 48,

    radius: 11,
    duration: 0.8,

    ease: "power2.inOut",
  },

  mark: {
    at: 0,
    duration: 1.2,
    ease: "power2.out",
    from: { yPercent: 160, rotate: -24 },

    fade: { ease: "power2.in" },
  },

  sleeve: {
    at: 0.15,
    duration: 0.55,
    ease: "power3.out",

    reach: Math.round((WORD.height / 19) * 143 + WORD.pad * 2),

    stroke: 3,
  },

  hold: 0.35,

  exit: { duration: 0.5, ease: "power2.inOut" },

  reduced: 0.3,
} as const;

const CONCAVE = (corner: "top" | "bottom", radius: number) =>
  `radial-gradient(circle at 100% ${corner === "top" ? "100%" : "0%"}, transparent ${Math.max(0, radius - 1)}px, #ffffff ${radius}px)`;

const MARK_SIZE = 32;

export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const sleeveRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const jointRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);

  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      lockScroll();
      const finish = () => {
        unlockScroll();
        setDone(true);

        requestAnimationFrame(() =>
          requestAnimationFrame(() => ScrollTrigger.refresh()),
        );
      };

      const patches = gsap.utils.toArray<HTMLElement>(
        jointRef.current?.children ?? [],
      );

      const cap = { w: 0 };
      const applyCap = () => {
        gsap.set(sleeveRef.current, { width: cap.w });

        const real = Math.max(cap.w, TIMING.sleeve.stroke * 2);
        const k = Math.min(TIMING.shape.radius, real / 2);
        patches.forEach((el, i) => {
          gsap.set(el, {
            width: k,
            height: k,
            backgroundImage: CONCAVE(i === 0 ? "top" : "bottom", k),
          });
        });
      };
      applyCap();

      const letters = gsap.utils.toArray<SVGPathElement>(
        wordRef.current?.querySelectorAll("[data-wordmark-path]") ?? [],
      );

      gsap.set(letters, { y: WORDMARK_HEIGHT });

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduce) {
        gsap.set(shapeRef.current, {
          width: TIMING.shape.to,
          height: TIMING.shape.to,
        });
        cap.w = TIMING.sleeve.reach;
        applyCap();
        gsap.set(
          [markRef.current, sleeveRef.current, wordRef.current, ...patches],
          { autoAlpha: 1 },
        );
        gsap.set(letters, { y: 0 });
        gsap.set(groupRef.current, { x: -TIMING.sleeve.reach / 2 });

        gsap.to(root, {
          autoAlpha: 0,
          duration: TIMING.reduced,
          ease: "none",
          onComplete: finish,
        });
        return;
      }

      const tl = gsap.timeline({ onComplete: finish });

      tl.to(shapeRef.current, {
        width: TIMING.shape.to,
        height: TIMING.shape.to,
        duration: TIMING.shape.duration,
        ease: TIMING.shape.ease,
      })

        .from(
          markRef.current,
          {
            ...TIMING.mark.from,
            transformOrigin: "center",
            duration: TIMING.mark.duration,
            ease: TIMING.mark.ease,
          },
          TIMING.mark.at,
        )

        .fromTo(
          markRef.current,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: TIMING.mark.duration,
            ease: TIMING.mark.fade.ease,
            immediateRender: false,
          },
          TIMING.mark.at,
        )

        .addLabel("open", `+=${TIMING.sleeve.at}`)
        .to(
          cap,
          {
            w: TIMING.sleeve.reach,
            duration: TIMING.sleeve.duration,
            ease: TIMING.sleeve.ease,
            onUpdate: applyCap,
          },
          "open",
        )

        .set(
          [sleeveRef.current, wordRef.current, ...patches],
          { autoAlpha: 1 },
          "open",
        )

        .set(
          shapeRef.current,
          { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
          "open",
        )

        .to(
          groupRef.current,
          {
            x: -TIMING.sleeve.reach / 2,
            duration: TIMING.sleeve.duration,
            ease: TIMING.sleeve.ease,
          },
          "open",
        )

        .to(
          letters,
          {
            y: 0,
            duration: WORD.duration,
            stagger: WORD.stagger,
            ease: WORD.ease,
          },
          `open+=${WORD.at}`,
        )

        .to(
          root,
          {
            autoAlpha: 0,
            duration: TIMING.exit.duration,
            ease: TIMING.exit.ease,
          },
          `+=${TIMING.hold}`,
        );

      return () => {
        tl.kill();
        unlockScroll();
      };
    },
    { scope: rootRef },
  );

  if (done) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden

      className="pointer-events-none fixed inset-0 z-[200] grid place-items-center bg-[#131313]"
    >
      <div ref={groupRef} className="relative">
        <div ref={jointRef} aria-hidden>
          {(["top", "bottom"] as const).map((corner) => (
            <div
              key={corner}
              style={{ left: "100%", [corner]: 0 }}
              className="invisible absolute z-10"
            />
          ))}
        </div>

        <div
          ref={sleeveRef}
          style={{
            left: "100%",
            height: TIMING.shape.to,
            borderRadius: TIMING.shape.radius,
            borderWidth: TIMING.sleeve.stroke,
          }}
          className="invisible absolute top-0 box-border overflow-hidden border-white"
        >
          <div
            ref={wordRef}
            className="invisible absolute top-1/2 -translate-y-1/2"
            style={{ left: WORD.pad }}
          >
            <LogoWordmark
              className="w-auto text-white"
              style={{ height: WORD.height }}
            />
          </div>
        </div>

        <div
          ref={shapeRef}

          style={{
            width: TIMING.shape.from,
            height: TIMING.shape.from,
            borderRadius: TIMING.shape.radius,
          }}

          className="relative z-10 grid shrink-0 place-items-center overflow-hidden bg-white"
        >
          <div ref={markRef} className="invisible">
            <LogoMark
              style={{ width: MARK_SIZE, height: MARK_SIZE }}
              className="text-[#131313]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
