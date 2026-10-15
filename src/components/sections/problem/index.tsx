"use client";

import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Check, Quote } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { cx } from "@/components/ui/icon-glyph-styles";
import { ENTRANCE } from "@/lib/motion";
import { problemIntro, symptoms } from "./slides";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * Cuánto se tapa una tarjeta a la anterior, en porcentaje de su propio ancho.
 *
 * Este número decide la forma de todo lo demás, porque la pila colapsada mide
 * `1 + (n−1)·(1−solape)` anchos de tarjeta y el ancho sale de ahí (ver SPAN).
 *
 * Estuvo en 80 y era demasiado: obligaba a tarjetas de 880×384 para que la
 * pila llenase el contenedor, y una cita de ocho palabras en un panel así se
 * veía medio vacía. Al 55% la tarjeta queda casi cuadrada, y lo que asoma de
 * cada una —el 45%— da para el número Y la cita, así que colapsada se siguen
 * leyendo las cuatro en vez de solo la última.
 */
const COVER = 55;

/**
 * Alto del riel que envuelve a la cabecera pegada, en vh.
 *
 * El sticky se queda fijo durante (RAIL − PANEL) de scroll, y ese sobrante es
 * todo el presupuesto que tiene el colapso: con tres pasos, salen unos 40vh por
 * tarjeta. Es lo que hace que se puedan leer una a una.
 *
 * Es la contrapartida de pinear: la sección deja de ser corta. Subirlo da más
 * tiempo de lectura y cuesta más scroll; bajarlo, lo contrario.
 */
const RAIL = 210;

/**
 * Alto del panel pegado, en vh. Menos de 100 a propósito: esta sección no tiene
 * fondo propio —va sobre el blanco de la página—, así que no necesita cubrir la
 * pantalla entera como sí hace el panel de Stack con su negro y su ruido. Al
 * dejarlo por debajo, el bloque se lee más compacto y asoma la sección
 * siguiente, que avisa de que esto no se acaba aquí.
 */
const PANEL = 86;

/**
 * A qué altura se pega el panel, en vh.
 *
 * La mitad de lo que le falta para llenar la pantalla, así que queda centrado
 * en el viewport. Con `top: 0` el panel se pegaba arriba y todo el sobrante
 * caía debajo: el contenido estaba centrado en el PANEL pero no en la
 * PANTALLA, y el hueco bajo las tarjetas salía 14vh mayor que el de encima de
 * la palomita.
 *
 * Se deriva de PANEL para que no se puedan desincronizar, y de aquí salen
 * también los límites del scrub: el colapso tiene que empezar y acabar
 * exactamente cuando el panel se pega y se suelta.
 */
const PANEL_TOP = (100 - PANEL) / 2;

/** Ancho máximo y margen laterales de la landing, los mismos de toda la web. */
const CONTAINER = "1400px";
const GUTTER = "2rem";

/**
 * Radio de las esquinas, y cuánto se solapan las tarjetas ya en reposo.
 *
 * Son el mismo número por un motivo: con las cuatro esquinas redondeadas y las
 * tarjetas a tope, entre dos cantos curvos enfrentados queda un diente por el
 * que se ve el fondo de la página. Solapándolas desde el principio justo el
 * radio, ese diente cae SOBRE la tarjeta de debajo —que va por detrás en el
 * apilado— y lo que se asoma es ella, no el fondo.
 *
 * Va aquí y no solo como clase porque entra en el cálculo del ancho. Si se
 * cambia, hay que cambiar también `lg:rounded-3xl` y `lg:-ml-6` en el JSX: son
 * `1.5rem` los tres.
 */
const RADIUS = "1.5rem";

/**
 * Inclinación de reposo de las tarjetas, en grados, antes de encajar en la
 * pila. Alterna de signo, así que la tira se lee como un montón repartido a
 * mano y no como una fila de cajas.
 *
 * Cada tarjeta se endereza justo durante su propio tramo del colapso: entra
 * torcida y queda recta al encajar. Es lo que le quita la rigidez al efecto
 * sin recurrir a la física del carrusel de Approach, que aquí sería
 * desproporcionada para tres pasos.
 */
const TILT = 1.6;

/**
 * Cuántos anchos de tarjeta mide la pila una vez colapsada.
 *
 * La primera va entera y las demás solo asoman lo que no les tapan, así que
 * son 1 + (n − 1) · (1 − solape). Con cuatro tarjetas al 80%: 1,6.
 *
 * De aquí sale el ancho de la tarjeta, y no al revés: queremos que la pila
 * colapsada ocupe EXACTAMENTE el ancho útil del contenedor —de borde a borde
 * de los márgenes de la landing—, así que la tarjeta mide ese ancho dividido
 * entre esto. Puesto a mano, la pila acababa cubriendo media pantalla y
 * dejando la otra mitad vacía.
 */
