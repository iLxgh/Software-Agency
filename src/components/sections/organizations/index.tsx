"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { IconBadge } from "@/components/ui/icon-badge";
import { orgCards, orgIntro } from "./slides";
import { Card } from "./card";
import { ENTRANCE } from "@/lib/motion";
import { useMagnetic } from "@/lib/use-magnetic";
import { useArrowHover } from "@/lib/use-arrow-hover";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export function Organizations() {
  const total = orgCards.length;

  const sectionRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // --- Carrusel ---
  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const indexRef = useRef(0);

  // El hover de las cards solo se habilita cuando la entrada terminó, para que
  // no se dispare (scale) mientras las cards aún están animándose.
  const [hoverReady, setHoverReady] = useState(false);

  const goTo = (i: number) => {
    indexRef.current = i;
    setIndex(i);
  };
  const prev = () => goTo(Math.max(0, indexRef.current - 1));
  const next = () => goTo(Math.min(maxIndex, indexRef.current + 1));

  // Paso (ancho de una card + gap) leído del DOM para soportar el responsive.
  const stepSize = () => {
    const track = trackRef.current;
    const first = track?.children[0] as HTMLElement | undefined;
    if (!track || !first) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    return first.offsetWidth + gap;
  };

  // Mide cuántas cards caben y reposiciona (instantáneo) tras resize/carga.
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const step = stepSize();
      if (!track || !step) return;
      const cs = getComputedStyle(track);
      const gap = parseFloat(cs.columnGap || "0") || 0;
      const padL = parseFloat(cs.paddingLeft || "0") || 0;
      const padR = parseFloat(cs.paddingRight || "0") || 0;
      // El ancho útil es el del contenido del track (max-w), no el viewport 100vw.
      const content = track.clientWidth - padL - padR;
      const visible = Math.max(1, Math.round((content + gap) / step));
      const max = Math.max(0, total - visible);
      const clamped = Math.min(indexRef.current, max);
      indexRef.current = clamped;
      setMaxIndex(max);
      setIndex(clamped);
      gsap.set(track, { x: -clamped * step });
    };

    measure();
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [total]);

  // Desliza el track al cambiar de índice (con easing). useEffect (no useGSAP)
  // para que el tween persista y no se revierta en cada cambio de índice.
  useEffect(() => {
    const step = stepSize();
    if (trackRef.current && step) {
      gsap.to(trackRef.current, {
        x: -index * step,
        duration: 0.6,
        ease: "power3.out",
      });
    }
  }, [index]);

  // --- Entrada + re-trigger al hacer scroll ---
  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const cardEls = gsap.utils.toArray<HTMLElement>(
        trackRef.current?.children ?? [],
      );
      const btnEls = gsap.utils.toArray<HTMLElement>(
        navRef.current?.children ?? [],
      );

      // Oculta antes del primer paint (solo con JS) para evitar el flash.
      gsap.set(
        [
          bodyRef.current,
          headlineRef.current,
          ctaRef.current,
          ...cardEls,
          ...btnEls,
        ],
        { autoAlpha: 0 },
      );

      // Divide un texto en palabras enmascaradas (mismo reveal que AnimatedText).
      const maskSplit = (el: HTMLElement, pad = 0) => {
        const s = new SplitText(el, { type: "words", mask: "words" });
        if (pad) {
          s.words.forEach((w) => {
            const unit = w as HTMLElement;
            unit.style.paddingBottom = `${pad}px`;
            const mask = unit.parentElement;
            if (mask) mask.style.marginBottom = `${-pad}px`;
          });
        }
        return s;
      };

      let splits: SplitText[] = [];
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        if (!sectionRef.current) return;

        const bodySplit = maskSplit(bodyRef.current!);
        const headSplit = maskSplit(headlineRef.current!, 14);
        splits = [bodySplit, headSplit];

        // Los contenedores de texto ya pueden mostrarse: las palabras siguen
        // ocultas por la máscara, así que no hay flash.
        gsap.set([bodyRef.current, headlineRef.current], { autoAlpha: 1 });

        if (reduce) {
          gsap.set([ctaRef.current, ...cardEls, ...btnEls], { autoAlpha: 1 });
          splits.forEach((s) => s.revert());
          setHoverReady(true);
          return;
        }

        // Restaura el valor natural para que los `from` de abajo animen 0 -> 1.
        gsap.set([ctaRef.current, ...cardEls, ...btnEls], { autoAlpha: 1 });

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            // Se re-dispara al entrar por arriba o por abajo; sin acción al salir
            // para evitar el salto brusco mientras la sección aún es visible.
            toggleActions: "restart none restart none",
          },
          // Deshabilita el hover mientras entra; lo re-habilita al terminar.
          onStart: () => setHoverReady(false),
          onComplete: () => setHoverReady(true),
        });

        tl
          // Titular
          .from(headSplit.words, {
            yPercent: 100,
            duration: 0.9,
            stagger: 0.06,
            ease: "power3.out",
          })
          // Cuerpo (solapado para fluir)
          .from(
            bodySplit.words,
            {
              yPercent: 100,
              duration: 0.9,
              stagger: 0.05,
              ease: "power3.out",
            },
            "-=0.6",
          )
          // CTA como bloque (sube + aparece)
          .from(
            ctaRef.current,
            {
              yPercent: 30,
              autoAlpha: 0,
              duration: 0.7,
              ease: "power3.out",
            },
            "-=0.5",
          )
          // Flechas prev/next: mismo pop de ícono que el hero
          .from(
            btnEls,
            {
              scale: 0,
              rotate: -35,
              autoAlpha: 0,
              transformOrigin: "center",
              duration: ENTRANCE.icon.duration,
              ease: ENTRANCE.icon.ease,
              stagger: 0.1,
            },
            "-=0.45",
          )
          // Cards: desde abajo-derecha, pequeñas -> normal con mini rebote
          .from(
            cardEls,
            {
              xPercent: 12,
              yPercent: 24,
              scale: 0.6,
              autoAlpha: 0,
              transformOrigin: "right bottom",
              duration: 0.7,
              stagger: 0.1,
              ease: "back.out(1.4)",
            },
            "-=0.35",
          );

        ScrollTrigger.refresh();
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: sectionRef },
  );

  // CTA "Explore all results": botón magnético + rebote de scale en hover.
  useMagnetic(ctaRef);
  // Recorrido de la flecha (apunta arriba-derecha) al hacer hover en el CTA.
  useArrowHover(ctaRef, { direction: "up-right" });

  // Superposición: la sección se fija (sticky) y Works sube por encima cubriéndola,
  // mientras esta se va difuminando (blur ligado al scroll de Works).
  useGSAP(
    () => {
      const section = sectionRef.current;
      const works = section?.nextElementSibling as HTMLElement | null;
      if (!section || !works) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      // Se anima un proxy y se aplica el filtro en onUpdate (GSAP no interpola
      // `filter: blur()` de forma nativa).
      const state = { blur: 0 };
      const apply = () => {
        section.style.filter = state.blur ? `blur(${state.blur}px)` : "";
      };

      const tween = gsap.to(state, {
        blur: 12,
        ease: "none",
        onUpdate: apply,
        scrollTrigger: {
          // De cuando Works asoma por abajo a cuando su borde superior llega
          // arriba (cobertura completa): el blur avanza junto con la cobertura.
          trigger: works,
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        section.style.filter = "";
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      // sticky con top negativo: se fija 150px "más tarde" para dejar ver la parte
      // baja antes de congelarse. Sin bg propio para que se vea el ruido global.
      className="sticky top-[-60px] z-0 text-foreground"
      style={{ overflowX: "clip" }}
      aria-label="Organizations that trust BLOXTEK"
    >
      {/* divisor: respeta el ancho del contenedor */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-foreground/20" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[380px_1fr]">
          {/* Izquierda: cuerpo + CTA */}
          <div className="flex flex-col items-end justify-center gap-8">
            <p
              ref={bodyRef}
              className="max-w-xs text-right font-neue text-lg leading-relaxed text-foreground/70 sm:text-xl lg:max-w-[400px]"
            >
              {orgIntro.body}
            </p>

            <a
              ref={ctaRef}
              href={orgIntro.ctaHref}
              className="flex items-center overflow-hidden rounded-lg bg-white shadow-[0_0_24px_rgba(0,0,0,0.12)]"
            >
              <span className="px-5 py-3 font-neue text-base text-foreground">
                {orgIntro.ctaLabel}
              </span>
              <IconBadge
                icon={ArrowUpRight}
                size="lg"
                className="rounded-none text-white"
              />
            </a>
          </div>

          {/* Derecha: titular + flechas de navegación */}
          <div className="flex flex-col justify-between gap-6">
            <h2
              ref={headlineRef}
              className="font-neue-bold text-4xl leading-[1.02] tracking-tight text-balance text-right sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              50+ Organizations Trust BLOXTEK to Transform Their{" "}
              <span className="font-baskerville text-[0.92em] font-normal tracking-normal italic">
                Digital Processes
              </span>
            </h2>

            <div ref={navRef} className="flex justify-end gap-3">
              <IconButton
                icon={ArrowLeft}
                variant="muted"
                size="lg"
                onClick={prev}
                disabled={index <= 0}
                aria-label="Previous organizations"
                className="cursor-pointer transition-colors hover:bg-foreground/20 disabled:cursor-not-allowed disabled:bg-foreground/5 disabled:text-foreground/25"
              />
              <IconButton
                icon={ArrowRight}
                variant="solid"
                size="lg"
                onClick={next}
                disabled={index >= maxIndex}
                aria-label="Next organizations"
                className="cursor-pointer transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:bg-foreground/25"
              />
            </div>
          </div>
        </div>

        {/* ---- CARRUSEL DE TARJETAS ---- */}
        {/* Carrusel full-bleed: los márgenes negativos lo expanden a todo el ancho
            de la web (100vw) y overflow-x: clip recorta en las orillas de la página
            (lejos de las cards en pantallas anchas), así la sombra/scale no se cortan.
            El track por dentro se re-alinea al contenido (max-w + mx-auto + px), de
            modo que la 1ª card arranca en la misma posición que la cabecera.
            overflow-y queda visible para no cortar la sombra de arriba/abajo. */}
        <div
          ref={viewportRef}
          className="mt-12"
          style={{
            marginLeft: "calc((100% - 100vw) / 2)",
            marginRight: "calc((100% - 100vw) / 2)",
            overflowX: "clip",
          }}
        >
          <div
            ref={trackRef}
            className="mx-auto flex max-w-[1400px] gap-4 px-4 sm:px-6 lg:px-8"
          >
            {orgCards.map((card, i) => (
              <Card
                key={i}
                {...card}
                hoverEnabled={hoverReady}
                className="shrink-0 basis-full sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
