"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cx } from "./icon-glyph-styles";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export type Slide = {
  /** Palabra o cifra destacada. */
  title: string;
  caption: string;
};

type StatSliderProps = {
  slides: Slide[];
  /** Escala del bloque. "lg" agranda barra, número, caption y flechas. */
  size?: "md" | "lg";
  /** Segundos que tarda la barra en llenarse antes de auto-avanzar. */
  seconds?: number;
  className?: string;
};

const SIZES = {
  md: {
    bar: "h-[3px] mb-5",
    button: "size-8",
    icon: "size-5",
    counter: "text-sm",
    gap: "gap-10",
    title: "text-4xl sm:text-5xl",
    // min-h reserva 3 renglones: los captions no miden lo mismo y sin esto el
    // bloque cambia de alto en cada slide.
    caption: "mt-3 min-h-[3.9rem] max-w-[260px] text-sm",
  },
  lg: {
    bar: "h-[5px] mb-5",
    button: "size-10",
    icon: "size-6",
    counter: "text-base",
    gap: "gap-6",
    title: "text-5xl sm:text-6xl",
    caption: "mt-4 min-h-[4.9rem] max-w-sm text-base",
  },
} as const;

/**
 * Slider de cifras: barra de progreso que se autollena y avanza sola, flechas
 * de control y transición del texto con máscara (sale hacia arriba, entra desde
 * abajo). El autoplay arranca cuando el bloque entra en viewport y se pausa al
 * salir, para no gastar frames fuera de pantalla.
 */
export function StatSlider({
  slides,
  size = "md",
  seconds = 5,
  className,
}: StatSliderProps) {
  const s = SIZES[size];
  const total = slides.length;
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const statRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLParagraphElement>(null);
  const capRef = useRef<HTMLParagraphElement>(null);
  const barTween = useRef<gsap.core.Tween | null>(null);
  const busy = useRef(false);
  const firstRender = useRef(true);
  const started = useRef(false);
  const reduced = useRef(false);

  // Divide el número y el caption en palabras con máscara (para el reveal).
  const splitStat = () => {
    const s1 = new SplitText(numRef.current!, { type: "words", mask: "words" });
    const s2 = new SplitText(capRef.current!, { type: "words", mask: "words" });
    return {
      splits: [s1, s2],
      words: [...s1.words, ...s2.words] as HTMLElement[],
    };
  };

  // Avanza de slide: el texto actual sale hacia ARRIBA (entrada invertida).
  const advance = (dir: number) => {
    if (busy.current) return;
    if (reduced.current) {
      setCurrent((c) => (c + dir + total) % total);
      return;
    }
    busy.current = true;
    barTween.current?.kill();
    gsap.set(barRef.current, { scaleX: 0 });

    const { splits, words } = splitStat();
    gsap.to(words, {
      yPercent: -55,
      autoAlpha: 0,
      duration: 0.26,
      stagger: 0.012,
      ease: "power2.in",
      onComplete: () => {
        // Oculta el contenedor ANTES de restaurar el DOM, para que el texto
        // viejo no reaparezca en su posición normal por 1 frame.
        gsap.set(statRef.current, { autoAlpha: 0 });
        splits.forEach((sp) => sp.revert());
        setCurrent((c) => (c + dir + total) % total);
      },
    });
  };

  // Llena la barra; al completar, auto-avanza al siguiente.
  const startBar = () => {
    if (reduced.current) return;
    barTween.current?.kill();
    gsap.set(barRef.current, { scaleX: 0 });
    barTween.current = gsap.to(barRef.current, {
      scaleX: 1,
      duration: seconds,
      ease: "none",
      onComplete: () => advance(1),
    });
  };

  // Entra el nuevo texto desde ABAJO (entrada normal) y arranca la barra.
  const enter = () => {
    if (reduced.current) {
      busy.current = false;
      return;
    }
    const { splits, words } = splitStat();
    // Posiciona las palabras abajo y recién ahí revela el contenedor: nunca se
    // ve el texto nuevo en su posición normal.
    gsap.set(words, { yPercent: 100 });
    gsap.set(statRef.current, { autoAlpha: 1 });
    gsap.to(words, {
      yPercent: 0,
      duration: 0.42,
      stagger: 0.02,
      ease: "power3.out",
      onComplete: () => {
        splits.forEach((sp) => sp.revert());
        busy.current = false;
      },
    });
    startBar();
  };

  // Autoplay: arranca al entrar en viewport; pausa al salir.
  useGSAP(
    () => {
      reduced.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      gsap.set(barRef.current, { scaleX: 0, transformOrigin: "left center" });

      const st = ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top 85%",
        onEnter: () => {
          if (!started.current) {
            started.current = true;
            startBar();
          }
        },
        onLeave: () => barTween.current?.pause(),
        onEnterBack: () => barTween.current?.resume(),
        onLeaveBack: () => barTween.current?.pause(),
      });

      return () => {
        st.kill();
        barTween.current?.kill();
      };
    },
    { scope: rootRef },
  );

  // Al cambiar de slide, el nuevo texto entra desde abajo (salta el 1er render).
  useGSAP(
    () => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      enter();
    },
    { dependencies: [current], scope: rootRef },
  );

  return (
    <div ref={rootRef} className={cx("flex flex-col", s.gap, className)}>
      <div>
        {/* barra de progreso (se llena y auto-avanza) */}
        <div
          className={cx(
            "relative w-full overflow-hidden rounded-full bg-foreground/15",
            s.bar,
          )}
        >
          <div
            ref={barRef}
            className="h-full w-full origin-left rounded-full bg-foreground"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => advance(-1)}
              aria-label="Slide anterior"
              className={cx(
                "flex cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-60",
                s.button,
              )}
            >
              <ArrowLeft className={s.icon} />
            </button>
            <button
              type="button"
              onClick={() => advance(1)}
              aria-label="Slide siguiente"
              className={cx(
                "flex cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-60",
                s.button,
              )}
            >
              <ArrowRight className={s.icon} />
            </button>
          </div>
          <span className={cx("tabular-nums text-foreground/50", s.counter)}>
            {String(current + 1).padStart(2, "0")}/
            {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div ref={statRef}>
        <p
          ref={numRef}
          className={cx("font-neue-bold tracking-tight", s.title)}
        >
          {slide.title}
        </p>
        <p
          ref={capRef}
          className={cx("leading-relaxed text-foreground/50", s.caption)}
        >
          {slide.caption}
        </p>
      </div>
    </div>
  );
}
