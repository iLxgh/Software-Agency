import Image from "next/image";
import { cx } from "@/components/ui/icon-glyph-styles";
import { platformsIntro, type Platform } from "./slides";

type QuadrantProps = Platform & {
  /**
   * `true` si es el cuadrante señalado, `false` si lo está otro, `null` si
   * ninguno. Hacen falta los tres estados: con solo `:hover` el cuadrante sabe
   * cuándo crecer, pero no cuándo encogerse porque el señalado es otro.
   */
  active?: boolean | null;
  onMouseEnter?: () => void;
};

/**
 * Transición del logo. Duplica a propósito la duración y la curva del grid
 * (ver index.tsx): si el recuadro se moviera con otro tiempo, se despegaría del
 * reparto de la cuadrícula y se vería como dos animaciones distintas en vez de
 * una. Van literales porque Tailwind no genera clases interpoladas.
 */
const LOGO_MOTION =
  "transition-[width,height] duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none";

/**
 * Lo mismo para la pieza de producto, pero sobre `scale`.
 *
 * Hace falta porque el reparto del grid por sí solo NO la mueve al cambiar de
 * cuadrante dentro de una misma fila: ahí solo cambian las columnas, y la pieza
 * va con `object-contain`, o sea limitada por el ALTO —que lo marca la fila—.
 * Medido: 318x256 px tanto señalando el cuadrante izquierdo como el derecho.
 * Atándola al estado `active` reacciona en los dos ejes.
 *
 * `transition-[scale]` y no `transition-transform`: en Tailwind v4 `scale-*`
 * genera la propiedad `scale` suelta, y con `transform` el cambio sale de
 * golpe.
 */
const ART_MOTION =
  "origin-bottom-right scale-100 transition-[scale] duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none";

/**
 * Un cuadrante de la cuadrícula: texto esquinado arriba a la izquierda, el
 * wordmark al pie y la pieza de producto ocupando toda la esquina inferior
 * derecha, a sangre.
 *
 * El tamaño lo decide la celda del grid (ver index.tsx), no la card: al crecer
 * la celda crece el pie, y con él la pieza, porque está medida contra ese hueco.
 */
export function Quadrant({
  name,
  description,
  audience,
  image,
  alt,
  logo,
  active = null,
  onMouseEnter,
}: QuadrantProps) {
  return (
    <article
      onMouseEnter={onMouseEnter}
      // El fondo es el MISMO blanco que el lienzo de las piezas (#F7F6F4,
      // comprobado sobre los propios archivos), no el `bg-card` del resto de la
      // web. Es lo que hace que la pieza no tenga borde: el dibujo flota sobre
      // el cuadrante en vez de ir dentro de un recuadro.
      //
      // overflow-hidden: la pieza se sale del cuadrante a propósito y es esto
      // lo que la recorta contra el canto.
      className="relative flex h-full cursor-pointer flex-col justify-between gap-6 overflow-hidden bg-[#F7F6F4] p-7 sm:p-8"
    >
      {/* Bloque de texto, anclado arriba a la izquierda. shrink-0: es la parte
          que NUNCA se comprime cuando la celda encoge. */}
      <div className="relative z-10 max-w-sm shrink-0">
        <h3 className="font-neue-bold text-3xl leading-[1.02] tracking-tight sm:text-4xl">
          {name}
        </h3>
        <p className="mt-4 font-neue text-base leading-relaxed text-foreground/60">
          {description}
        </p>
        {/* Público objetivo, como etiquetas.
            Antes era una frase con comas ("Para: notarías, despachos, …"). En
            etiquetas se cuenta de un vistazo a quién va dirigida cada
            plataforma, que es la pregunta que trae aquí al visitante. Mismo
            estilo que los badges de la sección de contacto. */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="font-neue text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase">
            {platformsIntro.audienceLabel}
          </span>
          {audience.map((item) => (
            <span
              key={item}
              className="rounded-lg border border-foreground/10 bg-foreground/[0.03] px-2.5 py-1 font-neue text-sm text-foreground/70"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Pie.
          flex-1 + min-h-0 = este bloque se queda con TODO el alto sobrante de
          la celda. Es lo que hace que la cuadrícula pueda tener alto fijo: al
          crecer o encoger un cuadrante, lo que cambia es este hueco, no el
          texto. */}
      <div className="relative flex min-h-0 flex-1 items-end">
        {/* Recuadro negro fijo: los cuatro logos tienen proporciones muy
            distintas (de 87x37 a 55x79), y contenerlos en una caja cuadrada
            los deja ópticamente del mismo tamaño en los cuatro cuadrantes. */}
        {/* El padding va en la <Image>, no aquí: con `fill` la imagen se
            posiciona contra el padding-box del contenedor y lo ignoraría. */}
        <div
          className={cx(
            "relative z-10 shrink-0 rounded-xl bg-foreground",
            LOGO_MOTION,
            // El recuadro acompaña al reparto del grid: crece con su cuadrante
            // y se encoge cuando el señalado es otro.
            active === true
              ? "size-16"
              : active === false
                ? "size-12"
                : "size-14",
          )}
        >
          <Image
            src={logo}
            alt={name}
            fill
            sizes="56px"
            className="object-contain p-3"
            draggable={false}
          />
        </div>

        {/* La pieza de producto.
            Cuelga del pie —`top-0`— y no del cuadrante entero: así su borde
            superior queda SIEMPRE por debajo del texto, pase lo que pase con la
            altura de la celda. Anclarla al cuadrante con un porcentaje parecía
            más simple, pero al encogerse una celda en el hover el texto pasa a
            ocupar una fracción mayor y la pieza se le subiría encima.

            Los insets negativos valen justo el padding del cuadrante (p-7 /
            sm:p-8), que es lo que la lleva hasta el canto.

            `object-contain` y no `cover`: con cover el documento se partía por
            la mitad, porque la caja es mucho más apaisada que el dibujo. Con
            contain se ve entero, y el hueco que sobra a su izquierda no se nota
            porque el lienzo de la pieza es el mismo blanco que el cuadrante.
            Anclada abajo a la derecha, apoya en la esquina. */}
        <div
          className={cx(
            "pointer-events-none absolute top-0 -right-7 -bottom-7 left-[34%] sm:-right-8 sm:-bottom-8",
            ART_MOTION,
            // Crece con su cuadrante y se retira cuando el señalado es otro.
            // El origen abajo a la derecha la mantiene apoyada en la esquina
            // mientras escala.
            active === true
              ? "scale-[1.08]"
              : active === false
                ? "scale-[0.94]"
                : "scale-100",
          )}
        >
          <Image
            src={image}
            alt={alt}
            fill
            sizes="(min-width: 768px) 36vw, 72vw"
            className="object-contain object-right-bottom"
            draggable={false}
          />
        </div>
      </div>
    </article>
  );
}
