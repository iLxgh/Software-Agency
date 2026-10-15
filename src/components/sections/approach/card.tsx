import { Check } from "lucide-react";
import {
  cx,
  iconGlyphIconSizeClasses,
  iconGlyphSizeClasses,
  iconGlyphVariantClasses,
} from "@/components/ui/icon-glyph-styles";
import type { ApproachCard } from "./slides";

const EASE_OUT = "ease-[cubic-bezier(0.16,1,0.3,1)]";

export type CardTone = "light" | "green";

/**
 * Una carta. Sin imagen: el peso lo lleva la tipografía, que es lo que permite
 * prescindir de media de archivo.
 *
 * Dos tonos alternados —hueso y verde de marca— sobre la sección oscura, cada
 * uno con su texto invertido. Ojo: blanco sobre el verde de marca da ~1,9:1 de
 * contraste, por debajo de AA. Si hace falta arreglarlo, el cambio va en el
 * verde de estas tarjetas (uno más oscuro), no en el texto.
 */
export function Card({
  area,
  title,
  description,
  bold,
  deliverable,
  tone,
  index,
  className,
}: ApproachCard & { tone: CardTone; index: number; className?: string }) {
  const green = tone === "green";

  return (
    <article
      className={cx(
        "group relative flex w-[22rem] shrink-0 cursor-grab flex-col justify-between overflow-hidden rounded-2xl p-7",
        // select-none no es solo estético: al arrastrar sobre texto, el
        // navegador lo selecciona y el gesto se convierte en una selección.
        "select-none",
        // El color del texto lo marca el tono de la carta.
        green ? "text-background" : "text-foreground",
        // El alto lo decide el contenedor: varía por carta para que lo que se
        // cruce al solaparse sean esquinas y no el texto.
        className,
        green ? "bg-brand" : "bg-card",
        "shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
        // Solo se levanta. Enderezarla al pasar por encima no es opción: la
        // inclinación la gobierna el envoltorio, que la mece según la inercia
        // del desfile, y tocarla desde aquí sería pelearse con ese mecanismo.
        "transition-[translate,box-shadow] duration-500",
        EASE_OUT,
        "hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]",
        "motion-reduce:transition-none",
      )}
    >
      {/* Numeración gigante de fondo. Se eligió el número y no unas comillas
          porque esto no es una cita: son cuatro formas de trabajo, y el número
          además lo dice. Invertido respecto al fondo de cada carta. */}
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute -top-6 -right-3 font-neue-bold text-[9rem] leading-none tracking-tighter select-none",
          green ? "text-background/25" : "text-brand/25",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className={cx(
              "h-3.5 w-0.5 rounded-full",
              green ? "bg-background" : "bg-brand",
            )}
          />
          <span
            className={cx(
              "text-[10px] font-bold tracking-[0.14em] uppercase",
              green ? "text-background/70" : "text-foreground/50",
            )}
          >
            {area}
          </span>
        </div>

        <h3 className="mt-5 font-neue-bold text-3xl leading-[1.05] tracking-tight text-balance">
          {title}
        </h3>

        <p
          className={cx(
            "mt-5 text-sm leading-relaxed text-pretty",
            green ? "text-background/80" : "text-foreground/60",
          )}
        >
          {description.split("\n").map((line, i) => (
            <span
              key={i}
              className={cx(
                "block",
                bold?.includes(line) &&
                  cx(
                    "font-neue-bold",
                    green ? "text-background" : "text-foreground",
                  ),
              )}
            >
              {line}
            </span>
          ))}
        </p>
      </div>

      {/* Pie de la tarjeta: lo que te llevas.

          Antes había aquí una CTA con badge de flecha, y era una promesa falsa:
          la tarjeta no enlaza a ningún sitio, lo único que se puede hacer con
          ella es arrastrarla.

          La palomita devuelve el peso visual que tenía la flecha sin devolver
          el engaño: es el mismo glifo que encabeza todas las secciones de la
          web, y una palomita nunca se lee como "púlsame" — se lee como "esto
          va incluido". Lo que aporta el movimiento es el hover: la regla crece
          de su ancho corto al completo y la palomita da un respingo.

          Va como span y no como <IconBadge>: el carrusel monta hasta diez
          tandas de cartas, y serían cuarenta componentes cliente con su hook
          para un icono que aquí nunca se anima por JS. Reutiliza los mismos
          tokens de estilo, así que no se desincroniza del badge de verdad. */}
      <div className="relative">
        <span
          aria-hidden
          className={cx(
            "block h-px w-10 transition-[width] duration-700",
            EASE_OUT,
            "group-hover:w-full motion-reduce:transition-none",
            green ? "bg-background/40" : "bg-foreground/20",
          )}
        />

        <div className="mt-4 flex items-start gap-3">
          <span
            aria-hidden
            className={cx(
              "flex shrink-0 items-center justify-center rounded-lg",
              iconGlyphSizeClasses.sm,
              // Sobre la carta verde, un badge verde desaparecería.
              green
                ? iconGlyphVariantClasses.solid
                : iconGlyphVariantClasses.brand,
              // El `scale-100` del reposo es explícito a propósito: sin un
              // valor de partida declarado, la interpolación depende de que el
              // navegador trate `scale: none` como la identidad.
              "scale-100 transition-[scale] duration-500",
              EASE_OUT,
              "group-hover:scale-110 motion-reduce:transition-none",
            )}
          >
            <Check
              className={iconGlyphIconSizeClasses.sm}
              strokeWidth={2.5}
            />
          </span>

          <div>
            <span
              className={cx(
                "text-[10px] font-bold tracking-[0.14em] uppercase",
                green ? "text-background/60" : "text-foreground/40",
              )}
            >
              Entregable
            </span>
            <p className="mt-1 font-neue-bold text-sm leading-snug tracking-tight text-pretty">
              {deliverable}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
