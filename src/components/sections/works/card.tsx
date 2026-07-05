"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { WorkCard } from "./slides";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export function Card({ image, overlay, alt, title, description, stat }: WorkCard) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const statValueRef = useRef<HTMLSpanElement>(null);
  const statBoxRef = useRef<HTMLDivElement>(null);
  const statLabelRef = useRef<HTMLParagraphElement>(null);
  const hoverTlRef = useRef<gsap.core.Timeline | null>(null);
  // El hover solo se habilita cuando la entrada de la card terminó.
  const enteredRef = useRef(false);

  // --- Parallax de scroll + reveal de imagen en hover ---
  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      // Parallax ligado al scroll. Se anima `object-position` (no un transform):
      // así paneamos DENTRO del recorte de object-cover, aprovechando el alto
      // real de la imagen sin exponer bordes ni recortar de más. object-cover
      // siempre cubre el marco; object-position solo elige qué parte se ve.
      // El rango 35%→65% es la intensidad (0%/100% = borde real de la imagen).
      const img = imgRef.current?.querySelector("img");
      if (img) {
        const pos = { y: 50 };
        gsap.fromTo(
          pos,
          { y: 35 },
          {
            y: 65,
            ease: "none",
            onUpdate: () => {
              img.style.objectPosition = `50% ${pos.y}%`;
            },
            scrollTrigger: {
              trigger: frameRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      // --- Hover: blur/oscurecido de la base + reveal de la imagen respectiva ---
      const base = imgRef.current;
      const over = overlayRef.current;
      if (!base || !over) return;

      const state = { p: 0 };
      const applyFilter = () => {
        base.style.filter = state.p
          ? `blur(${state.p * 10}px) brightness(${1 - state.p * 0.45})`
          : "";
      };

      gsap.set(over, {
        autoAlpha: 0,
        transformPerspective: 850,
        transformOrigin: "center bottom",
      });

      hoverTlRef.current = gsap
        .timeline({ paused: true })
        .to(
          state,
          { p: 1, duration: 0.5, ease: "power2.out", onUpdate: applyFilter },
          0,
        )
        // Overlay: viene desde abajo casi acostada y se endereza al centro.
        .fromTo(
          over,
          { yPercent: 95, rotationX: 82, scale: 1.06, autoAlpha: 0 },
          {
            yPercent: 0,
            rotationX: -6,
            scale: 1.02,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power3.out",
            immediateRender: false,
          },
          0,
        )
        .to(over, {
          rotationX: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
    },
    { scope: frameRef },
  );

  // --- Entrada de la card ligada al scroll (cada card se anima al entrar) ---
  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const frame = frameRef.current;
      const statBox = statBoxRef.current;
      const textEls = [
        titleRef.current,
        descRef.current,
        statValueRef.current,
        statLabelRef.current,
      ].filter(Boolean) as HTMLElement[];
      if (!frame) return;

      // Oculta antes del primer paint (solo con JS) para evitar el flash.
      gsap.set([frame, statBox, ...textEls], { autoAlpha: 0 });

      let splits: SplitText[] = [];
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        if (!rootRef.current) return;

        splits = textEls.map(
          (el) => new SplitText(el, { type: "words", mask: "words" }),
        );

        // Los contenedores ya pueden mostrarse (las palabras siguen ocultas por
        // la máscara), así que no hay flash.
        gsap.set(textEls, { autoAlpha: 1 });

        if (reduce) {
          gsap.set([frame, statBox], { autoAlpha: 1 });
          splits.forEach((s) => s.revert());
          enteredRef.current = true;
          return;
        }

        // Restaura el valor natural para que los `from` de abajo animen 0 -> 1.
        gsap.set([frame, statBox], { autoAlpha: 1 });

        tl = gsap.timeline({
          scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
          onComplete: () => {
            enteredRef.current = true;
          },
        });

        tl
          // Imagen: mismo pop que las cards de Organizations (chica desde
          // abajo-derecha -> tamaño normal con mini rebote).
          .from(frame, {
            xPercent: 12,
            yPercent: 24,
            scale: 0.6,
            autoAlpha: 0,
            transformOrigin: "right bottom",
            duration: 0.8,
            ease: "back.out(1.4)",
          })
          // Título
          .from(
            splits[0].words,
            { yPercent: 100, duration: 0.9, stagger: 0.05, ease: "power3.out" },
            "-=0.5",
          )
          // Descripción
          .from(
            splits[1].words,
            { yPercent: 100, duration: 0.9, stagger: 0.04, ease: "power3.out" },
            "-=0.6",
          )
          // Stat: recuadro (crece desde la izquierda con mini rebote)
          .from(
            statBox,
            {
              scaleX: 0,
              autoAlpha: 0,
              transformOrigin: "left center",
              duration: 0.6,
              ease: "back.out(1.8)",
            },
            "-=0.45",
          )
          // Stat: valor (sube dentro del recuadro)
          .from(
            splits[2].words,
            { yPercent: 100, duration: 0.8, stagger: 0.05, ease: "power3.out" },
            "-=0.3",
          )
          // Stat: etiqueta
          .from(
            splits[3].words,
            { yPercent: 100, duration: 0.8, stagger: 0.04, ease: "power3.out" },
            "-=0.7",
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

  const onEnter = () => {
    if (enteredRef.current) hoverTlRef.current?.play();
  };
  const onLeave = () => hoverTlRef.current?.reverse();

  return (
    <div ref={rootRef} className="flex w-full flex-col gap-8 lg:flex-row">
      <div
        ref={frameRef}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="relative aspect-4/3 w-full shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-[0_0_24px_rgba(0,0,0,0.35)] lg:w-[65%]"
      >
        <div ref={imgRef} className="absolute inset-0">
          <Image src={image} alt={alt} fill className="object-cover" />
        </div>

        {/* Rectángulo centrado que flota sobre la base borrosa (no la cubre). */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            ref={overlayRef}
            className="relative aspect-video w-[68%] overflow-hidden rounded-xl shadow-2xl will-change-transform"
            aria-hidden
          >
            <Image
              src={overlay}
              alt=""
              fill
              sizes="(min-width: 1024px) 45vw, 70vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-start py-2 lg:w-[35%]">
        <h3 ref={titleRef} className="mb-4 font-neue-bold text-xl text-white">
          {title}
        </h3>

        <p
          ref={descRef}
          className="mb-12 font-neue text-body leading-relaxed text-white/50"
        >
          {description}
        </p>

        <div className="mt-auto lg:mt-0">
          {/* Recuadro como div propio (detrás del texto) para animarlo aparte. */}
          <div className="relative mb-3 inline-block px-3 py-1">
            <div
              ref={statBoxRef}
              aria-hidden
              className="absolute inset-0 rounded-lg bg-[#717171]"
            />
            <span
              ref={statValueRef}
              className="relative font-neue-bold text-lg text-white"
            >
              {stat.value}
            </span>
          </div>
          <p
            ref={statLabelRef}
            className="font-neue text-sm leading-tight text-white whitespace-pre-line"
          >
            {stat.label}
          </p>
        </div>
      </div>
    </div>
  );
}