const SPAN = 1 + (symptoms.length - 1) * (1 - COVER / 100);

/**
 * Ancho de cada tarjeta. `min(CONTAINER, 100vw)` es el ancho real de la caja
 * del contenedor y, menos los dos márgenes, da el ancho útil. Se le suman los
 * solapes de reposo, que el colapso no recupera, para que la pila siga
 * acabando exactamente en el margen derecho.
 *
 * Se resuelve en CSS y no en JS para que siga al redimensionar sin recalcular
 * nada.
 */
const CARD_WIDTH = `calc((min(${CONTAINER},100vw) - ${GUTTER} * 2 + ${RADIUS} * ${symptoms.length - 1}) / ${SPAN})`;

/**
 * Ancho de la cara que queda a la vista al apilarse: justo lo que no tapa la
 * tarjeta de encima. Se deriva de COVER para que las dos cosas no se puedan
 * desincronizar.
 */
const FACE_WIDTH = `${100 - COVER}%`;

/**
 * Paleta de cada tarjeta.
 *
 * Alternan por una razón funcional y no decorativa: una vez apiladas, lo único
 * que distingue un lomo del siguiente es el color.
 *
 * Cada una lleva un `accent` del color CONTRARIO al suyo para los detalles —la
 * numeración, el rótulo del lomo, la comilla—. Así las tres superficies de la
 * marca conviven en todas: el verde aparece sobre las negras y la blanca, y el
 * negro sobre la verde, en vez de quedarse cada tarjeta en un solo color.
 *
 * La tercera es blanco puro y no el hueso que tenía antes: el hueso quedaba tan
 * cerca del fondo de la página que la tarjeta no parecía tener fondo, y con eso
 * se perdía la lectura de que se solapa sobre la verde. El hueso se recicla
 * como fondo de su lomo, que es donde sí aporta.
 */
const TONES = [
  {
    surface: "bg-foreground text-background",
    spine: "bg-white/5",
    accent: "text-brand",
  },
  {
    surface: "bg-brand text-white",
    spine: "bg-black/10",
    accent: "text-foreground",
  },
  {
    surface: "bg-background text-foreground",
    spine: "bg-card",
    accent: "text-brand",
  },
  {
    surface: "bg-foreground text-background",
    spine: "bg-white/5",
    accent: "text-brand",
  },
] as const;

/**
 * El espejo: dónde se reconoce el visitante.
 *
 * Ocupa el hueco que había después del hero, donde antes vivía `Meeting` —una
 * tarjeta de agendar llamada y un slider de verbos—. Las dos mitades estaban
 * dichas mejor en otro sitio: la llamada la hace `Contact` con sus tres pasos,
 * y los verbos los dice `Approach` con sus cuatro formas de trabajo.
 *
 * Lo que faltaba era esto. Todas las demás secciones hablan de Bloxtek —qué
 * hace, qué domina, qué construyó, por qué confiar— y el hero promete "primero
 * el problema, luego la tecnología" sin que la página enuncie nunca un
 * problema. Aquí se enuncia, y por eso va justo después del hero: es donde el
 * visitante decide si la página habla de él.
 *
 * El formato son cuatro tarjetas en una tira horizontal a sangre que se
 * colapsan con el scroll, una sobre otra. Hubo tres intentos antes, y el
 * motivo del descarte está anotado por si a alguien le tienta volver:
 *
 * - **Titular grande con bajada a la izquierda.** Es la composición del hero,
 *   y las dos secciones seguidas se leían como la misma cosa dos veces.
 * - **Tarjeta con lista desplegable.** El problema no era la tarjeta, era el
 *   marco anterior, que seguía siendo el del hero.
 * - **Las frases en cintas con scroll infinito.** Un marquee sirve para
 *   nombres y etiquetas, no para contenido que hay que leer y comparar con tu
 *   caso; y tres a la vez no dejaban leer ninguno.
 */
