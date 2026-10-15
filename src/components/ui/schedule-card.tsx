"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cx } from "@/components/ui/icon-glyph-styles";
import { images } from "@/lib/assets";
import { ENTRANCE } from "@/lib/motion";
import { useArrowHover } from "@/lib/use-arrow-hover";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ScheduleCardProps = {
  /**
   * "load": entra con la coreografía de carga del hero (delay fijo).
   * "scroll": entra al aparecer en viewport — para secciones bajo el pliegue,
   * donde un delay desde la carga se habría consumido antes de verse.
   */
  reveal?: "load" | "scroll";
  className?: string;
};

export function ScheduleCard({
  reveal = "load",
  className,
}: ScheduleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      gsap.from(cardRef.current, {
        yPercent: 14,
        autoAlpha: 0,
        duration: ENTRANCE.cardDuration,
        delay: reveal === "load" ? ENTRANCE.card : 0,
        ease: ENTRANCE.ease,
        scrollTrigger:
          reveal === "scroll"
            ? { trigger: cardRef.current, start: "top 85%" }
            : undefined,
      });
    },
    { scope: cardRef, dependencies: [reveal] },
  );

  // El recorrido de la flecha va sobre el botón, no sobre la tarjeta: ahora
  // dentro hay días clicables y no queremos dispararlo al pasar por ellos.
  useArrowHover(ctaRef, { direction: "up-right" });

  return (
    <div
      ref={cardRef}
      className={cx(
        "flex w-full flex-col gap-7 rounded-2xl bg-card p-6 text-foreground shadow-[0_0_24px_rgba(0,0,0,0.12)] sm:p-8",
        className,
      )}
    >
      <p className="font-neue-bold text-4xl leading-[1.02] tracking-tight uppercase sm:text-5xl">
        Agenda una
        <br />
        <span className="text-brand">llamada</span>
      </p>

      <Calendar />

      <div className="mt-auto flex items-center justify-between gap-4">
        <Image
          src={`${images.general}/logo-bloxtek.svg`}
          alt="BLOXTEK"
          width={138}
          height={39}
          // El optimizador de Next rechaza SVG salvo que se active
          // dangerouslyAllowSVG; un SVG tampoco gana nada al optimizarse.
          unoptimized
          className="h-7 w-auto sm:h-8"
          draggable={false}
        />

        <button
          ref={ctaRef}
          type="button"
          data-sound
          className="flex cursor-pointer items-center gap-3 rounded-full bg-brand py-2 pr-2 pl-6 text-white transition-transform duration-300 hover:scale-[1.03]"
        >
          <span className="text-small font-medium">Continuar</span>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-brand">
            <ArrowUpRight className="size-4" strokeWidth={2.5} />
          </span>
        </button>
      </div>
    </div>
  );
}
