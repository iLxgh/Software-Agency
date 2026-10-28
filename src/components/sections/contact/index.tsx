"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { NoiseBackground } from "@/components/ui/noise-background";
import { ContactForm } from "./form";
import { StepCard } from "./step-card";
import { callSteps, contactIntro } from "./slides";
import { ENTRANCE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export function Contact() {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

        tl = gsap.timeline({
          scrollTrigger: { trigger: header, start: "top 80%" },
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

  useGSAP(
    () => {
      const grid = gridRef.current;
      if (!grid) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      const tween = gsap.from(gsap.utils.toArray<HTMLElement>(grid.children), {
        y: 30,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",

        clearProps: "transform",
        scrollTrigger: { trigger: grid, start: "top 85%" },
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
      id="contacto"
      className="relative z-10 bg-background text-foreground"
      aria-label="Agenda una llamada"
    >
      <NoiseBackground
        className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply"
        opacity={0.08}
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-foreground/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-center lg:justify-between lg:gap-20">
          <div ref={headerRef} className="max-w-xl lg:max-w-none lg:flex-1">
            <div className="mb-10 flex items-center gap-3">
              <IconBadge icon={Check} size="sm" variant="brand" />
              <span data-reveal className="font-neue text-base">
                {contactIntro.label}
              </span>
            </div>

            <h2
              data-reveal
              className="font-neue-bold text-title leading-[1.02] tracking-tight text-balance"
            >
              Empecemos por{" "}
              <span className="font-baskerville text-[0.92em] italic">
                entender tu operación.
              </span>
            </h2>

            <p
              data-reveal
              className="mt-6 max-w-lg font-neue text-body leading-relaxed text-pretty text-foreground/60"
            >
              Sin presentación comercial. Treinta minutos para entender tu
              problema y decirte si podemos resolverlo — y si no, quién puede.
            </p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {contactIntro.reassurances.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-foreground/10 bg-foreground/[0.03] px-3 py-1.5 text-sm text-foreground/70"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center lg:w-[48%] lg:shrink-0 lg:justify-end">
            <ContactForm />
          </div>
        </div>

        <div className="mt-24 lg:mt-32">
          <p className="text-[11px] font-bold tracking-[0.16em] text-foreground/40 uppercase">
            Qué pasa en la llamada
          </p>

          <div
            ref={gridRef}
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {callSteps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
