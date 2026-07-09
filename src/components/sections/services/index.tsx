"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { NoiseBackground } from "@/components/ui/noise-background";
import { ServiceCard } from "./service-card";
import { serviceCards, servicesIntro } from "./slides";
import { ENTRANCE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export function Services() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLSpanElement>(null);

  // Efecto: un "track" alto + un viewport `sticky` que se queda fijo mientras
  // scrolleas por el track (misma técnica que Organizations, compatible con
  // Lenis, sin el pin de ScrollTrigger). El timeline se scrubbea con el track:
  // al scrollear, las cards pasan hacia arriba una tras otra.
  useGSAP(
    () => {
      const track = trackRef.current;
      const container = cardsRef.current;
      if (!track || !container) return;

      const cards = gsap.utils.toArray<HTMLElement>(container.children);
      if (cards.length === 0) return;

      // <article> interno de cada card (lo que hace el pop y el reveal de texto).
      const articles = cards.map(
        (c) => c.querySelector("article") as HTMLElement | null,
      );

      const off = Math.min(230, window.innerWidth * 0.22);

      // Posición base de cada wrapper: todas centradas (offset lateral alternado
      // + `y` que baja el centro). La visibilidad de las 1..n la da su pop; la 0
      // la maneja la entrada. Corre antes del paint, sin flash.
      gsap.set(cards, {
        x: (i) => (i % 2 === 0 ? off : -off),
        y: 80,
      });

      // Cards 1..n arrancan chicas/ocultas para popear al llegar a su turno.
      const laterArticles = articles.slice(1).filter(Boolean) as HTMLElement[];
      gsap.set(laterArticles, {
        scale: 0.6,
        xPercent: 12,
        yPercent: 24,
        autoAlpha: 0,
        transformOrigin: "right bottom",
      });

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      let splits: SplitText[] = [];
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        // Texto (h3 + p) de las cards 1..n en palabras enmascaradas.
        const cardSplits: SplitText[][] = articles.map((a, i) =>
          a && i >= 1
            ? gsap.utils
                .toArray<HTMLElement>(a.querySelectorAll("h3, p"))
                .map(
                  (el) => new SplitText(el, { type: "words", mask: "words" }),
                )
            : [],
        );
        splits = cardSplits.flat();

        // HOLD = descanso final; LEAD = descanso inicial (reposo de la 1ª card).
        const HOLD = 0.5;
        const LEAD = 1.0;

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            // scrub numérico = la animación "persigue" el scroll (suaviza flicks).
            scrub: 0.2,
            // snap a las etiquetas (una por card): aunque el user haga un scroll
            // brusco, al soltar aterriza limpio en una card en vez de quedar a
            // media transición borrosa. `duration` = qué tan rápido acomoda.
            snap: {
              snapTo: "labels",
              // Más lento = acomoda con más suavidad (antes se sentía de golpe).
              duration: { min: 0.4, max: 1.7 },
              ease: "power2.inOut",
              delay: 0.05,
            },
          },
        });

        // Ancla de snap de la 1ª card, DENTRO de su reposo (ya centrada y con el
        // sticky enganchado — no en progress 0, que caía en el borde del pin y
        // se veía descentrada). Así la card 1 es un punto estable y no salta.
        tl.addLabel("c0", LEAD * 0.5);

        // Cursor de tiempo: cada card dura lo necesario (pop + su texto).
        let t = LEAD; // la card 0 se queda quieta hasta aquí
        const TEXT_DUR = 0.5;
        const TEXT_STAGGER = 0.03;

        for (let i = 1; i < cards.length; i++) {
          // La saliente sube y sale.
          tl.to(
            cards[i - 1],
            { yPercent: -120, duration: 0.7, ease: "power2.in" },
            t,
          );
          // La entrante POPEA en el centro: chica desde abajo-derecha con rebote.
          tl.fromTo(
            articles[i],
            { scale: 0.6, xPercent: 12, yPercent: 24, autoAlpha: 0 },
            {
              scale: 1,
              xPercent: 0,
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.7,
              ease: "back.out(1.4)",
              immediateRender: false,
            },
            t + 0.3,
          );
          // Reveal del texto. Calculamos cuándo TERMINA para poner ahí la etiqueta.
          const words = cardSplits[i].flatMap((s) => s.words);
          let settled = t + 1.0; // fin del pop
          if (words.length) {
            const textStart = t + 0.5;
            tl.from(
              words,
              {
                yPercent: 100,
                duration: TEXT_DUR,
                stagger: TEXT_STAGGER,
                ease: "power3.out",
              },
              textStart,
            );
            settled = Math.max(
              settled,
              textStart + (words.length - 1) * TEXT_STAGGER + TEXT_DUR,
            );
          }
          settled += 0.1;

          // Etiqueta (snap) donde la card ya está centrada Y el texto TERMINÓ.
          tl.addLabel(`c${i}`, settled);
          // Pequeño descanso antes de la siguiente transición.
          t = settled + 0.4;
        }

        // Hold final: la última card se queda antes de soltar el pin.
        tl.to({}, { duration: HOLD });
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: trackRef },
  );

  // Entrada de los componentes al llegar a la sección: mask-reveal en textos,
  // pop del check y pop de la 1ª card (chica desde abajo-derecha con rebote).
  // La card se anima en su <article> interno, NO en el wrapper (que lo controla
  // el scrub), para que no choquen.
  useGSAP(
    () => {
      const content = contentRef.current;
      const cardsC = cardsRef.current;
      if (!content || !cardsC) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const texts = gsap.utils.toArray<HTMLElement>(
        content.querySelectorAll("[data-reveal]"),
      );
      const badge = content.querySelector("svg")?.parentElement ?? null;
      const firstCard =
        cardsC.children[0]?.querySelector("article") ?? null;
      const pops = [badge, firstCard].filter(Boolean) as HTMLElement[];

      // Oculta antes del primer paint para evitar el flash.
      gsap.set([...texts, ...pops], { autoAlpha: 0 });

      // Texto (h3 + p) de la 1ª card, para revelarlo junto con su pop.
      const firstCardEls = firstCard
        ? gsap.utils.toArray<HTMLElement>(firstCard.querySelectorAll("h3, p"))
        : [];

      let splits: SplitText[] = [];
      let cardSplits: SplitText[] = [];
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        splits = texts.map(
          (el) => new SplitText(el, { type: "words", mask: "words" }),
        );
        cardSplits = firstCardEls.map(
          (el) => new SplitText(el, { type: "words", mask: "words" }),
        );
        // Contenedores visibles; las palabras siguen ocultas por la máscara.
        gsap.set(texts, { autoAlpha: 1 });

        if (reduce) {
          gsap.set(pops, { autoAlpha: 1 });
          [...splits, ...cardSplits].forEach((s) => s.revert());
          return;
        }

        gsap.set(pops, { autoAlpha: 1 });
        const allWords = splits.flatMap((s) => s.words);
        const cardWords = cardSplits.flatMap((s) => s.words);

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: content,
            start: "top 60%",
            // Solo revierte al salir por arriba (leaveBack); NO al scrollear
            // hacia abajo por el pin (si no, se revertía a media sección).
            toggleActions: "play none none reverse",
          },
        });

        if (badge) {
          tl.from(badge, {
            scale: 0,
            rotate: -35,
            autoAlpha: 0,
            transformOrigin: "center",
            duration: ENTRANCE.icon.duration,
            ease: ENTRANCE.icon.ease,
          });
        }

        tl.from(
          allWords,
          { yPercent: 100, duration: 0.9, stagger: 0.012, ease: "power3.out" },
          badge ? "-=0.4" : 0,
        );

        if (firstCard) {
          tl.from(
            firstCard,
            {
              scale: 0.6,
              autoAlpha: 0,
              xPercent: 12,
              yPercent: 24,
              transformOrigin: "right bottom",
              duration: 0.8,
              ease: "back.out(1.4)",
            },
            "-=0.7",
          );
          if (cardWords.length) {
            tl.from(
              cardWords,
              {
                yPercent: 100,
                duration: 0.7,
                stagger: 0.04,
                ease: "power3.out",
              },
              "-=0.45",
            );
          }
        }
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        [...splits, ...cardSplits].forEach((s) => s.revert());
      };
    },
    { scope: contentRef },
  );

  // Palabra de fondo con loop del mask-reveal: los caracteres entran desde abajo,
  // se mantienen, y salen hacia arriba; en bucle infinito.
  useGSAP(
    () => {
      const el = brandRef.current;
      if (!el) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      let split: SplitText | null = null;
      const run = () => {
        split = new SplitText(el, { type: "chars", mask: "chars" });
        gsap.set(split.chars, { yPercent: 100 });
        gsap
          .timeline({ repeat: -1, repeatDelay: 0.4 })
          // Entrada: suben al lugar.
          .to(split.chars, {
            yPercent: 0,
            duration: 0.7,
            stagger: 0.035,
            ease: "power3.out",
          })
          // Se mantiene, luego salida hacia arriba.
          .to(
            split.chars,
            {
              yPercent: -100,
              duration: 0.7,
              stagger: 0.035,
              ease: "power3.in",
            },
            "+=1.4",
          )
          // Reset abajo para el siguiente ciclo (corte invisible).
          .set(split.chars, { yPercent: 100 });
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => split?.revert();
    },
    { scope: brandRef },
  );

  return (
    <section
      className="relative bg-[#131313] text-white"
      aria-label="Services"
    >
      {/* Track alto: define cuánto scroll dura el efecto (y cuánto se queda
          pineado). Más alto = el pin dura más / cada card tiene más scroll. */}
      <div ref={trackRef} className="relative h-[340vh]">
        {/* Viewport fijo (sticky). top negativo = engancha MÁS TARDE (la sección
            se corre un poco hacia arriba antes de fijarse, sin hueco). El alto
            = 100vh + ese offset, para que siga cubriendo toda la pantalla aunque
            esté desplazado (si no, queda una franja destapada abajo).
            Para pinear aún más tarde, sube el offset en AMBOS (top y el +Xpx). */}
        <div className="sticky top-[-85px] flex h-[calc(100vh+85px)] flex-col overflow-hidden">
          {/* Ruido local: sobre el fondo negro, con blend que aclara. */}
          <NoiseBackground
            className="absolute inset-0 h-full w-full mix-blend-screen"
            opacity={0.05}
          />

          {/* divisor: respeta el ancho del contenedor */}
          <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pt-6 sm:px-6 lg:px-8">
            <div className="border-t border-white/10" />
          </div>

          {/* Contenido de fondo: llena el alto y reparte las tres bandas. */}
          <div
            ref={contentRef}
            className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-between gap-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
          >
            {/* --- Banda superior: intro (check + label) + título arriba-izq --- */}
            <div>
              <div className="mb-10 flex items-start gap-3">
                <IconBadge
                  icon={Check}
                  size="sm"
                  variant="brand"
                  className="mt-0.5 text-white"
                />
                <p
                  data-reveal
                  className="font-neue text-lg tracking-wide text-white"
                >
                  {servicesIntro.label}
                </p>
              </div>

              <div className="relative">
                <h2
                  data-reveal
                  className="relative z-10 font-neue-bold text-title leading-[1.02] tracking-tight"
                >
                  What we make,
                  <br />
                  <span className="font-baskerville text-[0.92em] italic">
                    made clear
                  </span>
                </h2>

                {/* Palabra de fondo con loop de entrada/salida (mask-reveal) */}
                <span
                  ref={brandRef}
                  aria-hidden
                  className="pointer-events-none absolute top-2 right-0 select-none font-baskerville text-[4rem] leading-none tracking-tighter text-white/10 italic sm:text-[6rem] lg:text-[8rem]"
                >
                  {servicesIntro.brandWord}
                </span>
              </div>
            </div>

            {/* --- Banda media: subtítulo (izq) + párrafos escalonados (der) --- */}
            <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
              <p data-reveal className="ml-10 font-neue text-base text-white">
                {servicesIntro.subtext}
              </p>

              <div className="w-full max-w-[24rem] md:mr-[29%]">
                <p
                  data-reveal
                  className="max-w-[16rem] font-neue text-base leading-relaxed text-white/50"
                >
                  {servicesIntro.overview1}
                </p>
                <p
                  data-reveal
                  className="mt-4 ml-auto max-w-[16rem] font-neue text-base leading-relaxed text-white/50"
                >
                  {servicesIntro.overview2}
                </p>
              </div>
            </div>

            {/* --- Banda inferior: textos escalonados (izq) + 2º título (der) --- */}
            <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
              <div className="w-full max-w-[24rem]">
                <p
                  data-reveal
                  className="max-w-[16rem] font-neue text-base leading-relaxed text-white/50"
                >
                  <span className="text-white">Explore</span> each discipline.
                  See the craft behind every{" "}
                  <span className="text-white">service</span>.
                </p>
                <p
                  data-reveal
                  className="mt-4 ml-auto max-w-[16rem] font-neue text-base leading-relaxed text-white/50"
                >
                  <span className="text-white">Touch</span> the thinking that
                  shapes the work. Find where your{" "}
                  <span className="text-white">idea</span> fits.
                </p>
              </div>

              <h2
                data-reveal
                className="text-right font-neue-bold text-title leading-[1.02] tracking-tight"
              >
                Capability shaped
                <br />
                <span className="font-baskerville text-[0.92em] italic">
                  into services
                </span>
              </h2>
            </div>
          </div>

          {/* Stack de cards que pasan hacia arriba. inset-0 = alto del viewport
              sticky (100vh), así se centran respecto a la pantalla. */}
          <div
            ref={cardsRef}
            className="pointer-events-none absolute inset-0 z-20"
          >
            {serviceCards.map((card, i) => (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
              >
                <ServiceCard {...card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