export function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef<HTMLOListElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Entrada: palomita, etiqueta y titular.
  useGSAP(
    () => {
      const header = headerRef.current;
      const label = labelRef.current;
      const title = titleRef.current;
      const subtitle = subtitleRef.current;
      if (!header || !label || !title || !subtitle) return;

      const badge = header.querySelector<HTMLSpanElement>("span");

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Oculto antes del primer paint (solo con JS) para evitar el flash.
      gsap.set([label, title, badge, subtitle], { autoAlpha: 0 });

      let titleSplit: SplitText | null = null;
      let labelSplit: SplitText | null = null;
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        if (!titleRef.current) return;
        titleSplit = new SplitText(title, { type: "words", mask: "words" });
        labelSplit = new SplitText(label, { type: "words", mask: "words" });

        // La Baskerville itálica tiene descendentes que la máscara recorta: se
        // les da aire abajo y se compensa con margen negativo, así no mueve el
        // renglón. Mismo apaño que en el resto de los titulares de la web.
        titleSplit.words.forEach((w) => {
          const unit = w as HTMLElement;
          unit.style.paddingBottom = "12px";
          const mask = unit.parentElement;
          if (mask) mask.style.marginBottom = "-12px";
        });

        gsap.set([label, title, badge, subtitle], { autoAlpha: 1 });
        if (reduce) {
          titleSplit.revert();
          labelSplit.revert();
          return;
        }

        tl = gsap.timeline({
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
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
            titleSplit.words,
            { yPercent: 100, duration: 0.9, stagger: 0.04, ease: "power3.out" },
            "-=0.6",
          )
          .from(
            subtitle,
            { autoAlpha: 0, y: 14, duration: 0.7, ease: "power3.out" },
            "-=0.5",
          );
      };

      // Espera a las fuentes para que el split mida sobre el layout final.
      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        titleSplit?.revert();
        labelSplit?.revert();
      };
    },
    { scope: sectionRef },
  );

  /**
   * El colapso de la tira, atado al scroll.
   *
   * Arranca cuando la cabecera se pinea y acaba cuando se suelta: el riel que
   * envuelve al sticky es el que da el presupuesto de scroll, y el scrub se
   * mapea exactamente a ese tramo. Antes no había pin y el efecto corría
   * mientras la sección entera pasaba de largo, así que al llegar ya iban dos
   * tarjetas solapadas y no había tiempo de leer la primera.
   *
   * Cada paso mueve la tarjeta que entra Y TODAS LAS QUE VAN DETRÁS la misma
   * distancia. Eso es lo que mantiene la tira pegada: si solo se moviera una,
   * se abriría un hueco en medio de la fila mientras viaja. Así cada tarjeta
   * llega, se frena en su 20% y la siguiente arranca.
   *
   * Va en `gsap.matchMedia` y no en un `matchMedia` a pelo porque hace falta
   * que se cree y se destruya al cruzar el breakpoint: por debajo de `lg` no
   * hay tira ni pin —las tarjetas se apilan en vertical— y los transforms de
   * una ejecución anterior se quedarían pegados al redimensionar.
   */
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 1024px)",
        motion: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { desktop, motion } = context.conditions as Record<
          string,
          boolean
        >;
        if (!desktop || !motion) return;

        const cards = gsap.utils.toArray<HTMLElement>(
          stripRef.current?.children ?? [],
        );
        if (cards.length < 2) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: railRef.current,
            // El tramo exacto en que el panel está pegado: se pega cuando su
            // borde superior llega a PANEL_TOP y se suelta cuando el inferior
            // llega al final del panel.
            //
            // En POR CIENTO y no en vh, aunque aquí signifiquen lo mismo: la
            // posición sobre el scroller de ScrollTrigger entiende px, % y
            // palabras clave, pero NO unidades de viewport. Escrito "93vh" se
            // leía como 93 PÍXELES, así que el colapso terminaba mucho más
            // abajo que el pin y la cuarta tarjeta seguía sin encajar cuando
            // el panel ya se había soltado.
            start: `top ${PANEL_TOP}%`,
            end: `bottom ${PANEL_TOP + PANEL}%`,
            scrub: true,
          },
        });

        // Inclinación de salida, alternada. La primera ya está en su sitio,
        // así que nace recta.
        cards.forEach((card, i) => {
          gsap.set(card, { rotate: i === 0 ? 0 : (i % 2 ? 1 : -1) * TILT });
        });

        const steps = cards.length - 1;

        // Un paso por tarjeta que entra: la i-ésima y las posteriores avanzan
        // hasta el múltiplo de COVER que le toca a la i-ésima. La que entra se
        // endereza en ese mismo tramo, así que encaja recta.
        for (let i = 1; i <= steps; i++) {
          const at = `step${i}`;
          tl.addLabel(at);
          tl.to(cards.slice(i), { xPercent: -COVER * i, ease: "none" }, at).to(
            cards[i],
            { rotate: 0, ease: "power2.out" },
            at,
          );
        }

        // El índice: se enciende la tarjeta que acaba de encajar.
        const marks = gsap.utils.toArray<HTMLElement>(
          progressRef.current?.children ?? [],
        );
        if (marks.length) {
          let lit = -1;
          const light = (next: number) => {
            if (next === lit) return;
            lit = next;
            marks.forEach((mark, i) => {
              mark.classList.toggle("opacity-100", i <= next);
              mark.classList.toggle("text-brand", i === next);
              mark.classList.toggle("opacity-25", i > next);
            });
          };
          light(0);
          // Trigger propio y no el `onUpdate` del timeline: el índice avanza
          // por tramos enteros y el timeline se scrubea en continuo. Vive
          // dentro del mismo contexto de matchMedia, así que se destruye con
          // él al cruzar el breakpoint.
          ScrollTrigger.create({
            trigger: railRef.current,
            start: `top ${PANEL_TOP}%`,
            end: `bottom ${PANEL_TOP + PANEL}%`,
            onUpdate: (self) =>
              light(Math.min(steps, Math.round(self.progress * steps))),
          });
        }
      },
    );

    return () => mm.revert();
  }, {});

  return (
    <section
      ref={sectionRef}
      id="problema"
      // overflow-x clip (no `hidden`, que rompería los sticky de la página):
      // la tira es más ancha que la pantalla a propósito y sin esto provocaría
      // scroll horizontal en todo el documento.
      className="relative text-foreground"
      style={{ overflowX: "clip" }}
      aria-label="El punto de partida"
    >
      {/* divisor: respeta el ancho del contenedor */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-foreground/20" />
      </div>

      {/* --- Riel + cabecera pegada ---
          El riel solo existe para dar scroll: la cabecera y la tira se quedan
          fijas dentro mientras él pasa, y ese tramo es el que consume el
          colapso. En móvil no hay nada de esto —ni riel ni pin—, así que el
          alto es el del contenido y las tarjetas se apilan en vertical. */}
      <div
        ref={railRef}
        // Como variable y no como `height` inline: así el alto solo se aplica
        // en `lg`, donde hay pin. Con el estilo inline haría falta un
        // `!important` para anularlo en móvil.
        style={
          {
            "--rail": `${RAIL}vh`,
            "--card": CARD_WIDTH,
            "--face": FACE_WIDTH,
            "--panel": `${PANEL}vh`,
            "--panel-top": `${PANEL_TOP}vh`,
          } as CSSProperties
        }
        className="lg:h-[var(--rail)]"
      >
        <div className="flex flex-col justify-center gap-12 py-16 lg:sticky lg:top-[var(--panel-top)] lg:h-[var(--panel)] lg:gap-10 lg:py-0">
          {/* Cabecera, toda a bandera izquierda.
              Estuvo con el titular centrado para no repetir la composición del
              hero. Dejó de ser un problema al entrar la tira: el hero es
              titular a la izquierda y logo a la derecha, y esto es cabecera
              arriba con una tira a sangre debajo. Ya no se parecen. */}
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-8">
              <div ref={headerRef} className="flex items-center gap-3">
                <IconBadge icon={Check} size="sm" variant="brand" />
                <p ref={labelRef} className="font-neue text-lg tracking-wide">
                  {problemIntro.label}
                </p>
              </div>

              {/* Índice de progreso. Ocupa el lado derecho de la fila —que
                  estaba vacío— con algo que informa en vez de decorar: con la
                  cabecera pegada y la tira moviéndose sola, dice en qué punto
                  de la secuencia vas y cuánto queda. Solo en `lg`, que es
                  donde hay pin y colapso. */}
              <ol
                ref={progressRef}
                aria-hidden
                className="hidden items-center gap-2 lg:flex"
              >
                {symptoms.map((symptom) => (
                  <li
                    key={symptom.index}
                    className="font-neue-bold text-xs tabular-nums opacity-25 transition-[opacity,color] duration-300 motion-reduce:transition-none"
                  >
                    {symptom.index}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-8 lg:mt-8">
              <h2
                ref={titleRef}
                // max-w-4xl y no 3xl: con el titular nuevo, 3xl lo partía en
                // tres renglones y el bloque ya no cabía en el panel —las
                // tarjetas se salían por abajo y la palomita por arriba—. Al
                // darle ancho entra en dos sin tocar el cuerpo de letra.
                className="max-w-4xl font-neue-bold text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl"
              >
                {problemIntro.titleLead}{" "}
                <span className="font-baskerville text-[0.92em] font-normal tracking-normal italic">
                  {problemIntro.titleAccent}
                </span>
              </h2>

              <p
                ref={subtitleRef}
                className="mt-5 max-w-md font-neue text-base leading-relaxed text-foreground/55 text-pretty"
              >
                {problemIntro.subtitle}
              </p>
            </div>
          </div>

          {/* --- La tira ---
              Dentro del contenedor de siempre, así que arranca en el margen
              izquierdo de la landing como el resto de las secciones. La tira
              interior es `w-max`: se desborda por la derecha hasta el borde de
              la pantalla —donde la recorta el `overflow-x: clip` de la
              sección— y la última tarjeta queda cortada.

              Sin hueco ni margen entre tarjetas: van a tope unas con otras,
              que es lo que permite que al colapsarse formen una pila. */}
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
            {/* gap en móvil y no en la tira: apiladas en vertical, dos cantos
                curvos enfrentados dejarían el mismo diente, y ahí no hay
                solape que lo tape. */}
            <div
              ref={stripRef}
              className="flex flex-col gap-4 lg:w-max lg:flex-row lg:gap-0"
            >
              {symptoms.map((symptom, index) => {
                const tone = TONES[index % TONES.length];
                return (
                  <article
                    key={symptom.index}
                    // zIndex creciente: cada tarjeta se apila SOBRE la anterior.
                    style={{ zIndex: index }}
                    className={cx(
                      // El alto cede en pantallas bajas: el panel es un vh
                      // fijo y el contenido no puede desbordarlo, que es
                      // justo lo que pasaba antes.
                      "relative flex shrink-0 lg:h-[min(23rem,42vh)] lg:w-[var(--card)]",
                      "overflow-hidden rounded-3xl",
                      // El solape de reposo, que es lo que tapa el diente
                      // entre esquinas. Ver RADIUS.
                      index > 0 && "lg:-ml-6",
                      // La sombra sale hacia la izquierda, que es el lado que
                      // queda a la vista: es lo que hace que la pila se lea como
                      // profundidad y no como recortes planos.
                      "lg:shadow-[-18px_0_36px_rgba(0,0,0,0.16)]",
                      tone.surface,
                    )}
                  >
                    {/* --- Zona visible ---
                        Su ancho es exactamente lo que NO tapa la tarjeta
                        siguiente, así que es lo único que queda a la vista una
                        vez apiladas. Por eso lleva lo que hay que poder leer
                        siempre: el número y la cita.

                        Esto es lo que cambió al bajar el solape. Con el 80%
                        anterior solo asomaba una franja estrecha, que apenas
                        daba para el número; con el 45% actual caben las dos
                        cosas y la pila final sigue siendo legible. */}
                    <div
                      className={cx(
                        "relative z-10 flex shrink-0 flex-col justify-between gap-6 border-r border-current/10 p-6 lg:w-[var(--face)] lg:p-8",
                        tone.spine,
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span
                          className={cx(
                            "font-neue-bold text-sm tabular-nums",
                            tone.accent,
                          )}
                        >
                          {symptom.index}
                        </span>

                        {/* Comilla. Es decoración tipográfica, no una cita
                            atribuida: el texto de al lado está en voz neutra y
                            sin entrecomillar a propósito (ver `slides.ts`). Si
                            alguna vez chirría, el relevo natural es un
                            `TriangleAlert`, que encaja con el "cuatro señales"
                            del titular.

                            `fill="currentColor"` en el svg: los iconos de
                            Lucide son de trazo y sus paths no declaran
                            relleno, así que lo heredan. Es lo que lo vuelve un
                            signo macizo. */}
                        <Quote
                          aria-hidden
                          className={cx("size-6 shrink-0", tone.accent)}
                          fill="currentColor"
                          strokeWidth={0}
                        />
                      </div>

                      <div>
                        <span className="font-neue text-[10px] font-bold tracking-[0.18em] uppercase opacity-45">
                          {problemIntro.signalTag}
                        </span>
                        {/* La cita manda: es la voz del cliente y lo primero
                            que se reconoce. */}
                        <p className="mt-3 font-neue-bold text-2xl leading-snug tracking-tight text-balance">
                          {symptom.signal}
                        </p>
                      </div>
                    </div>

                    {/* --- Zona que se tapa ---
                        El diagnóstico se lee mientras la tarjeta está abierta,
                        durante el recorrido, y desaparece bajo la siguiente. Va
                        aquí y no en la cara visible porque es lo segundo: sin
                        la cita delante no significa nada. */}
                    <div className="relative z-10 flex flex-1 flex-col justify-end p-6 lg:p-8">
                      <span className="font-neue text-[10px] font-bold tracking-[0.18em] uppercase opacity-45">
                        {problemIntro.causeTag}
                      </span>
                      <p className="mt-2 font-neue text-sm leading-relaxed text-pretty opacity-75">
                        {symptom.cause}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
