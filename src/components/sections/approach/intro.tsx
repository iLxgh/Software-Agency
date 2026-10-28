"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowUpRight, Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { scrollToSection } from "@/lib/scroll-to";
import { useMagnetic } from "@/lib/use-magnetic";
import { useArrowHover } from "@/lib/use-arrow-hover";
import { useCoverBlur } from "@/lib/use-cover-blur";
import { approachCards } from "./slides";
import { ENTRANCE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export function ApproachIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const indexRef = useRef<HTMLUListElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useMagnetic(ctaRef);
  useArrowHover(ctaRef, { direction: "up-right" });

  useGSAP(
    () => {
      const headline = headlineRef.current;
      const lead = leadRef.current;
      const cta = ctaRef.current;
      const label = labelRef.current;
      const header = headerRef.current;
      if (!headline || !label || !header) return;
      const badge = header.querySelector<HTMLSpanElement>("span");
      const indexItems = gsap.utils.toArray<HTMLLIElement>(
        indexRef.current?.children ?? [],
      );

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set([headline, label, badge, lead, cta, ...indexItems], {
        autoAlpha: 0,
      });

      let split: SplitText | null = null;
      let labelSplit: SplitText | null = null;
      let tl: gsap.core.Timeline | null = null;
      const run = () => {
        if (!headlineRef.current) return;
        split = new SplitText(headline, { type: "words", mask: "words" });
        labelSplit = new SplitText(label, { type: "words", mask: "words" });

        split.words.forEach((w) => {
          const unit = w as HTMLElement;
          unit.style.paddingBottom = "14px";
          const mask = unit.parentElement;
          if (mask) mask.style.marginBottom = "-14px";
        });

        gsap.set([headline, label, badge, lead, cta, ...indexItems], {
          autoAlpha: 1,
        });
        if (reduce) {
          split.revert();
          labelSplit.revert();
          return;
        }

        tl = gsap.timeline({
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        });

        tl.from(badge, {
          scale: 0,
          rotate: -35,
          autoAlpha: 0,
          transformOrigin: "center",
          duration: ENTRANCE.icon.duration,
          ease: ENTRANCE.icon.ease,
        })
          .from(
            labelSplit.words,
            { yPercent: 100, duration: 0.9, stagger: 0.05, ease: "power3.out" },
            "-=0.4",
          )
          .from(
            split.words,
            { yPercent: 100, duration: 0.9, stagger: 0.05, ease: "power3.out" },
            "-=0.6",
          )

          .from(
            [lead, cta],
            {
              autoAlpha: 0,
              y: 16,
              duration: 0.7,
              stagger: 0.1,
              ease: "power3.out",
            },
            "-=0.45",
          )

          .from(
            indexItems,
            {
              autoAlpha: 0,
              y: 12,
              duration: 0.6,
              stagger: 0.07,
              ease: "power3.out",
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
        labelSplit?.revert();
      };
    },
    { scope: sectionRef },
  );

  useCoverBlur(sectionRef, { start: "top 105%", ease: "power1.in" });

  return (
    <section
      ref={sectionRef}

      className="sticky top-[-30px] z-0 text-foreground"
      style={{ overflowX: "clip" }}
      aria-label="Cuatro formas de trabajar contigo"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-foreground/20" />
      </div>

      <div className="mx-auto flex max-w-[1400px] min-h-[500px] flex-col justify-center gap-14 px-4 py-16 sm:px-6 lg:gap-20 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
          <div ref={headerRef} className="flex items-center gap-3">
            <IconBadge icon={Check} size="sm" variant="brand" />
            <p ref={labelRef} className="font-neue text-lg tracking-wide">
              Cómo trabajamos en cada proyecto.
            </p>
          </div>

          <ul
            ref={indexRef}
            className="flex flex-wrap items-baseline gap-x-6 gap-y-2"
          >
            {approachCards.map((card, i) => (
              <li key={card.area} className="flex items-baseline gap-1.5">
                <span className="font-neue-bold text-[11px] text-brand tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-neue text-sm tracking-wide text-foreground/60">
                  {card.area}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-center">
          <div className="mx-auto max-w-5xl text-center">
            <h2
              ref={headlineRef}
              className="font-neue-bold text-4xl leading-[1.02] tracking-tight text-balance sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Cuatro formas de trabajar contigo. Una sola forma de pensar:{" "}
              <span className="font-baskerville text-[0.92em] font-normal tracking-normal italic">
                primero entender, después construir.
              </span>
            </h2>

            <p
              ref={leadRef}
              className="mx-auto mt-8 max-w-xl font-neue text-base leading-relaxed text-foreground/60 text-pretty sm:text-lg"
            >
              Cada proyecto empieza con un diagnóstico de tu operación. De ahí
              sale por cuál de estas cuatro formas conviene entrar.
            </p>

            <a
              ref={ctaRef}
              href="#contacto"
              data-sound
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#contacto");
              }}

              className="group relative mt-10 inline-flex items-center gap-3 rounded-2xl border border-transparent bg-foreground py-2 pr-2 pl-6 text-background transition-colors duration-300 before:absolute before:inset-x-0 before:-inset-y-5 before:content-[''] hover:border-foreground/15 hover:bg-background hover:text-foreground motion-reduce:transition-none"
            >
              <span className="font-neue text-small">Cuéntanos tu caso</span>

              <IconBadge
                icon={ArrowUpRight}
                size="md"
                className="transition-colors duration-300 group-hover:text-foreground"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
