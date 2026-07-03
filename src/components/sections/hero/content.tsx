"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowDown, Check } from "lucide-react";
import { IconLink } from "@/components/ui/icon-link";
import { AnimatedText } from "@/components/ui/animated-text";
import { ScheduleCard } from "./schedule-card";
import { ENTRANCE } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

export function HeroContent() {
  const checkRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduce) return;

      gsap.from(checkRef.current, {
        scale: 0,
        rotate: -35,
        autoAlpha: 0,
        transformOrigin: "center",
        duration: ENTRANCE.icon.duration,
        delay: ENTRANCE.icon.check,
        ease: ENTRANCE.icon.ease,
      });
    },
    { scope: checkRef }
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
          delay={ENTRANCE.tagline}
          stagger={0.08}
        >
          B2B / B2G Blockchain Solutions Provider
        </AnimatedText>
      </div>

      <AnimatedText
        as="h1"
        className="mt-5 max-w-5xl text-balance font-neue-bold text-title"
        delay={ENTRANCE.title}
        stagger={0.07}
        maskPadBottom={14}
      >
        We Build{" "}
        <span className="font-baskerville italic">high-performance</span>{" "}
        marketing engines for <br /> B2B Brands
      </AnimatedText>

      <AnimatedText
        as="p"
        className="mt-6 max-w-md text-pretty text-body text-foreground/80"
        delay={ENTRANCE.description}
        stagger={0.045}
      >
        We build, optimize, and scale marketing engines that generate pipeline
        and improve marketing ROI
      </AnimatedText>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
        <IconLink
          href="#"
          icon={ArrowDown}
          iconSize="lg"
          className="text-small"
          iconAnimateIn
          iconDelay={ENTRANCE.icon.discover}
        >
          <AnimatedText as="span" delay={ENTRANCE.cta}>
            Discover more
          </AnimatedText>
        </IconLink>

        <ScheduleCard />
      </div>
    </section>
  );
}
