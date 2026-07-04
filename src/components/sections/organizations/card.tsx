"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { cx } from "@/components/ui/icon-glyph-styles";
import type { OrgCard } from "./slides";

gsap.registerPlugin(useGSAP);

export function Card({
  logo,
  alt,
  metrics,
  className,
  hoverEnabled = true,
}: OrgCard & { className?: string; hoverEnabled?: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const purpleRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Mientras el hover esté deshabilitado (la card está entrando), fuerza el
  // estado de reposo para que el scale de la entrada no pelee con el del hover.
  useEffect(() => {
    if (!hoverEnabled) tlRef.current?.pause(0);
  }, [hoverEnabled]);

  useGSAP(
    () => {
      const purple = purpleRef.current;
      if (!purple) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Estado colapsado: sin ancho (flexGrow 0), chico y desplazado abajo-derecha.
      // El marginLeft negativo cancela el gap sobrante para que los grises llenen todo.
      gsap.set(purple, {
        flexGrow: 0,
        marginLeft: "-0.75rem",
        autoAlpha: 0,
        scale: 0.6,
        xPercent: 12,
        yPercent: 24,
        transformOrigin: "right bottom",
      });

      // Timeline de hover: el morado crece (flexGrow) y aparece desde abajo-derecha
      // con back.out (los grises se acoplan a 1/3 con mini rebote), y la card entera
      // hace un mini scale-up en paralelo.
      tlRef.current = gsap
        .timeline({ paused: true })
        .to(
          purple,
          {
            flexGrow: 1,
            marginLeft: "0rem",
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
          {
            scale: 1.03,
            duration: reduce ? 0 : 0.4,
            ease: "power2.out",
          },
          0,
        );
    },
    { scope: rootRef },
  );

  return (
    <article
      ref={rootRef}
      onMouseEnter={() => hoverEnabled && tlRef.current?.play()}
      onMouseLeave={() => tlRef.current?.reverse()}
      className={cx(
        "relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-[0_0_24px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      {/* logo */}
      <div className="relative flex size-[72px] items-center justify-center overflow-hidden rounded-lg bg-foreground">
        <Image
          src={logo}
          alt={alt}
          width={40}
          height={40}
          className="object-contain"
        />
      </div>

      {/* spacer */}
      <div className="h-24 sm:h-28" />

      {/* métricas + recuadro morado (aparece en hover) */}
      <div className="flex gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="min-w-0 flex-1 basis-0 rounded-lg bg-[#F3F3F3] p-4"
          >
            <p className="truncate font-neue text-2xl tracking-tight sm:text-3xl">
              {m.value}
            </p>
            <p className="mt-1 truncate font-neue text-sm text-foreground/60">
              {m.label}
            </p>
          </div>
        ))}

        <div
          ref={purpleRef}
          aria-hidden
          className="flex min-w-0 basis-0 items-center justify-center overflow-hidden rounded-lg bg-brand text-white"
        >
          <ArrowUpRight className="size-7 shrink-0" strokeWidth={2.5} />
        </div>
      </div>
    </article>
  );
}
