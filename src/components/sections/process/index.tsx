"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { NoiseBackground } from "@/components/ui/noise-background";
import { processSteps, processIntro } from "./slides";
import { Step } from "./step";
import { ENTRANCE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export function Process() {
  const headerRef = useRef<HTMLDivElement>(null);

  // Entrada de la cabecera: pop del check + mask-reveal de label, título y body.
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
        gsap.set(texts, { autoAlpha: 1 });

        if (reduce) {
          if (badge) gsap.set(badge, { autoAlpha: 1 });
          splits.forEach((s) => s.revert());
          return;
        }

        if (badge) gsap.set(badge, { autoAlpha: 1 });
        const allWords = splits.flatMap((s) => s.words);

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: header,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
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

  return (
    <section
      id="process"
      // z-10 + fondo opaco: se desliza por ENCIMA del footer (sticky detrás) y lo
      // va descubriendo al llegar a su final. Opaco (bg + ruido propio) para que
      // el footer no se transparente mientras se lee Process.
      className="relative z-10 border-t border-foreground/20 bg-background text-foreground"
      style={{ overflowX: "clip" }}
      aria-label="Our process"
    >
      {/* Ruido local: restaura la textura que daba el ruido global (ahora tapado
          por el fondo opaco). */}
      <NoiseBackground
        className="absolute inset-0 h-full w-full mix-blend-multiply"
        opacity={0.08}
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* --- Cabecera --- */}
        <div ref={headerRef} className="mb-20">
          {/* etiqueta con check */}
          <div className="mb-16 flex items-center gap-3">
            <IconBadge
              icon={Check}
              size="sm"
              variant="brand"
              className="text-white"
            />
            <span data-reveal className="font-neue text-base text-foreground">
              {processIntro.label}
            </span>
          </div>

          {/* titular centrado */}
          <div className="mx-auto max-w-2xl text-center">
            <h2
              data-reveal
              className="mb-6 font-neue-bold text-title leading-[1.02] tracking-tight text-balance"
            >
              From idea to{" "}
              <span className="font-baskerville text-[0.92em] italic">
                impact
              </span>
            </h2>
            <p
              data-reveal
              className="font-neue text-body leading-snug text-foreground/70 text-center"
            >
              {processIntro.body}
            </p>
          </div>
        </div>

        {/* --- Lista de pasos --- */}
        <div className="flex flex-col">
          {processSteps.map((step, i) => (
            <Step
              key={step.id}
              {...step}
              // Alternado: der, izq, der.
              fromDir={i % 2 === 0 ? "right" : "left"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
