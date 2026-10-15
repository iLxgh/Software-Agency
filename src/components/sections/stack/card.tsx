"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { StackCard } from "./slides";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * Card sin imagen: la jerarquía la llevan la tipografía y los badges. Entra al
 * llegar a ~2/3 de la pantalla con el mismo pop desde abajo-derecha que las
 * cards de Services, seguido del reveal del título y del escalonado de badges.
 */
export function Card({ index, eyebrow, title, items }: StackCard) {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const heading = titleRef.current;
      if (!root || !heading) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const chips = gsap.utils.toArray<HTMLElement>(
        listRef.current?.children ?? [],
      );

      // Oculta antes del primer paint para evitar el flash.
      gsap.set([root, heading], { autoAlpha: 0 });

      let split: SplitText | null = null;
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        if (!titleRef.current) return;
        split = new SplitText(heading, { type: "words", mask: "words" });
        gsap.set([root, heading], { autoAlpha: 1 });

        if (reduce) {
          split.revert();
          return;
        }

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        });

        tl.from(root, {
          scale: 0.6,
          xPercent: 12,
          yPercent: 24,
          autoAlpha: 0,
          transformOrigin: "right bottom",
          duration: 0.8,
          ease: "back.out(1.4)",
        })
          .from(
            split.words,
            { yPercent: 100, duration: 0.6, stagger: 0.04, ease: "power3.out" },
            "-=0.4",
          )
          .from(
            chips,
            {
              y: 14,
              autoAlpha: 0,
              duration: 0.5,
              stagger: 0.035,
              ease: "power3.out",
            },
            "-=0.35",
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
    { scope: rootRef },
  );

  return (
    <article
      ref={rootRef}
      className="w-[min(600px,88vw)] rounded-2xl bg-white p-7 text-foreground sm:p-9"
    >
      {/* Fila superior: numeración + etiqueta a la izquierda, conteo a la derecha. */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-bold tracking-[0.14em] text-foreground/40 uppercase">
          {index} — {eyebrow}
        </span>
        <span className="rounded-lg bg-foreground/5 px-2.5 py-1 text-[11px] font-bold tabular-nums text-foreground/50">
          {items.length}
        </span>
      </div>

      <h3
        ref={titleRef}
        className="mt-5 font-neue-bold text-3xl leading-[1.02] tracking-tight whitespace-pre-line sm:text-4xl"
      >
        {title}
      </h3>

      {/* Regla de acento: separa el titular de la lista sin meter otra línea. */}
      <span
        aria-hidden
        className="mt-5 block h-[3px] w-10 rounded-full bg-brand"
      />

      {/* Badges: la lista venía separada por "·"; como chips se lee de un
          vistazo y el bloque no queda como un párrafo denso. */}
      <ul ref={listRef} className="mt-6 flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg border border-foreground/10 bg-foreground/[0.03] px-3 py-1.5 text-sm text-foreground/75"
          >
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
