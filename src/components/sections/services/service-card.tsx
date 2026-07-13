"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { images } from "@/lib/assets";
import { cx } from "@/components/ui/icon-glyph-styles";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type ServiceCardProps = {
  image?: string;
  alt?: string;
  title: string;
  description: string;
  className?: string;
};

export function ServiceCard({
  image = `${images.works}/project1.jpg`,
  alt = "",
  title,
  description,
  className,
}: ServiceCardProps) {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  // Entrada al llegar a ~la mitad de la pantalla: pop desde abajo-derecha con
  // rebote + reveal del texto. Se REPRODUCE (no scrub), a velocidad fija.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const textEls = [titleRef.current, descRef.current].filter(
        Boolean,
      ) as HTMLElement[];

      // Oculta antes del primer paint para evitar el flash.
      gsap.set([root, ...textEls], { autoAlpha: 0 });

      let splits: SplitText[] = [];
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        splits = textEls.map(
          (el) => new SplitText(el, { type: "words", mask: "words" }),
        );
        gsap.set(textEls, { autoAlpha: 1 });

        if (reduce) {
          gsap.set(root, { autoAlpha: 1 });
          splits.forEach((s) => s.revert());
          return;
        }

        gsap.set(root, { autoAlpha: 1 });

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            // Dispara cuando la card entra ~a la mitad de la pantalla.
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        });

        tl
          .from(root, {
            scale: 0.6,
            xPercent: 12,
            yPercent: 24,
            autoAlpha: 0,
            transformOrigin: "right bottom",
            duration: 0.8,
            ease: "back.out(1.4)",
          })
          .from(
            splits[0].words,
            { yPercent: 100, duration: 0.6, stagger: 0.04, ease: "power3.out" },
            "-=0.4",
          )
          .from(
            splits[1].words,
            { yPercent: 100, duration: 0.6, stagger: 0.03, ease: "power3.out" },
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
    { scope: rootRef },
  );

  return (
    <article
      ref={rootRef}
      className={cx(
        "relative h-[400px] w-[320px] overflow-hidden rounded-2xl",
        className,
      )}
    >
      {/* imagen que cubre toda la card */}
      <Image src={image} alt={alt} fill className="object-cover" />

      {/* panel blanco con bordes superiores redondeados */}
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-6">
        <h3 ref={titleRef} className="font-neue-bold text-2xl text-foreground">
          {title}
        </h3>
        <p
          ref={descRef}
          className="mt-2 font-neue text-sm leading-relaxed text-foreground/60"
        >
          {description}
        </p>
      </div>
    </article>
  );
}
