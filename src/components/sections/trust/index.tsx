"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { NoiseBackground } from "@/components/ui/noise-background";
import { ENTRANCE } from "@/lib/motion";
import { TrustCard } from "./card";
import { trustCards, trustIntro } from "./slides";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * Escalera de sticky: la tarjeta N se pega a `BASE + N * STEP` del borde
 * superior, así que cada una deja asomando una franja de la anterior en lugar
 * de taparla del todo.
 *
 * En vh y no en px para que la escalera y el alto de las tarjetas escalen
 * juntos: BASE + 3*STEP + alto de tarjeta tiene que caber en la pantalla, o la
 * última quedaría cortada por abajo.
 */
const STICK_BASE_VH = 4;
const STICK_STEP_VH = 5;

export function Trust() {
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const texts = gsap.utils.toArray<HTMLElement>(
        headerRef.current?.querySelectorAll("[data-reveal]") ?? [],
      );
      if (!texts.length) return;

      const badge =
        headerRef.current?.querySelector<HTMLSpanElement>(
          "[data-badge] span",
        ) ?? null;
      const marks = gsap.utils.toArray<HTMLElement>(
        headerRef.current?.querySelectorAll("[data-mark]") ?? [],
      );

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set([...texts, ...(badge ? [badge] : []), ...marks], {
        autoAlpha: 0,
      });

      let splits: SplitText[] = [];
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        splits = texts.map(
          (el) => new SplitText(el, { type: "words", mask: "words" }),
        );

        // Aire para las descendentes, que el mask recorta.
        splits.forEach((s) =>
          s.words.forEach((w) => {
            const unit = w as HTMLElement;
            unit.style.paddingBottom = "8px";
            const mask = unit.parentElement;
            if (mask) mask.style.marginBottom = "-8px";
          }),
        );

        gsap.set([...texts, ...(badge ? [badge] : []), ...marks], {
          autoAlpha: 1,
        });
        if (reduce) return;

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
          { yPercent: 100, duration: 0.9, stagger: 0.04, ease: "power3.out" },
          badge ? "-=0.4" : 0,
        )
          // El índice cierra: aparece cuando el titular ya se lee.
          .from(
            marks,
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
        splits.forEach((s) => s.revert());
      };
    },
    { scope: headerRef },
  );

  return (
    // Sin overflow-hidden en toda la cadena de ancestros: cortaría los sticky.
    // z-10 + fondo opaco: es la última sección, así que se desliza por ENCIMA
    // del footer (que queda sticky detrás) y lo va descubriendo al final.
    <section
      id="trust"
      className="relative z-10 bg-background text-foreground"
      aria-label="Generamos confianza antes de vender"
    >
      {/* Ruido local: restaura la textura que daba el ruido global, ahora
          tapado por el fondo opaco. */}
      <NoiseBackground
        className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply"
        opacity={0.08}
      />

      {/* divisor: respeta el ancho del contenedor */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-foreground/20" />
      </div>

      <div
        ref={headerRef}
        className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      >
        {/* Fila fina: la palomita a la izquierda —convención de toda la web— y
            el índice de los cuatro compromisos a la derecha.

            El índice no es adorno: las tarjetas llegan en una escalera sticky
            donde solo se ve una a la vez, así que sin esto no hay forma de
            saber cuántas son ni qué viene. Y sale de los propios `eyebrow` de
            las tarjetas, así que no hay copy nuevo que validar. */}
        <div className="mb-14 flex flex-wrap items-center justify-between gap-x-10 gap-y-5 lg:mb-20">
          <div data-badge className="flex items-center gap-3">
            <IconBadge icon={Check} size="sm" variant="brand" />
            <p data-reveal className="font-neue text-lg tracking-wide">
              {trustIntro.label}
            </p>
          </div>

          <ul
            aria-hidden
            className="flex flex-wrap items-baseline gap-x-6 gap-y-2"
          >
            {trustCards.map((card) => (
              <li
                key={card.index}
                data-mark
                className="flex items-baseline gap-1.5"
              >
                <span className="font-neue-bold text-[11px] text-brand tabular-nums">
                  {card.index}
                </span>
                <span className="font-neue text-sm tracking-wide text-foreground/60">
                  {card.eyebrow}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <h2
          data-reveal
          className="mx-auto max-w-4xl text-center font-neue-bold text-title leading-[1.02] tracking-tight text-balance"
        >
          <span className="font-baskerville text-[0.92em] italic">
            Generamos confianza
          </span>{" "}
          antes de vender.
        </h2>
        {/* PENDIENTE — bajada redactada por mí. */}
        <p
          data-reveal
          className="mx-auto mt-6 max-w-xl text-center font-neue text-body leading-relaxed text-pretty text-foreground/60"
        >
          Cuatro compromisos, no cuatro promesas.
        </p>
      </div>

      {/* La pila. Cada tarjeta va en su propio wrapper sticky; el wrapper ocupa
          sitio en el flujo normal, y eso es lo que da el scroll necesario para
          que la siguiente suba por encima. */}
      <div className="pb-[20vh]">
        {trustCards.map((card, i) => (
          <div
            key={card.index}
            className="mx-auto w-[90vw] max-w-[1400px]"
            style={{
              position: "sticky",
              top: `${STICK_BASE_VH + i * STICK_STEP_VH}vh`,
            }}
          >
            <TrustCard {...card} />
          </div>
        ))}
      </div>
    </section>
  );
}
