"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { AlertTriangle, CircleDot, Sparkles } from "lucide-react";
import { cx } from "@/components/ui/icon-glyph-styles";
import type { Sector } from "./slides";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const EASE_OUT = "ease-[cubic-bezier(0.16,1,0.3,1)]";

const PARTS = [
  { key: "problema", label: "El problema", icon: CircleDot },
  { key: "riesgo", label: "El riesgo no visible", icon: AlertTriangle },
  { key: "solucion", label: "Lo que hacemos", icon: Sparkles },
] as const;

type SectorBlockProps = Sector & {
  index: number;

  fromDir: "left" | "right";

  first?: boolean;
};

export function SectorBlock({
  id,
  name,
  problema,
  riesgo,
  solucion,
  plataforma,
  index,
  fromDir,
  first = false,
}: SectorBlockProps) {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const values = { problema, riesgo, solucion };

  useGSAP(
    () => {
      const root = rootRef.current;
      const heading = titleRef.current;
      if (!root || !heading) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const parts = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-part]"),
      );

      gsap.set([root, heading], { autoAlpha: 0 });

      let split: SplitText | null = null;
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        if (!titleRef.current) return;
        split = new SplitText(heading, { type: "words", mask: "words" });

        split.words.forEach((w) => {
          const unit = w as HTMLElement;
          unit.style.paddingBottom = "8px";
          const mask = unit.parentElement;
          if (mask) mask.style.marginBottom = "-8px";
        });

        gsap.set([root, heading], { autoAlpha: 1 });

        if (reduce) {
          split.revert();
          return;
        }

        tl = gsap.timeline({
          scrollTrigger: { trigger: root, start: "top 75%" },
        });

        tl.from(root, {
          xPercent: fromDir === "left" ? -6 : 6,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
        })
          .from(
            split.words,
            { yPercent: 100, duration: 0.8, stagger: 0.05, ease: "power3.out" },
            "-=0.6",
          )
          .from(
            parts,
            {
              y: 24,
              autoAlpha: 0,
              duration: 0.7,
              stagger: 0.12,
              ease: "power3.out",
              clearProps: "transform",
            },
            "-=0.5",
          );
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        split?.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    <article
      ref={rootRef}
      id={id}

      className={cx(
        "scroll-mt-32 py-16 lg:py-20",

        !first && "border-t border-foreground/15",
      )}
    >
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-20">
        <div className="lg:w-[30%] lg:shrink-0">
          <div className="lg:sticky lg:top-32">
            <span className="text-[11px] font-bold tracking-[0.16em] text-foreground/40 tabular-nums uppercase">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2
              ref={titleRef}
              className="mt-3 font-neue-bold text-4xl leading-[1.02] tracking-tight text-balance sm:text-5xl"
            >
              {name}
            </h2>

            {plataforma && (
              <p className="mt-6 inline-flex items-center gap-2 rounded-lg border border-foreground/10 bg-foreground/[0.03] px-3 py-1.5 text-sm text-foreground/70">
                <span className="size-1.5 rounded-full bg-brand" />
                Lo resuelve {plataforma}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {PARTS.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              data-part
              className={cx(
                "group relative overflow-hidden rounded-2xl p-6 sm:p-8",

                key === "riesgo" ? "bg-card" : "bg-background",
                "shadow-[0_2px_16px_rgba(0,0,0,0.06)]",

                "transition-[translate,box-shadow] duration-500",
                EASE_OUT,
                "hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)]",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              )}
            >
              <span
                aria-hidden
                className={cx(
                  "absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-brand",
                  "transition-transform duration-500",
                  EASE_OUT,
                  "group-hover:scale-y-100",
                )}
              />

              <div className="flex gap-4">
                <Icon
                  aria-hidden
                  className={cx(
                    "mt-0.5 size-5 shrink-0 transition-colors duration-500",
                    key === "riesgo"
                      ? "text-brand"
                      : "text-foreground/30 group-hover:text-brand",
                  )}
                  strokeWidth={2.2}
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold tracking-[0.14em] text-foreground/40 uppercase">
                    {label}
                  </p>
                  <p
                    className={cx(
                      "mt-2 font-neue text-base leading-relaxed text-pretty transition-colors duration-500 sm:text-lg",
                      key === "riesgo"
                        ? "text-foreground"
                        : "text-foreground/70 group-hover:text-foreground",
                    )}
                  >
                    {values[key]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
