import { TONES, type TrustCard as TrustCardData } from "./slides";

/**
 * Parte la frase por los tramos marcados con ** ** y los devuelve en bold.
 * Los índices impares del split son siempre lo que iba entre marcadores.
 */
function renderHeadline(headline: string) {
  return headline.split("**").map((chunk, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-neue-bold">
        {chunk}
      </strong>
    ) : (
      <span key={i}>{chunk}</span>
    ),
  );
}

export function TrustCard({
  index,
  eyebrow,
  headline,
  support,
  badges,
  tone,
}: TrustCardData) {
  const { bg, logo, logoFrom, logoTo } = TONES[tone];

  return (
    <article
      style={{ backgroundColor: bg }}
      // Sin sombra: los dos morados alternados ya separan una tarjeta de la
      // siguiente, y un halo oscuro sobre el fondo blanco se leía como una
      // mancha justo en la unión con la sección de arriba.
      className="flex h-[75vh] w-full flex-col justify-between overflow-hidden rounded-3xl p-8 text-white sm:p-12 lg:p-16"
    >
      {/* Fila superior: numeración y etiqueta. */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] font-bold tracking-[0.16em] uppercase">
          {eyebrow}
        </span>
        <span className="text-[11px] font-bold tabular-nums text-white/50">
          {index} / 04
        </span>
      </div>

      {/* Cuerpo: logo a la izquierda (centrado en vertical) y texto a la
          derecha. El logo se oculta en móvil, donde no hay ancho para las dos
          columnas y solo restaría sitio a la frase. */}
      <div className="flex items-center gap-10 lg:gap-20">
        {/* El logo NO se pinta como imagen: el PNG trae el morado quemado
            dentro y no seguiría a la paleta. Se usa como MÁSCARA —su alfa es
            binario, así que recorta el trazo exacto del hexágono— y el color
            lo pone un degradado CSS que arranca del propio fondo de la tarjeta
            y se aclara hacia la derecha, igual que en el PNG original.
            Así el tono coincide siempre, sea cual sea la paleta. */}
        <div
          aria-hidden
          className="hidden aspect-square w-[22%] max-w-[260px] shrink-0 md:block"
          style={{
            backgroundImage: `linear-gradient(to right, ${logoFrom}, ${logoTo})`,
            maskImage: `url(${logo})`,
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
            // Safari por debajo de 15.4 solo entiende la versión prefijada.
            WebkitMaskImage: `url(${logo})`,
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
          }}
        />

        <div className="max-w-3xl">
          <p className="font-neue text-3xl leading-[1.1] tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {renderHeadline(headline)}
          </p>
          <p className="mt-6 max-w-lg font-neue text-base leading-relaxed text-white/60 sm:text-lg">
            {support}
          </p>
        </div>
      </div>

      {/* Badges: dan peso a la parte baja, que si no quedaba vacía. */}
      <ul className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <li
            key={badge}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white/80"
          >
            {badge}
          </li>
        ))}
      </ul>
    </article>
  );
}
