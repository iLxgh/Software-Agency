"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { ProcessStep } from "./slides";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type StepProps = ProcessStep & {
  /** Lado desde el que entra deslizándose la card completa. */
  fromDir: "left" | "right";
};

export function Step({ id, title, description, video, fromDir }: StepProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  // Al entrar: toda la card se desliza desde un lado (der/izq alternado) y, en lo
  // que llega, se disparan el reveal de los textos y la aparición del video.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const textEls = [
        idRef.current,
        titleRef.current,
        descRef.current,
      ].filter(Boolean) as HTMLElement[];

      // Oculta antes del primer paint para evitar el flash.
      gsap.set([root, videoRef.current], { autoAlpha: 0 });

      let splits: SplitText[] = [];
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        splits = [titleRef.current, descRef.current]
          .filter(Boolean)
          .map((el) => new SplitText(el!, { type: "words", mask: "words" }));

        if (reduce) {
          gsap.set([root, videoRef.current, ...textEls], { autoAlpha: 1 });
          splits.forEach((s) => s.revert());
          return;
        }

        // La card y el video ya pueden mostrarse (los textos siguen tapados por
        // la máscara). El video debe volver a su valor natural para que el `.from`
        // de abajo lo anime 0 -> 1 en vez de 0 -> 0 (no-op).
        gsap.set([root, videoRef.current, ...textEls], { autoAlpha: 1 });

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 78%",
            toggleActions: "play reverse play reverse",
          },
        });

        tl
          // Card completa: entra deslizándose desde el lado indicado (lento para
          // que el recorrido se note bien).
          .from(root, {
            xPercent: fromDir === "right" ? 55 : -55,
            autoAlpha: 0,
            duration: 1.7,
            ease: "power3.out",
          })
          // Título (reveal por palabras)
          .from(
            splits[0].words,
            { yPercent: 100, duration: 0.7, stagger: 0.05, ease: "power3.out" },
            "-=1.1",
          )
          // Descripción (solapada)
          .from(
            splits[1].words,
            { yPercent: 100, duration: 0.7, stagger: 0.03, ease: "power3.out" },
            "-=0.55",
          )
          // Video: aparece con un leve zoom
          .from(
            videoRef.current,
            {
              autoAlpha: 0,
              scale: 0.92,
              duration: 0.9,
              ease: "power3.out",
            },
            "-=1.0",
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
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="flex flex-col items-stretch gap-8 border-t border-foreground/15 py-12 last:border-b md:flex-row md:gap-4"
    >
      {/* número de paso */}
      <div className="w-full shrink-0 pt-1 md:w-1/5">
        <span
          ref={idRef}
          className="font-mono text-xs font-medium tracking-widest text-foreground/70 uppercase"
        >
          {id}
        </span>
      </div>

      {/* texto */}
      <div className="w-full shrink-0 pr-8 md:w-1/3">
        <h3
          ref={titleRef}
          className="mb-4 font-neue-bold text-2xl text-foreground"
        >
          {title}
        </h3>
        <p
          ref={descRef}
          className="font-neue text-body leading-relaxed text-foreground/60"
        >
          {description}
        </p>
      </div>

      {/* video: ocupa el 100% del alto del contenedor */}
      <div ref={videoRef} className="w-full md:flex-1">
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="h-full min-h-[250px] w-full rounded-lg object-cover"
        />
      </div>
    </div>
  );
}
