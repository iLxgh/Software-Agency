"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { aboutStats, founder, mainPhrase } from "./slides";
import Image from "next/image";
import { images } from "@/lib/assets";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Gama de 3 tonos para el barrido de color (gris → gris medio → negro). */
const PAINT = { light: "#c2c2c2", mid: "#6b6b6b", dark: "#171717" };

/** Segundos que tarda la barra en llenarse antes de auto-avanzar. */
const SLIDE_SECONDS = 5;

export function About() {
  const total = aboutStats.length;
  const [current, setCurrent] = useState(0);
  const stat = aboutStats[current];

  const sectionRef = useRef<HTMLElement>(null);
  const phraseRef = useRef<HTMLDivElement>(null);

  // --- Slider izquierdo: barra de progreso + transición de texto ---
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
        splits.forEach((s) => s.revert());
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
      duration: SLIDE_SECONDS,
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
    // Posiciona las palabras abajo (immediateRender) y recién ahí revela el
    // contenedor: nunca se ve el texto nuevo en su posición normal.
    gsap.set(words, { yPercent: 100 });
    gsap.set(statRef.current, { autoAlpha: 1 });
    gsap.to(words, {
      yPercent: 0,
      duration: 0.42,
      stagger: 0.02,
      ease: "power3.out",
      onComplete: () => {
        splits.forEach((s) => s.revert());
        busy.current = false;
      },
    });
    startBar();
  };

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      let splits: SplitText[] = [];
      let tl: gsap.core.Timeline | null = null;

      const setup = () => {
        const container = phraseRef.current;
        if (!container) return;

        const blocks = gsap.utils.toArray<HTMLElement>(
          ".about-block",
          container,
        );
        // "words,chars": envuelve las letras en palabras para que ninguna
        // palabra se parta al final del renglón; animamos las letras igual.
        splits = blocks.map((b) => new SplitText(b, { type: "words,chars" }));
        const chars = splits.flatMap((s) => s.chars) as HTMLElement[];
        if (!chars.length) return;

        if (reduce) {
          gsap.set(chars, { color: PAINT.dark });
          return;
        }

        // Posición de cada letra relativa al contenedor.
        const cRect = container.getBoundingClientRect();
        const W = cRect.width || 1;
        const H = cRect.height || 1;
        const infos = chars.map((ch) => {
          const r = ch.getBoundingClientRect();
          return {
            ch,
            x: r.left - cRect.left,
            y: r.top - cRect.top,
            w: r.width,
          };
        });
        const avgCharW =
          infos.reduce((s, i) => s + i.w, 0) / (infos.length || 1) || 10;

        // Índice de línea por su Y (agrupando ~6px).
        const rowKey = (y: number) => Math.round(y / 6) * 6;
        const rows = Array.from(new Set(infos.map((i) => rowKey(i.y)))).sort(
          (a, b) => a - b,
        );

        // Métrica diagonal (arriba-izq -> abajo-der) + jitter intercalado por línea.
        const metrics = infos.map((i) => {
          const line = rows.indexOf(rowKey(i.y));
          const jitterChars = line % 2 === 0 ? -1 : 3; // intercala 1 / 3 letras
          const jitter = (jitterChars * avgCharW) / W;
          return i.x / W + i.y / H + jitter;
        });
        const min = Math.min(...metrics);
        const span = Math.max(...metrics) - min || 1;

        gsap.set(chars, { color: PAINT.light });

        const CHAR_WINDOW = 0.12; // ventana de transición por letra
        const START_SPAN = 0.82; // hasta dónde se reparten los arranques

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: true,
          },
        });

        infos.forEach((info, idx) => {
          const norm = (metrics[idx] - min) / span; // 0..1 en diagonal
          tl!.to(
            info.ch,
            {
              keyframes: { color: [PAINT.light, PAINT.mid, PAINT.dark] },
              ease: "none",
              duration: CHAR_WINDOW,
            },
            norm * START_SPAN,
          );
        });

        // Buffer: quedan en negro un poco antes del final del scroll.
        tl.to({}, { duration: 0.12 });

        ScrollTrigger.refresh();
      };

      // Espera a las fuentes para medir bien las posiciones de cada letra.
      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(setup);

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: sectionRef },
  );

  // Autoplay: arranca la barra cuando la sección entra en viewport; pausa al salir.
  useGSAP(
    () => {
      reduced.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      gsap.set(barRef.current, { scaleX: 0, transformOrigin: "left center" });

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
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

      return () => st.kill();
    },
    { scope: sectionRef },
  );

  // Al cambiar de slide, el nuevo texto entra desde abajo (se salta el 1er render).
  useGSAP(
    () => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      enter();
    },
    { dependencies: [current], scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative text-foreground"
      aria-label="About BLOXTEK"
    >
      {/* divisor: respeta el ancho del contenedor */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-foreground/20" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[320px_1fr] lg:px-8 lg:py-14">
        {/* ---- PANEL IZQUIERDO: slider (rota) ---- */}
        <div className="flex flex-col gap-10 border-b border-foreground/15 pb-10 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-23">
          <div>
            {/* barra de progreso (se llena y auto-avanza) */}
            <div className="relative mb-5 h-[3px] w-full overflow-hidden rounded-full bg-foreground/15">
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
                  aria-label="Previous slide"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-60"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => advance(1)}
                  aria-label="Next slide"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-60"
                >
                  <ArrowRight className="size-5" />
                </button>
              </div>
              <span className="text-sm tabular-nums text-foreground/50">
                {String(current + 1).padStart(2, "0")}/
                {String(total).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div ref={statRef}>
            <p
              ref={numRef}
              className="font-neue-bold text-6xl tracking-tight sm:text-7xl"
            >
              {stat.stat}
            </p>
            <p
              ref={capRef}
              className="mt-3 max-w-[220px] text-sm leading-relaxed text-foreground/50"
            >
              {stat.caption}
            </p>
          </div>
        </div>

        {/* ---- PANEL DERECHO: frase + autor (ESTÁTICO) ---- */}
        <div className="flex flex-col justify-between gap-10 pt-10 lg:pl-14 lg:pt-0">
          <div ref={phraseRef} className="space-y-8">
            {mainPhrase.map((block, i) => (
              <p
                key={i}
                className="about-block font-neue text-3xl font-medium leading-[1.15] text-balance sm:text-4xl lg:text-5xl xl:text-[3.25rem]"
              >
                {block}
              </p>
            ))}
          </div>

          {/* autor */}
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground/10 text-sm font-semibold text-foreground/60">
              <Image
                src={`${images.founder}/profile-v2.jpg`}
                alt="Founder"
                width={56}
                height={56}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {founder.name}
              </p>
              <p className="text-sm text-foreground/50">{founder.title}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
