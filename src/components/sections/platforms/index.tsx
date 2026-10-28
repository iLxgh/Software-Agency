"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { NoiseBackground } from "@/components/ui/noise-background";
import { Quadrant } from "./quadrant";
import { platforms, platformsIntro } from "./slides";
import { ENTRANCE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const GROW = 1.12;
const SHRINK = 2 - GROW;

export function Platforms() {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [hovered, setHovered] = useState<number | null>(null);

  const track = (isFirst: boolean) =>
    `${isFirst ? GROW : SHRINK}fr ${isFirst ? SHRINK : GROW}fr`;

  const cols = hovered === null ? "1fr 1fr" : track(hovered % 2 === 0);
  const rows = hovered === null ? "1fr 1fr" : track(hovered < 2);

  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const texts = gsap.utils.toArray<HTMLElement>(
        header.querySelectorAll("[data-reveal]"),
      );
      const badge = header.querySelector("svg")?.parentElement ?? null;

      gsap.set([...texts, ...(badge ? [badge] : [])], { autoAlpha: 0 });

      let splits: SplitText[] = [];
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        splits = texts.map(
          (el) => new SplitText(el, { type: "words", mask: "words" }),
        );

        splits.forEach((s) =>
          s.words.forEach((w) => {
            const unit = w as HTMLElement;
            unit.style.paddingBottom = "6px";
            const mask = unit.parentElement;
            if (mask) mask.style.marginBottom = "-6px";
          }),
        );

        gsap.set(texts, { autoAlpha: 1 });

        if (reduce) {
          if (badge) gsap.set(badge, { autoAlpha: 1 });
          splits.forEach((s) => s.revert());
          return;
        }

        if (badge) gsap.set(badge, { autoAlpha: 1 });
        const allWords = splits.flatMap((s) => s.words);

        tl = gsap.timeline({
          scrollTrigger: { trigger: header, start: "top 75%" },
        });

        if (badge) {
          tl.from(badge, {
            scale: 0,
            rotate: -35,
            autoAlpha: 0,
            transformOrigin: "center",
            duration: ENTRANCE.icon.duration,
            ease: ENTRANCE.icon.ease,
          });
        }

        tl.from(
          allWords,
          { yPercent: 100, duration: 0.9, stagger: 0.02, ease: "power3.out" },
          badge ? "-=0.4" : 0,
        );
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: headerRef },
  );

  useGSAP(
    () => {
      const grid = gridRef.current;
      if (!grid) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      const cells = gsap.utils.toArray<HTMLElement>(grid.children);

      const tween = gsap.from(cells, {
        y: 30,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: grid, start: "top 80%" },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: gridRef },
  );

  return (
    <section
      id="platforms"

      className="relative z-10 border-t border-foreground/20 bg-background text-foreground"
      style={{ overflowX: "clip" }}
      aria-label="Plataformas Bloxtek"
    >
      <NoiseBackground
        className="absolute inset-0 h-full w-full mix-blend-multiply"
        opacity={0.08}
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div ref={headerRef} className="mb-20">
          <div className="mb-16 flex items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <IconBadge icon={Check} size="sm" variant="brand" />
              <span data-reveal className="font-neue text-base text-foreground">
                {platformsIntro.label}
              </span>
            </div>

            <span
              data-reveal
              className="font-neue text-[11px] font-bold tracking-[0.18em] text-foreground/40 uppercase"
            >
              {platformsIntro.count}
            </span>
          </div>

          <h2
            data-reveal
            className="mx-auto max-w-3xl text-center font-neue-bold text-title leading-[1.02] tracking-tight text-balance"
          >
            <span className="font-baskerville text-[0.92em] italic">
              Plataformas
            </span>{" "}
            que ya operan, no prototipos
          </h2>

          <p
            data-reveal
            className="mx-auto mt-6 max-w-lg text-center font-neue text-base leading-relaxed text-foreground/55 text-pretty"
          >
            {platformsIntro.subtitle}
          </p>
        </div>

        <div
          ref={gridRef}
          onMouseLeave={() => setHovered(null)}
          style={{ "--cols": cols, "--rows": rows } as React.CSSProperties}
          className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-foreground/15 shadow-[0_10px_50px_rgba(0,0,0,0.10)] md:h-[57rem] md:grid-cols-[var(--cols)] md:grid-rows-[var(--rows)] md:transition-[grid-template-columns,grid-template-rows] md:duration-[500ms] md:ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
        >
          {platforms.map((platform, i) => (
            <Quadrant
              key={platform.name}
              {...platform}

              active={hovered === null ? null : hovered === i}
              onMouseEnter={() => setHovered(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
