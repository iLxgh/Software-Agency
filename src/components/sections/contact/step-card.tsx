"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import type { CallStep } from "./slides";

gsap.registerPlugin(useGSAP);

/**
 * Card de "qué pasa en la llamada". Reusa el gesto de las cards de
 * Organizations: en hover aparece un recuadro morado desde abajo-derecha
 * mientras la card entera hace un mini scale.
 */
export function StepCard({ number, title, body }: CallStep) {
  const rootRef = useRef<HTMLElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const accent = accentRef.current;
      if (!accent) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Estado de reposo: colapsado y desplazado a su esquina.
      gsap.set(accent, {
        autoAlpha: 0,
        scale: 0.6,
        xPercent: 12,
        yPercent: 24,
        transformOrigin: "right bottom",
      });

      tlRef.current = gsap
        .timeline({ paused: true })
        .to(
          accent,
          {
            autoAlpha: 1,
            scale: 1,
            xPercent: 0,
            yPercent: 0,
            duration: reduce ? 0 : 0.5,
            ease: "back.out(1.6)",
          },
          0,
        )
        .to(
          rootRef.current,
          { scale: 1.03, duration: reduce ? 0 : 0.4, ease: "power2.out" },
          0,
        );
    },
    { scope: rootRef },
  );

  return (
    <article
      ref={rootRef}
      data-sound
      onMouseEnter={() => tlRef.current?.play()}
      onMouseLeave={() => tlRef.current?.reverse()}
      className="relative flex cursor-pointer flex-col justify-between gap-10 overflow-hidden rounded-2xl bg-white p-6 shadow-[0_0_24px_rgba(0,0,0,0.12)]"
    >
      {/* Número en recuadro oscuro: mismo bloque que ocupa el logo en las
          cards de Organizations, para que las dos familias rimen. */}
      <div className="flex size-[72px] shrink-0 items-center justify-center rounded-lg bg-foreground font-neue-bold text-2xl text-background">
        {number}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h4 className="font-neue-bold text-xl tracking-tight">{title}</h4>
          <p className="mt-2 font-neue text-sm leading-relaxed text-foreground/60">
            {body}
          </p>
        </div>

        <div
          ref={accentRef}
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand text-white"
        >
          <ArrowUpRight className="size-6 shrink-0" strokeWidth={2.5} />
        </div>
      </div>
    </article>
  );
}
