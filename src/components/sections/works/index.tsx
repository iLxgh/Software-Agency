"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { NoiseBackground } from "@/components/ui/noise-background";
import { workCards, worksIntro } from "./slides";
import { Card } from "./card";
import { ENTRANCE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export function Works() {
  const headerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLHeadingElement>(null);

  // Entrada del encabezado (badge + etiqueta) ligada al scroll.
  useGSAP(
    () => {
      const header = headerRef.current;
      const label = labelRef.current;
      if (!header || !label) return;
      const badge = header.querySelector<HTMLSpanElement>("span");

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set([label, badge], { autoAlpha: 0 });

      let split: SplitText | null = null;
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        split = new SplitText(label, { type: "words", mask: "words" });
        gsap.set(label, { autoAlpha: 1 });

        if (reduce) {
          gsap.set(badge, { autoAlpha: 1 });
          split.revert();
          return;
        }

        gsap.set(badge, { autoAlpha: 1 });

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: header,
            start: "top 85%",
            // Entra reproduciendo y sale al revés (reverse) en ambas direcciones.
            toggleActions: "play reverse play reverse",
          },
        });

        tl
          // Badge: mismo pop de ícono que en el resto de la web.
          .from(badge, {
            scale: 0,
            rotate: -35,
            autoAlpha: 0,
            transformOrigin: "center",
            duration: ENTRANCE.icon.duration,
            ease: ENTRANCE.icon.ease,
          })
          // Etiqueta
          .from(
            split.words,
            { yPercent: 100, duration: 0.9, stagger: 0.05, ease: "power3.out" },
            "-=0.4",
          );
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        split?.revert();
      };
    },
    { scope: headerRef },
  );

  return (
    <section
      // mt: colchón de scroll para que Works empiece a cubrir un poco más tarde
      // (Organizations queda visible ~300px más antes de que suba).
      className="relative z-10 mt-[300px] overflow-hidden bg-[#131313] text-white"
      aria-label="Success projects"
    >
      {/* Ruido local: sobre el fondo negro, con blend que aclara para que se vea. */}
      <NoiseBackground
        className="absolute inset-0 h-full w-full mix-blend-screen"
        opacity={0.05}
      />

      {/* divisor: respeta el ancho del contenedor */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-white/10" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1400px] flex-col gap-12 px-4 py-16 sm:px-6 sm:py-20 md:flex-row lg:px-8 lg:py-24">
        {/* Izquierda: título + icono */}
        <div
          ref={headerRef}
          className="flex w-full items-start gap-3 md:w-1/4"
        >
          <IconBadge
            icon={Check}
            size="sm"
            variant="brand"
            className="mt-0.5 text-white"
          />
          <h2 ref={labelRef} className="font-neue text-lg tracking-wide text-white">
            {worksIntro.label}
          </h2>
        </div>

        {/* Derecha: proyectos */}
        <div className="flex w-full flex-col gap-16 md:w-3/4">
          {workCards.map((card, i) => (
            <Card key={i} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
