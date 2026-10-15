"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Check, Pause } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { FollowCursor } from "@/components/ui/follow-cursor";
import { cx } from "@/components/ui/icon-glyph-styles";
import { platforms } from "@/components/sections/platforms/slides";
import { useCasesByPlatform, type UseCase } from "./slides";

gsap.registerPlugin(useGSAP);

/** Píxeles por segundo de las columnas. Lento: es fondo, no texto a devorar. */
const SPEED = 26;
/**
 * Separación entre tarjetas, como PADDING de un envoltorio.
 *
 * No vale `gap` del contenedor: diez tarjetas dejan nueve huecos, y el 50% del
 * track cae medio hueco antes de donde empieza la copia.
 *
 * Tampoco vale `margin-bottom` en la tarjeta: el margen del último hijo se
 * colapsa con el del padre, así que el alto del track vuelve a quedarse corto
 * un hueco entero. Mismo salto, otra causa.
 *
 * El padding no colapsa ni se descuenta: diez envoltorios idénticos, y el 50%
 * cae clavado.
 */
const GAP = "pb-4";

const EASE_OUT = "ease-[cubic-bezier(0.16,1,0.3,1)]";

/** Desvanecido de las columnas por arriba y por abajo. */
const MASK =
  "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)";

/**
 * Una columna con bucle vertical infinito.
 *
 * Mismo truco que la cinta de Distribuidores pero en el eje Y: el contenido va
 * DUPLICADO y el tween recorre el 50% del track, así que al reiniciar el frame
 * es idéntico.
 *
 * OJO con la separación: tiene que ir como `margin-bottom` de cada tarjeta, NO
 * como `gap` del contenedor. Con `gap`, diez tarjetas dejan nueve huecos, así
 * que el 50% del track cae medio hueco antes de donde empieza la copia — y cada
 * vuelta daba un salto de 8px. Es el tropezón que se veía cada 30 segundos.
 *
 * `offset` desfasa el arranque (0..1): las dos columnas llevan los mismos casos,
 * y sin desfase se verían clonadas.
 */
function MarqueeColumn({
  cases,
  direction,
  offset = 0,
}: {
  cases: UseCase[];
  direction: "up" | "down";
  offset?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      const run = () => {
        if (!trackRef.current) return;
        const half = track.scrollHeight / 2;
        if (!half) return;

        const vars = { ease: "none", duration: half / SPEED, repeat: -1 };
        tweenRef.current =
          direction === "up"
            ? gsap.to(track, { yPercent: -50, ...vars })
            : gsap.fromTo(track, { yPercent: -50 }, { yPercent: 0, ...vars });

        tweenRef.current.progress(offset);
      };

      // Espera a las fuentes: medir el alto antes de que carguen da una
      // velocidad equivocada.
      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tweenRef.current?.kill();
        tweenRef.current = null;
      };
    },
    // Solo al montar: si se reiniciara al cambiar de plataforma, el bucle
    // pegaría un salto a mitad de recorrido.
    { scope: wrapRef },
  );

  return (
    <div
      ref={wrapRef}
      // La columna se detiene con el cursor encima, para poder leer una ficha
      // sin perseguirla.
      onMouseEnter={() => tweenRef.current?.pause()}
      onMouseLeave={() => tweenRef.current?.play()}
    >
      <div ref={trackRef} className="will-change-transform">
        {[0, 1].map((copy) =>
          cases.map((uc, i) => (
            // La separación va como PADDING de un envoltorio, no como margin ni
            // como gap. Ver la nota del componente: cualquiera de las otras dos
            // deja medio hueco fuera de la cuenta y el bucle da un salto.
            <div key={`${copy}-${uc.perfil}`} className={GAP}>
              <UseCaseCard
                useCase={uc}
                index={i}
                total={cases.length}
                // La segunda copia solo cierra el bucle: fuera del árbol de
                // accesibilidad para no leer todo dos veces.
                duplicate={copy === 1}
              />
            </div>
          )),
        )}
      </div>
    </div>
  );
}

