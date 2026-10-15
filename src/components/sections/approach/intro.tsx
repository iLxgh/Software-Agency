"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowUpRight, Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { scrollToSection } from "@/lib/scroll-to";
import { useMagnetic } from "@/lib/use-magnetic";
import { useArrowHover } from "@/lib/use-arrow-hover";
import { useCoverBlur } from "@/lib/use-cover-blur";
import { approachCards } from "./slides";
import { ENTRANCE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);


/**
 * Título de la sección de formas de trabajo. Se queda fijo (sticky) y las
 * tarjetas de `ApproachCards` suben por encima tapándolo — por eso ambas tienen
 * que ser hermanas adyacentes en el DOM.
 */
export function ApproachIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const indexRef = useRef<HTMLUListElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  // Los mismos dos hooks que el "Conocer las cuatro soluciones" del hero: el
  // pill se pega al cursor y la flecha sale por donde apunta y vuelve desde el
  // lado opuesto. Se reutilizan en vez de replicarlos para que las dos CTA de
  // la página se sientan igual.
  useMagnetic(ctaRef);
  useArrowHover(ctaRef, { direction: "up-right" });

  useGSAP(
    () => {
      const headline = headlineRef.current;
      const lead = leadRef.current;
      const cta = ctaRef.current;
      const label = labelRef.current;
      const header = headerRef.current;
      if (!headline || !label || !header) return;
      const badge = header.querySelector<HTMLSpanElement>("span");
      const indexItems = gsap.utils.toArray<HTMLLIElement>(
        indexRef.current?.children ?? [],
      );

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Oculta antes del primer paint (solo con JS) para evitar el flash.
      gsap.set([headline, label, badge, lead, cta, ...indexItems], {
        autoAlpha: 0,
      });

      let split: SplitText | null = null;
      let labelSplit: SplitText | null = null;
      let tl: gsap.core.Timeline | null = null;
      const run = () => {
        if (!headlineRef.current) return;
        split = new SplitText(headline, { type: "words", mask: "words" });
        labelSplit = new SplitText(label, { type: "words", mask: "words" });

        // La Baskerville itálica tiene descendentes que la máscara recorta:
        // se le da aire abajo y se compensa con margin negativo.
        split.words.forEach((w) => {
          const unit = w as HTMLElement;
          unit.style.paddingBottom = "14px";
          const mask = unit.parentElement;
          if (mask) mask.style.marginBottom = "-14px";
        });

        gsap.set([headline, label, badge, lead, cta, ...indexItems], {
          autoAlpha: 1,
        });
        if (reduce) {
          split.revert();
          labelSplit.revert();
          return;
        }

        // Un único timeline para los tres: la palomita, su etiqueta y el
        // titular entran encadenados, no cada uno con su propio trigger.
        tl = gsap.timeline({
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        });

        tl.from(badge, {
          scale: 0,
          rotate: -35,
          autoAlpha: 0,
          transformOrigin: "center",
          duration: ENTRANCE.icon.duration,
          ease: ENTRANCE.icon.ease,
        })
          .from(
            labelSplit.words,
            { yPercent: 100, duration: 0.9, stagger: 0.05, ease: "power3.out" },
            "-=0.4",
          )
          .from(
            split.words,
            { yPercent: 100, duration: 0.9, stagger: 0.05, ease: "power3.out" },
            "-=0.6",
          )
          // Bajada y CTA entran juntas, con el titular ya puesto.
          .from(
            [lead, cta],
            {
              autoAlpha: 0,
              y: 16,
              duration: 0.7,
              stagger: 0.1,
              ease: "power3.out",
            },
            "-=0.45",
          )
          // El índice cierra la entrada: aparece cuando el titular ya se lee.
          .from(
            indexItems,
            {
              autoAlpha: 0,
              y: 12,
              duration: 0.6,
              stagger: 0.07,
              ease: "power3.out",
            },
            "-=0.5",
          );
      };

      // Espera a las fuentes para que el split mida sobre el layout final.
      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        split?.revert();
        labelSplit?.revert();
      };
    },
    { scope: sectionRef },
  );

  // Se difumina conforme las tarjetas la van cubriendo. El tramo arranca antes
  // (85% del viewport en vez del 75% por defecto) y con una curva más suave
  // (power1 = cuadrática, en vez de cúbica), que es lo que adelanta de verdad
  // el momento en que el blur se empieza a notar.
  useCoverBlur(sectionRef, { start: "top 105%", ease: "power1.in" });

  return (
    <section
      ref={sectionRef}
      // sticky con top negativo: se fija 60px "más tarde" para dejar ver la
      // parte baja antes de congelarse. Sin bg propio, para que se vea el ruido
      // global de la página.
      className="sticky top-[-30px] z-0 text-foreground"
      style={{ overflowX: "clip" }}
      aria-label="Cuatro formas de trabajar contigo"
    >
      {/* divisor: respeta el ancho del contenedor */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-foreground/20" />
      </div>

      {/* Padding simétrico y `justify-center`: el contenido —fila superior y
          bloque del titular— se centra COMO GRUPO entre el divisor y el final
          del sticky, que es donde acaba esta sección.

          Antes el grupo iba anclado arriba (pt-* grande, pb-0) y solo el
          titular se centraba en el sobrante. El hueco de abajo que se ve en la
          página no sale de aquí: lo pone el mt de ApproachCards, y es la pista
          por la que suben las tarjetas. */}
      <div className="mx-auto flex max-w-[1400px] min-h-[500px] flex-col justify-center gap-14 px-4 py-16 sm:px-6 lg:gap-20 lg:px-8 lg:py-20">
        {/* Fila superior: la etiqueta a la izquierda y el índice de las cuatro
            áreas a la derecha.

            Va ARRIBA y no debajo del titular a propósito: el hueco de debajo
            es la pista por la que suben las tarjetas, así que estando vacío
            cumple una función. La palomita vive aquí y no sobre las tarjetas
            porque es esta sección la que presenta el bloque — mismo patrón que
            Platforms.

            El índice no es adorno: son los cuatro `area` de las propias
            tarjetas, numerados igual que el número gigante que cada una lleva
            al fondo. Así la fila presenta lo que viene en vez de solo rellenar,
            y no hay copy nuevo que validar. */}
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
          {/* headerRef envuelve SOLO la etiqueta: la entrada busca la palomita
              con un querySelector de span, y el índice de al lado la
              desplazaría del primer puesto. */}
          <div ref={headerRef} className="flex items-center gap-3">
            <IconBadge icon={Check} size="sm" variant="brand" />
            <p ref={labelRef} className="font-neue text-lg tracking-wide">
              Cómo trabajamos en cada proyecto.
            </p>
          </div>

          <ul
            ref={indexRef}
            className="flex flex-wrap items-baseline gap-x-6 gap-y-2"
          >
            {approachCards.map((card, i) => (
              <li key={card.area} className="flex items-baseline gap-1.5">
                <span className="font-neue-bold text-[11px] text-brand tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-neue text-sm tracking-wide text-foreground/60">
                  {card.area}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Titular, bajada y CTA: un solo bloque, para que el `gap` del padre
            los trate como una unidad al centrar. */}
        <div className="flex items-center justify-center">
          <div className="mx-auto max-w-5xl text-center">
            <h2
              ref={headlineRef}
              className="font-neue-bold text-4xl leading-[1.02] tracking-tight text-balance sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Cuatro formas de trabajar contigo. Una sola forma de pensar:{" "}
              <span className="font-baskerville text-[0.92em] font-normal tracking-normal italic">
                primero entender, después construir.
              </span>
            </h2>

            {/* PENDIENTE: bajada redactada aquí. No afirma nada que el titular
                no diga ya; solo lo aterriza y anuncia las tarjetas. Validar. */}
            <p
              ref={leadRef}
              className="mx-auto mt-8 max-w-xl font-neue text-base leading-relaxed text-foreground/60 text-pretty sm:text-lg"
            >
              Cada proyecto empieza con un diagnóstico de tu operación. De ahí
              sale por cuál de estas cuatro formas conviene entrar.
            </p>

            {/* Mismo patrón de pill que la CTA de Distributors.
                `href` real para que el enlace funcione con clic central y sin
                JS; el onClick solo lo cambia por el scroll suave de Lenis, que
                es lo que hace el resto de la web. */}
            <a
              ref={ctaRef}
              href="#contacto"
              data-sound
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#contacto");
              }}
              // Sin hover de scale en CSS: lo gobierna useMagnetic por JS, y
              // dos sistemas sobre la misma propiedad se pisan.
              // En hover se invierte: fondo blanco y letras negras. El borde
              // va siempre puesto y solo cambia de color, para que la
              // geometría no salte — y hace falta porque el blanco del hover
              // es el MISMO blanco del fondo de la página, así que sin él el
              // pill se disolvería y quedaría solo el texto flotando.
              // El `before` es un halo invisible que asoma 20px por arriba y
              // por abajo: amplía SOLO la zona que dispara el imán, que en un
              // pill de ~44px de alto quedaba muy estrecha (a lo ancho ya
              // sobraba). El truco funciona porque un pseudo-elemento sí
              // recibe eventos y los entrega al elemento que lo origina.
              //
              // Y no descoloca el imán: `useMagnetic` mide con
              // getBoundingClientRect, que ignora los pseudo-elementos, así
              // que el centro y la fuerza siguen calculándose sobre el pill
              // real. Lo único que crece es el gatillo.
              className="group relative mt-10 inline-flex items-center gap-3 rounded-2xl border border-transparent bg-foreground py-2 pr-2 pl-6 text-background transition-colors duration-300 before:absolute before:inset-x-0 before:-inset-y-5 before:content-[''] hover:border-foreground/15 hover:bg-background hover:text-foreground motion-reduce:transition-none"
            >
              <span className="font-neue text-small">Cuéntanos tu caso</span>
              {/* La flecha pasa de blanca a negra sobre el verde del badge. En
                  negro contrasta mejor que en blanco (~8:1 frente a ~1,9:1),
                  así que el hover además la hace más legible, no solo distinta. */}
              <IconBadge
                icon={ArrowUpRight}
                size="md"
                className="transition-colors duration-300 group-hover:text-foreground"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
