"use client";

import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Check, Quote } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { cx } from "@/components/ui/icon-glyph-styles";
import { ENTRANCE } from "@/lib/motion";
import { problemIntro, symptoms } from "./slides";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const COVER = 55;

const RAIL = 210;

const PANEL = 86;

const PANEL_TOP = (100 - PANEL) / 2;

const CONTAINER = "1400px";
const GUTTER = "2rem";

const RADIUS = "1.5rem";

const TILT = 1.6;

const SPAN = 1 + (symptoms.length - 1) * (1 - COVER / 100);

const CARD_WIDTH = `calc((min(${CONTAINER},100vw) - ${GUTTER} * 2 + ${RADIUS} * ${symptoms.length - 1}) / ${SPAN})`;

const FACE_WIDTH = `${100 - COVER}%`;

const TONES = [
  {
    surface: "bg-foreground text-background",
    spine: "bg-white/5",
    accent: "text-brand",
  },
  {
    surface: "bg-brand text-white",
    spine: "bg-black/10",
    accent: "text-foreground",
  },
  {
    surface: "bg-background text-foreground",
    spine: "bg-card",
    accent: "text-brand",
  },
  {
    surface: "bg-foreground text-background",
    spine: "bg-white/5",
    accent: "text-brand",
  },
] as const;