/**
 * Ficha de caso de uso. El alto varía con el índice para que las columnas no
 * parezcan una rejilla regular.
 */
function UseCaseCard({
  useCase,
  index,
  total,
  duplicate,
}: {
  useCase: UseCase;
  index: number;
  total: number;
  duplicate: boolean;
}) {
  // Tres tamaños rotando: da ritmo sin tener que marcarlo en los datos.
  const tall = index % 3 === 1;
  const short = index % 3 === 2;

  return (
    <article
      data-card
      aria-hidden={duplicate || undefined}
      className={cx(
        "group relative rounded-2xl bg-background shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:z-10",
        tall ? "p-6" : short ? "p-4" : "p-5",
        // Hover: se levanta un poco y se tiñe de marca, para marcar cuál estás
        // leyendo mientras la columna está detenida.
        "transition-[scale,background-color,box-shadow] duration-400",
        EASE_OUT,
        "hover:scale-[1.04] hover:bg-brand/10 hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)]",
        "motion-reduce:transition-none motion-reduce:hover:scale-100",
      )}
    >
      {/* Cabecera: contador a la izquierda y perfil destacado. El número evita
          que el lector tenga que recordar por cuál iba. */}
      <div className="flex items-center gap-2.5">
        <span className="rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-bold text-brand-foreground tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[10px] font-bold text-foreground/30 tabular-nums">
          / {String(total).padStart(2, "0")}
        </span>
      </div>

      <h3
        className={cx(
          "mt-3 font-neue-bold leading-tight tracking-tight text-balance text-foreground",
          tall ? "text-xl" : "text-lg",
        )}
      >
        {useCase.perfil}
      </h3>

      <p
        className={cx(
          "mt-2 font-neue leading-snug text-pretty text-foreground/60",
          tall ? "text-base" : "text-sm",
        )}
      >
        {useCase.caso}
      </p>
    </article>
  );
}

