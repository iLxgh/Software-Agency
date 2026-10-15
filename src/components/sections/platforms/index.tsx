"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { NoiseBackground } from "@/components/ui/noise-background";
import { Quadrant } from "./quadrant";
import { platforms, platformsIntro } from "./slides";
import { ENTRANCE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * Reparto de las fracciones del grid al hacer hover: la celda activa se lleva
 * GROW y la contraria SHRINK, en los dos ejes. Suman 2, así que la cuadrícula
 * conserva su tamaño total y solo cambia el reparto interno.
 *
 * Lo que de verdad se mueve al cambiar el reparto no es el texto —que es
 * `shrink-0`— sino el pie, y con él la pieza de producto: la celda señalada
 * enseña su documento más grande y las otras tres lo encogen.
 *
 * Por eso este número es sensible. Lo que cuenta es la DISTANCIA a 1: en 1.08
 * el gesto no se notaba y en 1.2 era exagerado. 1.12 es el punto al que se
 * llegó bajando desde ahí.
 *
 * La curva importa tanto como el número, y el punto bueno está entre dos
 * defectos. Lo que más se nota al moverse no son las cards sino la CRUZ de las
 * divisorias: con una curva de salida pura —rápida al principio y cola larga—
 * arrancaba de golpe; con una ease-in-out marcada arrancaba perezosa.
 * `cubic-bezier(0.4,0,0.2,1)` entra deprisa sin saltar y frena largo, que es lo
 * que se siente como responder al cursor.
 *
 * La duración y la curva están repetidas en `quadrant.tsx`, para el recuadro
 * del logo y para la pieza de producto: las tres cosas tienen que moverse como
 * una sola. Si se cambian aquí, hay que cambiarlas allí.
 */
const GROW = 1.12;
const SHRINK = 2 - GROW;

export function Platforms() {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Índice del cuadrante con el cursor encima; null = reparto neutro.
  const [hovered, setHovered] = useState<number | null>(null);

  // Cuadrantes en orden ↖ ↗ ↙ ↘: la columna la da la paridad del índice y la
  // fila, si está en la mitad de arriba.
  const track = (isFirst: boolean) =>
    `${isFirst ? GROW : SHRINK}fr ${isFirst ? SHRINK : GROW}fr`;

  const cols = hovered === null ? "1fr 1fr" : track(hovered % 2 === 0);
  const rows = hovered === null ? "1fr 1fr" : track(hovered < 2);

  // Entrada de la cabecera: pop del check + mask-reveal de label y título.
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const texts = gsap.utils.toArray<HTMLElement>(
        header.querySelectorAll("[data-reveal]"),
      );
      const badge = header.querySelector("svg")?.parentElement ?? null;

      gsap.set([...texts, ...(badge ? [badge] : [])], { autoAlpha: 0 });

      let splits: SplitText[] = [];
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        splits = texts.map(
          (el) => new SplitText(el, { type: "words", mask: "words" }),
        );

        // Aire para las descendentes: el mask es overflow-hidden y si no, las
        // corta. Se compensa con margin negativo para no mover el layout.
        splits.forEach((s) =>
          s.words.forEach((w) => {
            const unit = w as HTMLElement;
            unit.style.paddingBottom = "6px";
            const mask = unit.parentElement;
            if (mask) mask.style.marginBottom = "-6px";
          }),
        );

        gsap.set(texts, { autoAlpha: 1 });

        if (reduce) {
          if (badge) gsap.set(badge, { autoAlpha: 1 });
          splits.forEach((s) => s.revert());
          return;
        }

        if (badge) gsap.set(badge, { autoAlpha: 1 });
        const allWords = splits.flatMap((s) => s.words);

        tl = gsap.timeline({
          scrollTrigger: { trigger: header, start: "top 75%" },
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
          { yPercent: 100, duration: 0.9, stagger: 0.02, ease: "power3.out" },
          badge ? "-=0.4" : 0,
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
    { scope: headerRef },
  );

  // Entrada de los cuadrantes, escalonada.
  useGSAP(
    () => {
      const grid = gridRef.current;
      if (!grid) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      const cells = gsap.utils.toArray<HTMLElement>(grid.children);

      const tween = gsap.from(cells, {
        y: 30,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: grid, start: "top 80%" },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: gridRef },
  );

  return (
    <section
      id="platforms"
      // Fondo opaco propio (con su ruido local) porque tapa el fondo global.
      //
      // z-10 NO es decorativo: el footer es `sticky bottom-0 z-0` y se ancla al
      // fondo del viewport en cuanto su wrapper entra en pantalla, o sea justo
      // en el límite con esta sección. Con `z-index: auto` esta sección se
      // pinta en la misma fase que el footer, y al ir el footer después en el
      // DOM ganaba él: asomaba como una banda oscura sobre el borde inferior de
      // Platforms. Con z-10 pasa a la fase siguiente y queda siempre por encima.
      className="relative z-10 border-t border-foreground/20 bg-background text-foreground"
      style={{ overflowX: "clip" }}
      aria-label="Plataformas Bloxtek"
    >
      {/* Ruido local: restaura la textura que daba el ruido global (ahora
          tapado por el fondo opaco). */}
      <NoiseBackground
        className="absolute inset-0 h-full w-full mix-blend-multiply"
        opacity={0.08}
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* --- Cabecera --- */}
        <div ref={headerRef} className="mb-20">
          {/* Fila fina: etiqueta a la izquierda y recuento a la derecha, que
              antes estaba vacía. El recuento no es adorno: dice cuántas cosas
              hay que mirar antes de que empiece la cuadrícula. */}
          <div className="mb-16 flex items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <IconBadge icon={Check} size="sm" variant="brand" />
              <span data-reveal className="font-neue text-base text-foreground">
                {platformsIntro.label}
              </span>
            </div>

            <span
              data-reveal
              className="font-neue text-[11px] font-bold tracking-[0.18em] text-foreground/40 uppercase"
            >
              {platformsIntro.count}
            </span>
          </div>

          <h2
            data-reveal
            className="mx-auto max-w-3xl text-center font-neue-bold text-title leading-[1.02] tracking-tight text-balance"
          >
            <span className="font-baskerville text-[0.92em] italic">
              Plataformas
            </span>{" "}
            que ya operan, no prototipos
          </h2>

          <p
            data-reveal
            className="mx-auto mt-6 max-w-lg text-center font-neue text-base leading-relaxed text-foreground/55 text-pretty"
          >
            {platformsIntro.subtitle}
          </p>
        </div>

        {/* --- Cuadrícula 2x2 ---
            gap-px sobre un fondo teñido dibuja las divisorias entre cuadrantes
            sin tener que calcular qué borde lleva cada celda.

            El hover se anima con las FRACCIONES del grid, no con un scale de la
            card: al repartir el ancho y el alto entre las dos columnas y las
            dos filas, la celda activa crece y las otras encogen en el mismo
            gesto, sin deformar el texto ni salirse del contenedor.

            Las medidas van por variables CSS para que el layout de móvil (una
            sola columna) no herede el reparto: los `md:` solo se aplican a
            partir de ese breakpoint, mientras que un style inline ganaría
            siempre.

            El alto fijo es imprescindible, no decorativo: con alto indefinido
            las unidades `fr` no reparten espacio, se dimensionan por contenido,
            y el alto TOTAL de la cuadrícula cambiaba en cada hover. Con alto
            fijo, las fracciones solo redistribuyen el espacio que ya hay.

            De aquí sale el tamaño de la pieza de producto: el pie de cada
            cuadrante es lo que queda tras el texto, la pieza va con
            `object-contain` y por tanto limitada por ese alto. Subir este
            número es la ÚNICA forma de agrandarla sin recortarla ni meterla
            encima del texto. Ha ido de 44rem a 50rem y de ahí a 57rem. */}
        <div
          ref={gridRef}
          onMouseLeave={() => setHovered(null)}
          style={{ "--cols": cols, "--rows": rows } as React.CSSProperties}
          className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-foreground/15 shadow-[0_10px_50px_rgba(0,0,0,0.10)] md:h-[57rem] md:grid-cols-[var(--cols)] md:grid-rows-[var(--rows)] md:transition-[grid-template-columns,grid-template-rows] md:duration-[500ms] md:ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
        >
          {platforms.map((platform, i) => (
            <Quadrant
              key={platform.name}
              {...platform}
              // null = nadie señalado, así que todos vuelven a su tamaño
              // neutro. El cuadrante no puede deducirlo solo con `:hover`:
              // necesita saber que OTRO está señalado para encogerse.
              active={hovered === null ? null : hovered === i}
              onMouseEnter={() => setHovered(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