export function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef<HTMLOListElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const header = headerRef.current;
      const label = labelRef.current;
      const title = titleRef.current;
      const subtitle = subtitleRef.current;
      if (!header || !label || !title || !subtitle) return;

      const badge = header.querySelector<HTMLSpanElement>("span");

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set([label, title, badge, subtitle], { autoAlpha: 0 });

      let titleSplit: SplitText | null = null;
      let labelSplit: SplitText | null = null;
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        if (!titleRef.current) return;
        titleSplit = new SplitText(title, { type: "words", mask: "words" });
        labelSplit = new SplitText(label, { type: "words", mask: "words" });

        titleSplit.words.forEach((w) => {
          const unit = w as HTMLElement;
          unit.style.paddingBottom = "12px";
          const mask = unit.parentElement;
          if (mask) mask.style.marginBottom = "-12px";
        });

        gsap.set([label, title, badge, subtitle], { autoAlpha: 1 });
        if (reduce) {
          titleSplit.revert();
          labelSplit.revert();
          return;
        }

        tl = gsap.timeline({
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
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
            titleSplit.words,
            { yPercent: 100, duration: 0.9, stagger: 0.04, ease: "power3.out" },
            "-=0.6",
          )
          .from(
            subtitle,
            { autoAlpha: 0, y: 14, duration: 0.7, ease: "power3.out" },
            "-=0.5",
          );
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        titleSplit?.revert();
        labelSplit?.revert();
      };
    },
    { scope: sectionRef },
  );

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 1024px)",
        motion: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { desktop, motion } = context.conditions as Record<
          string,
          boolean
        >;
        if (!desktop || !motion) return;

        const cards = gsap.utils.toArray<HTMLElement>(
          stripRef.current?.children ?? [],
        );
        if (cards.length < 2) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: railRef.current,

            start: `top ${PANEL_TOP}%`,
            end: `bottom ${PANEL_TOP + PANEL}%`,
            scrub: true,
          },
        });

        cards.forEach((card, i) => {
          gsap.set(card, { rotate: i === 0 ? 0 : (i % 2 ? 1 : -1) * TILT });
        });

        const steps = cards.length - 1;

        for (let i = 1; i <= steps; i++) {
          const at = `step${i}`;
          tl.addLabel(at);
          tl.to(cards.slice(i), { xPercent: -COVER * i, ease: "none" }, at).to(
            cards[i],
            { rotate: 0, ease: "power2.out" },
            at,
          );
        }

        const marks = gsap.utils.toArray<HTMLElement>(
          progressRef.current?.children ?? [],
        );
        if (marks.length) {
          let lit = -1;
          const light = (next: number) => {
            if (next === lit) return;
            lit = next;
            marks.forEach((mark, i) => {
              mark.classList.toggle("opacity-100", i <= next);
              mark.classList.toggle("text-brand", i === next);
              mark.classList.toggle("opacity-25", i > next);
            });
          };
          light(0);

          ScrollTrigger.create({
            trigger: railRef.current,
            start: `top ${PANEL_TOP}%`,
            end: `bottom ${PANEL_TOP + PANEL}%`,
            onUpdate: (self) =>
              light(Math.min(steps, Math.round(self.progress * steps))),
          });
        }
      },
    );

    return () => mm.revert();
  }, {});

  return (
    <section
      ref={sectionRef}
      id="problema"

      className="relative text-foreground"
      style={{ overflowX: "clip" }}
      aria-label="El punto de partida"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-foreground/20" />
      </div>

      <div
        ref={railRef}

        style={
          {
            "--rail": `${RAIL}vh`,
            "--card": CARD_WIDTH,
            "--face": FACE_WIDTH,
            "--panel": `${PANEL}vh`,
            "--panel-top": `${PANEL_TOP}vh`,
          } as CSSProperties
        }
        className="lg:h-[var(--rail)]"
      >
        <div className="flex flex-col justify-center gap-12 py-16 lg:sticky lg:top-[var(--panel-top)] lg:h-[var(--panel)] lg:gap-10 lg:py-0">
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-8">
              <div ref={headerRef} className="flex items-center gap-3">
                <IconBadge icon={Check} size="sm" variant="brand" />
                <p ref={labelRef} className="font-neue text-lg tracking-wide">
                  {problemIntro.label}
                </p>
              </div>

              <ol
                ref={progressRef}
                aria-hidden
                className="hidden items-center gap-2 lg:flex"
              >
                {symptoms.map((symptom) => (
                  <li
                    key={symptom.index}
                    className="font-neue-bold text-xs tabular-nums opacity-25 transition-[opacity,color] duration-300 motion-reduce:transition-none"
                  >
                    {symptom.index}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-8 lg:mt-8">
              <h2
                ref={titleRef}

                className="max-w-4xl font-neue-bold text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl"
              >
                {problemIntro.titleLead}{" "}
                <span className="font-baskerville text-[0.92em] font-normal tracking-normal italic">
                  {problemIntro.titleAccent}
                </span>
              </h2>

              <p
                ref={subtitleRef}
                className="mt-5 max-w-md font-neue text-base leading-relaxed text-foreground/55 text-pretty"
              >
                {problemIntro.subtitle}
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div
              ref={stripRef}
              className="flex flex-col gap-4 lg:w-max lg:flex-row lg:gap-0"
            >
              {symptoms.map((symptom, index) => {
                const tone = TONES[index % TONES.length];
                return (
                  <article
                    key={symptom.index}

                    style={{ zIndex: index }}
                    className={cx(
                      "relative flex shrink-0 lg:h-[min(23rem,42vh)] lg:w-[var(--card)]",
                      "overflow-hidden rounded-3xl",

                      index > 0 && "lg:-ml-6",

                      "lg:shadow-[-18px_0_36px_rgba(0,0,0,0.16)]",
                      tone.surface,
                    )}
                  >
                    <div
                      className={cx(
                        "relative z-10 flex shrink-0 flex-col justify-between gap-6 border-r border-current/10 p-6 lg:w-[var(--face)] lg:p-8",
                        tone.spine,
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span
                          className={cx(
                            "font-neue-bold text-sm tabular-nums",
                            tone.accent,
                          )}
                        >
                          {symptom.index}
                        </span>

                        <Quote
                          aria-hidden
                          className={cx("size-6 shrink-0", tone.accent)}
                          fill="currentColor"
                          strokeWidth={0}
                        />
                      </div>

                      <div>
                        <span className="font-neue text-[10px] font-bold tracking-[0.18em] uppercase opacity-45">
                          {problemIntro.signalTag}
                        </span>

                        <p className="mt-3 font-neue-bold text-2xl leading-snug tracking-tight text-balance">
                          {symptom.signal}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 flex flex-1 flex-col justify-end p-6 lg:p-8">
                      <span className="font-neue text-[10px] font-bold tracking-[0.18em] uppercase opacity-45">
                        {problemIntro.causeTag}
                      </span>
                      <p className="mt-2 font-neue text-sm leading-relaxed text-pretty opacity-75">
                        {symptom.cause}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