export function UseCases() {
  const [active, setActive] = useState(0);
  // Lo que se está pintando. Va por detrás de `active`: primero se desvanece lo
  // viejo, y solo entonces se cambia el contenido.
  const [shown, setShown] = useState(0);

  const gridRef = useRef<HTMLDivElement>(null);

  const current = platforms[shown];
  const cases = useCasesByPlatform[current.name] ?? [];

  const cards = () =>
    gsap.utils.toArray<HTMLElement>(
      gridRef.current?.querySelectorAll("[data-card]") ?? [],
    );

  const select = (i: number) => {
    if (i === active) return;
    setActive(i);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setShown(i);
      return;
    }

    gsap.to(cards(), {
      autoAlpha: 0,
      duration: 0.25,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => setShown(i),
    });
  };

  // Entrada del contenido nuevo. Se dispara al cambiar `shown`, que es justo
  // cuando React ya pintó los textos de la plataforma recién elegida.
  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      gsap.fromTo(
        cards(),
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.5,
          stagger: 0.03,
          ease: "power3.out",
          overwrite: true,
        },
      );
    },
    { dependencies: [shown], scope: gridRef },
  );

  return (
    <section
      aria-label="Casos de uso por plataforma"
      className="border-t border-foreground/15 py-16 lg:py-0"
    >
      <div className="flex flex-col gap-12 lg:h-screen lg:flex-row lg:items-center lg:gap-20">
        {/* --- Izquierda: etiqueta, titular y selector ---
            Todo va en versión compacta: con el badge añadido, el bloque entero
            tiene que caber en 100vh junto a las columnas. El titular baja de
            `text-title`, la bajada es de un renglón, y los botones enseñan solo
            el nombre — la descripción de cada plataforma ya vive en la
            cuadrícula de la home y los casos están justo al lado. */}
        <div className="lg:w-[42%] lg:shrink-0">
          <div className="mb-8 flex items-center gap-3">
            <IconBadge icon={Check} size="sm" variant="brand" />
            <span className="font-neue text-base">
              Casos de uso por plataforma
            </span>
          </div>

          <h2 className="font-neue-bold text-3xl leading-[1.05] tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Qué resuelve cada plataforma,{" "}
            <span className="font-baskerville text-[0.92em] italic">
              y para quién.
            </span>
          </h2>

          <p className="mt-5 max-w-md font-neue text-base leading-relaxed text-pretty text-foreground/60">
            Las mismas cuatro, usos distintos según quién las use.
          </p>

          <div
            role="tablist"
            aria-label="Plataformas"
            className="mt-8 flex flex-col gap-2"
          >
            {platforms.map((platform, i) => {
              const selected = i === active;
              return (
                <button
                  key={platform.name}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => select(i)}
                  className={cx(
                    "group relative cursor-pointer overflow-hidden rounded-xl border py-3 pr-3 pl-5 text-left",
                    "transition-[colors,translate] duration-500",
                    EASE_OUT,
                    selected
                      ? "border-transparent bg-foreground text-background"
                      : "border-foreground/10 bg-foreground/[0.03] hover:translate-x-1 hover:border-brand",
                  )}
                >
                  {/* Barra de marca: fija en la activa, y crece desde arriba al
                      pasar el cursor por las demás. */}
                  <span
                    aria-hidden
                    className={cx(
                      "absolute inset-y-0 left-0 w-1 origin-top bg-brand",
                      "transition-transform duration-500",
                      EASE_OUT,
                      selected
                        ? "scale-y-100"
                        : "scale-y-0 group-hover:scale-y-100",
                    )}
                  />

                  <span className="flex items-center justify-between gap-4">
                    <span className="font-neue-bold text-lg tracking-tight">
                      {platform.name}
                    </span>
                    <span
                      className={cx(
                        "grid size-7 shrink-0 place-items-center rounded-lg transition-all duration-500",
                        EASE_OUT,
                        selected
                          ? "bg-brand text-brand-foreground opacity-100"
                          : "bg-brand/0 text-brand opacity-0 group-hover:bg-brand/15 group-hover:opacity-100",
                      )}
                    >
                      <ArrowUpRight
                        aria-hidden
                        className="size-4"
                        strokeWidth={2.5}
                      />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- Derecha: dos columnas en bucle, en sentidos opuestos ---
            La máscara desvanece arriba y abajo para que las tarjetas no
            aparezcan y desaparezcan con un corte seco.

            El envoltorio de FollowCursor es el que oculta el cursor nativo y
            saca el de pausa, así que la zona activa es toda la parrilla. */}
        <FollowCursor
          className="relative flex-1 lg:h-full"
          content={
            <div
              ref={gridRef}
              // El recorte lateral lo causaba la MÁSCARA, no el overflow: su
              // `mask-clip` es `border-box`, así que lo que se pinte fuera de
              // la caja queda con alfa 0 — y la sombra y el scale del hover se
              // salen de ella.
              //
              // La solución es ensanchar la caja con padding y devolverla a su
              // sitio con el margen negativo: la máscara cubre también ese
              // carril y las fichas tienen por dónde crecer. El degradado es
              // vertical, así que ensanchar no le afecta.
              className="relative h-[60vh] lg:-mx-6 lg:h-full lg:px-6 lg:py-16"
              style={{
                maskImage: MASK,
                maskRepeat: "no-repeat",
                maskSize: "100% 100%",
                WebkitMaskImage: MASK,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskSize: "100% 100%",
              }}
            >
              <div className="grid h-full grid-cols-2 gap-4">
                <MarqueeColumn cases={cases} direction="down" />
                <MarqueeColumn cases={cases} direction="up" offset={0.5} />
              </div>
            </div>
          }
        >
          <Pause className="size-4" strokeWidth={0} fill="currentColor" />
        </FollowCursor>
      </div>
    </section>
  );
}
