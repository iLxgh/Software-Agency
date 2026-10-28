"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { TransitionLink } from "@/components/ui/transition-link";
import { ArrowUpRight, Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { NoiseBackground } from "@/components/ui/noise-background";
import { cx } from "@/components/ui/icon-glyph-styles";
import { Ribbon } from "@/components/sections/distributors/ribbon";
import { SectorBlock } from "./sector-block";
import { UseCases } from "./use-cases";
import { sectors, sectorsIntro } from "./slides";
import { scrollToTarget } from "@/lib/scroll-to";
import { usePageTransition } from "@/components/providers/page-transition";
import { ENTRANCE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const RAIL_MASK =
  "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)";

export function Sectors() {
  const headerRef = useRef<HTMLDivElement>(null);

  const { covering } = usePageTransition();

  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;

      const texts = gsap.utils.toArray<HTMLElement>(
        header.querySelectorAll("[data-reveal]"),
      );
      const badge = header.querySelector("svg")?.parentElement ?? null;

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

        tl = gsap.timeline({ delay: ENTRANCE.tagline });

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
          { yPercent: 100, duration: 1, stagger: 0.04, ease: "power3.out" },
          badge ? "-=0.4" : 0,
        );
      };

      if (covering) return;

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tl?.kill();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: headerRef, dependencies: [covering] },
  );

  return (
    <main className="relative text-foreground">
      <NoiseBackground
        className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply"
        opacity={0.08}
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          className="relative pt-[140px] pb-16 lg:pt-[180px]"
        >
          {(["left", "right"] as const).map((side) => (
            <div
              key={side}
              aria-hidden
              className={cx(
                "pointer-events-none absolute inset-y-20 hidden w-12 overflow-hidden text-foreground/15 lg:block",
                side === "left" ? "-left-4 lg:-left-8" : "-right-4 lg:-right-8",
              )}

              style={{
                maskImage: RAIL_MASK,
                maskRepeat: "no-repeat",
                maskSize: "100% 100%",
                WebkitMaskImage: RAIL_MASK,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskSize: "100% 100%",
              }}
            >
              <div
                className={cx(
                  "absolute top-1/2 left-1/2 w-[160vh] -translate-x-1/2 -translate-y-1/2",
                  side === "left" ? "rotate-90" : "-rotate-90",
                )}
              >
                <Ribbon
                  items={sectors.map((x) => x.name)}
                  href="#"
                  reverse={side === "right"}
                />
              </div>
            </div>
          ))}

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-12 flex items-center justify-center gap-3">
              <IconBadge icon={Check} size="sm" variant="brand" />
              <span data-reveal className="font-neue text-base">
                {sectorsIntro.label}
              </span>
            </div>

            <h1
              data-reveal
              className="font-neue-bold text-title leading-[1.02] tracking-tight text-balance"
            >
              No aplicamos la misma{" "}
              <span className="font-baskerville text-[0.92em] italic">
                receta a todos.
              </span>
            </h1>

            <p
              data-reveal
              className="mx-auto mt-8 max-w-2xl font-neue text-body leading-relaxed text-pretty text-foreground/60"
            >
              {sectorsIntro.body}
            </p>

            <nav
              aria-label="Sectores"
              className="mt-10 flex flex-wrap justify-center gap-2"
            >
              {sectors.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToTarget(`#${s.id}`);
                  }}
                  className="rounded-lg border border-foreground/10 bg-foreground/[0.03] px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:border-foreground/25 hover:text-foreground"
                >
                  {s.name}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-foreground/15" />
        <div className="flex items-center gap-3 pt-16 pb-10">
          <IconBadge icon={Check} size="sm" variant="brand" />
          <span className="font-neue text-base">
            El diagnóstico de cada industria
          </span>
        </div>

        {sectors.map((sector, i) => (
          <SectorBlock
            key={sector.id}
            {...sector}
            index={i}
            first={i === 0}
            fromDir={i % 2 === 0 ? "left" : "right"}
          />
        ))}

        <UseCases />

        <div className="border-t border-foreground/15 py-20 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-neue-bold text-title leading-[1.02] tracking-tight text-balance">
              ¿No ves tu sector?
            </h2>
            <p className="mt-6 font-neue text-body leading-relaxed text-pretty text-foreground/60">
              También trabajamos con {sectorsIntro.masSectores.join(", ")}. Si
              tu operación tiene documentos, firmas o credenciales de por medio,
              hay conversación que tener.
            </p>

            <TransitionLink
              href="/#contacto"
              className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-foreground py-2 pr-2 pl-6 text-background transition-transform duration-300 hover:scale-[1.03]"
            >
              <span className="font-neue text-small">Cuéntanos tu caso</span>
              <IconBadge icon={ArrowUpRight} size="md" />
            </TransitionLink>
          </div>
        </div>
      </div>
    </main>
  );
}
