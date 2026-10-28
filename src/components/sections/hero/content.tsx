"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowDown, Check } from "lucide-react";
import { IconLink } from "@/components/ui/icon-link";
import { AnimatedText } from "@/components/ui/animated-text";
import { ENTRANCE } from "@/lib/motion";
import { useMagnetic } from "@/lib/use-magnetic";
import { useArrowHover } from "@/lib/use-arrow-hover";
import { scrollToTarget } from "@/lib/scroll-to";

gsap.registerPlugin(useGSAP);

export function HeroContent() {
  const checkRef = useRef<HTMLSpanElement>(null);
  const discoverRef = useRef<HTMLAnchorElement>(null);

  useMagnetic(discoverRef);

  useArrowHover(discoverRef, { direction: "down" });

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      gsap.from(checkRef.current, {
        scale: 0,
        rotate: -35,
        autoAlpha: 0,
        transformOrigin: "center",
        duration: ENTRANCE.icon.duration,
        delay: ENTRANCE.gate + ENTRANCE.icon.check,
        ease: ENTRANCE.icon.ease,
      });
    },
    { scope: checkRef },
  );

  return (
    <section className="flex flex-1 flex-col justify-center py-8">
      <div className="flex items-center gap-3">
        <span
          ref={checkRef}
          className="flex size-7  text-white items-center justify-center rounded-md bg-brand"
        >
          <Check className="size-4" strokeWidth={3} />
        </span>
        <AnimatedText
          as="p"
          className="text-small font-medium"
          delay={ENTRANCE.gate + ENTRANCE.tagline}
          stagger={0.08}
        >
          Socio tecnológico / Blockchain aplicado a negocio real
        </AnimatedText>
      </div>

      <AnimatedText
        as="h1"
        className="mt-5 max-w-5xl text-balance font-neue-bold text-title"
        delay={ENTRANCE.gate + ENTRANCE.title}
        stagger={0.07}
        maskPadBottom={14}
      >
        La tecnología que tu operación necesita, no la que{" "}
        <span className="font-baskerville italic">está de moda</span>
      </AnimatedText>

      <AnimatedText
        as="p"
        className="mt-6 max-w-md text-pretty text-body text-foreground/80"
        delay={ENTRANCE.gate + ENTRANCE.description}
        stagger={0.045}
      >
        Consultoría y desarrollo para empresas que ya operan. Primero el
        problema, luego la tecnología.
      </AnimatedText>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
        <IconLink
          ref={discoverRef}

          href="#approach"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget("#approach");
          }}
          icon={ArrowDown}
          iconSize="lg"
          className="text-small"
          iconAnimateIn
          iconDelay={ENTRANCE.gate + ENTRANCE.icon.discover}
        >
          <AnimatedText as="span" delay={ENTRANCE.gate + ENTRANCE.cta}>
            Conocer las cuatro soluciones
          </AnimatedText>
        </IconLink>
      </div>
    </section>
  );
}
