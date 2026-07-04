"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { images } from "@/lib/assets";
import { ENTRANCE } from "@/lib/motion";
import { useArrowHover } from "@/lib/use-arrow-hover";

gsap.registerPlugin(useGSAP);

export function ScheduleCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduce) return;

      gsap.from(cardRef.current, {
        yPercent: 14,
        autoAlpha: 0,
        duration: ENTRANCE.cardDuration,
        delay: ENTRANCE.card,
        ease: ENTRANCE.ease,
      });
    },
    { scope: cardRef }
  );

  // Recorrido de la flecha al hacer hover sobre la tarjeta.
  useArrowHover(cardRef, { direction: "up-right" });

  const onEnter = () => {
    gsap.to(cardRef.current, {
      scale: 1.04,
      duration: 0.55,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const onLeave = () => {
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.55,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex text-black w-full max-w-md cursor-pointer overflow-hidden rounded-2xl bg-card shadow-[0_0_24px_rgba(0,0,0,0.12)]"
    >
      <div className="flex flex-col justify-between p-5">
        <p className="text-body font-semibold leading-tight text-balance">
          Schedule a meeting to explore your idea!
        </p>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight">BLOXTEK</span>
          <IconBadge
            icon={ArrowUpRight}
            size="lg"
            className="overflow-hidden text-white"
            animateIn
            delay={ENTRANCE.icon.card}
          />
        </div>
      </div>

      <div className="relative hidden w-[52%] shrink-0 sm:block">
        <Image
          src={`${images.hero}/Schedule.png`}
          alt="Schedule preview"
          fill
          sizes="(min-width: 640px) 240px, 0px"
          className="object-cover"
          draggable={false}
        />
      </div>
    </div>
  );
}
