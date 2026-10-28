"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowUpRight, Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { NoiseBackground } from "@/components/ui/noise-background";
import { Ribbon } from "./ribbon";
import { distributorsIntro, ribbonItems } from "./slides";
import { ENTRANCE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type DistributorsProps = {
  variant?: "crossed" | "straight";
};

export function Distributors({ variant = "crossed" }: DistributorsProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const texts = gsap.utils.toArray<HTMLElement>(
        headerRef.current?.querySelectorAll("[data-reveal]") ?? [],
      );
      if (!texts.length) return;

      const badge =
        headerRef.current?.querySelector("svg")?.parentElement ?? null;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

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
            unit.style.paddingBottom = "8px";
            unit.style.paddingRight = "0.08em";
            const mask = unit.parentElement;
            if (mask) {
              mask.style.marginBottom = "-8px";
              mask.style.marginRight = "-0.08em";
            }
          }),
        );

        gsap.set(texts, { autoAlpha: 1 });
        if (badge) gsap.set(badge, { autoAlpha: 1 });
        if (reduce) {
          splits.forEach((s) => s.revert());
          return;
        }

        tl = gsap.timeline({
          scrollTrigger: { trigger: headerRef.current, start: "top 80%" },
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
          splits.flatMap((s) => s.words),
          { yPercent: 100, duration: 0.9, stagger: 0.03, ease: "power3.out" },
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

  const crossed = variant === "crossed";

  return (
    <section
      id="distribuidores"
      className="relative z-10 bg-background pb-16 text-foreground lg:pb-20"
      aria-label="Plan de distribuidores"
    >
      <NoiseBackground
        className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply"
        opacity={0.08}
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-foreground/20" />
      </div>

      <div
        ref={headerRef}
        className="relative z-10 mx-auto max-w-[1400px] px-4 pt-16 pb-6 text-center sm:px-6 lg:px-8 lg:pt-20"
      >
        <div className="mb-14 flex items-center gap-3 text-left">
          <IconBadge icon={Check} size="sm" variant="brand" />
          <span data-reveal className="font-neue text-base">
            {distributorsIntro.label}
          </span>
        </div>

        <h2
          data-reveal
          className="mx-auto max-w-3xl font-neue-bold text-title leading-[1.02] tracking-tight text-balance"
        >
          ¿Quieres llevar Bloxtek{" "}
          <span className="font-baskerville text-[0.92em] italic">
            a tu mercado?
          </span>
        </h2>

        <p
          data-reveal
          className="mx-auto mt-6 max-w-xl font-neue text-body leading-relaxed text-pretty text-foreground/60"
        >
          {distributorsIntro.subtitle}
        </p>

        <a
          href={distributorsIntro.ctaHref}
          data-sound
          className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-foreground py-2 pr-2 pl-6 text-background transition-transform duration-300 hover:scale-[1.03]"
        >
          <span className="font-neue text-small">
            {distributorsIntro.ctaLabel}
          </span>
          <IconBadge icon={ArrowUpRight} size="md" />
        </a>
      </div>

      {crossed ? (
        <div className="relative isolate h-[200px] overflow-hidden sm:h-[215px]">
          <div className="absolute inset-x-[-8%] top-1/2 -mt-7 -translate-y-1/2 -rotate-3">
            <Ribbon
              items={ribbonItems}
              href={distributorsIntro.ctaHref}
              className="bg-foreground text-background"
            />
          </div>
          <div className="absolute inset-x-[-8%] top-1/2 mt-7 -translate-y-1/2 rotate-3">
            <Ribbon
              items={ribbonItems}
              href={distributorsIntro.ctaHref}
              reverse
              className="bg-brand text-white"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <Ribbon
            items={ribbonItems}
            href={distributorsIntro.ctaHref}
            className="bg-foreground text-background"
          />
          <Ribbon
            items={ribbonItems}
            href={distributorsIntro.ctaHref}
            reverse
            className="bg-brand text-white"
          />
        </div>
      )}
    </section>
  );
}
