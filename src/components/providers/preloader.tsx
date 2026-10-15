"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LogoMark } from "@/components/ui/logo-mark";
import { LogoWordmark, WORDMARK_HEIGHT } from "@/components/ui/logo-wordmark";
import { lockScroll, unlockScroll } from "@/lib/scroll-to";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Tiempos de la pantalla de carga, en segundos. Todo lo ajustable, junto.
 *
 * `ENTRANCE.gate` (en `lib/motion.ts`) tiene que caer donde empieza la SALIDA,
 * no al final de todo: las entradas del hero arrancan mientras esta pantalla
 * se va, no después. Si se retocan estos tiempos, hay que recalcular aquello.
 */
/**
 * El nombre, letra a letra y de abajo arriba, DENTRO de la cápsula.
 *
 * El recorte lo hacen dos cosas a la vez: el `overflow-hidden` de la cápsula
 * —nada asoma por sus lados mientras se abre— y el propio viewBox del
 * logotipo, que es lo que esconde cada letra hasta que sube a su sitio. Por
 * eso no hace falta ninguna máscara extra.
 *
 * `at` es relativo al arranque del estirón: entra con la cápsula ya abierta
 * a medias, no desde el primer frame.
 */
const WORD = {
  at: 0.2,
  duration: 1.0,
  stagger: 0.065,
  ease: "power3.out",
  /** Alto del logotipo, en px. De aquí sale el ancho de la cápsula. */
  height: 13,
  /** Aire a cada lado del nombre dentro de la cápsula, en px. */
  pad: 13,
} as const;

const TIMING = {
  /**
   * La forma: nace casi invisible en el centro y crece hasta su tamaño final.
   *
   * Es UN SOLO tween y no dos encadenados. No hace falta transformar un
   * círculo en un cuadrado redondeado: con el radio fijo y grande, un div de
   * pocos píxeles YA se ve redondo —el radio se recorta a la mitad del lado— y
   * se va cuadrando solo según crece. Encadenar dos tweens metía una parada en
   * medio, que era justo lo que se veía mal.
   */
  shape: {
    /** Lado inicial, en px: lo justo para que se intuya un punto. */
    from: 2,
    /** ⟵ TAMAÑO FINAL del recuadro, en px. */
    to: 48,
    /**
     * Radio de las esquinas, en px. Es fijo: manda en los dos extremos sin
     * tocarlo, porque el navegador lo recorta a la mitad del lado y por eso
     * de pequeño se ve redondo y de grande se ve cuadrado con esquina suave.
     *
     * Como referencia, deja de leerse como círculo cuando el lado pasa de
     * `radius * 2`.
     */
    radius: 11,
    duration: 0.8,
    // inOut a propósito: arranca lento —de ahí la sensación de que nace de la
    // nada— y frena al llegar, en vez de dispararse desde el primer frame.
    ease: "power2.inOut",
  },
  /**
   * El cubo entra DENTRO de la forma: desde abajo, girado y desvanecido, y se
   * endereza al asentarse. Empieza pronto, cuando la forma aún está creciendo.
   */
  mark: {
    /**
     * Arranca con el timeline: lo más pronto posible.
     *
     * Pero adelantarlo solo no basta para que se VEA subir, y es lo que casi
     * nos pasa: con la forma creciendo despacio, el cubo hacía el 93% de su
     * recorrido mientras ella todavía lo recortaba entero, así que no se
     * apreciaba ni la subida ni el giro. Lo que lo arregla es que la forma
     * llegue antes a su tamaño (`shape.duration`) y que el cubo reparta mejor
     * su viaje (`power2.out` en vez de `power3.out`, que lo amontonaba todo al
     * principio).
     */
    at: 0,
    duration: 1.2,
    ease: "power2.out",
    from: { yPercent: 160, rotate: -24 },
    /**
     * El desvanecido va en un tween APARTE del movimiento, y con una curva
     * opuesta.
     *
     * Compartiendo el `power3.out` del recorrido, la opacidad llegaba a tope
     * en el primer tercio y el resto del viaje se veía ya opaco: ni se notaba
     * el giro. Con un `power2.in`, a mitad de camino sigue al 25%, así que se
     * ve llegar translúcido y solo se asienta del todo al final.
     */
    fade: { ease: "power2.in" },
  },
  /**
   * La cápsula: un contenedor SOLO DE BORDE que sale del lateral derecho del
   * cuadro y se estira hacia la derecha. Aquí irá el nombre de la empresa.
   *
   * Va pegada al cuadro y con su MISMO alto, para que las dos se lean como una
   * sola pastilla.
   *
   * Eso obliga a resolver la unión: el cuadro cuadra sus esquinas derechas
   * mientras la cápsula se abre, y entre su canto recto y las esquinas
   * redondeadas de la cápsula queda una cuña oscura arriba y abajo. Esa cuña
   * la rellenan dos parches (`CONCAVE`), que es lo único que la tapa sin
   * estropear ninguna de las dos formas.
   */
  sleeve: {
    at: 0.15,
    duration: 0.55,
    ease: "power3.out",
    /**
     * Cuánto se estira por la derecha, en px.
     *
     * NO es un número a ojo: sale del nombre que tiene que caber dentro. El
     * logotipo mide 143×19, así que a la altura pedida su ancho es
     * `height / 19 * 143`, más el aire de los dos lados. Fijarlo a mano era
     * garantizar que un día el texto no cupiera.
     */
    reach: Math.round((WORD.height / 19) * 143 + WORD.pad * 2),

    /** Grosor del borde, en px. */
    stroke: 3,
  },
  /** Respiro con el logo ya puesto. */
  hold: 0.35,
  /**
   * PROVISIONAL — salida. Un fundido, solo para que la pantalla se quite y la
   * web quede usable mientras se itera. Aquí es donde irá el efecto de verdad.
   */
  exit: { duration: 0.5, ease: "power2.inOut" },
  /** Con prefers-reduced-motion: un fundido y fuera. */
  reduced: 0.3,
} as const;

/**
 * Relleno de la cuña que queda entre el canto recto del cuadro y la esquina
 * redondeada de la cápsula.
 *
 * Es una curva CÓNCAVA, y por eso no sale con un div normal por mucho que se
 * le ponga `border-radius`: un radio siempre curva hacia dentro de la caja, y
 * aquí hace falta lo contrario. Se resuelve con un degradado radial —blanco en
 * todo el cuadrado MENOS en un círculo— centrado justo en la esquina de la
 * cápsula, así que su recorte sigue esa curva exacta.
 *
 * El radio es un parámetro y no una constante porque la esquina de la cápsula
 * NO mide siempre lo mismo: el navegador recorta el `border-radius` a la mitad
 * del lado, así que mientras la cápsula se abre su esquina va creciendo de 0
 * al radio nominal. Con un parche de tamaño fijo, los primeros frames del
 * estirón enseñaban la separación — justo el parpadeo que había que quitar.
 */
const CONCAVE = (corner: "top" | "bottom", radius: number) =>
  `radial-gradient(circle at 100% ${corner === "top" ? "100%" : "0%"}, transparent ${Math.max(0, radius - 1)}px, #ffffff ${radius}px)`;

/** ⟵ TAMAÑO DEL LOGO dentro del recuadro, en px. */
const MARK_SIZE = 32;

/**
 * Pantalla de carga.
 *
 * Fondo oscuro, una forma que nace en el centro como un punto y crece hasta un
 * recuadro de esquinas suaves, y el logo entrando en ella desde abajo.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const sleeveRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const jointRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);

  /** Al acabar se desmonta: no tiene sentido dejarlo en el árbol. */
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      lockScroll();
      const finish = () => {
        unlockScroll();
        setDone(true);

        /**
         * Mientras esta pantalla está puesta el scroll va bloqueado con
         * `overflow: hidden`, así que el documento no tiene altura de
         * recorrido — y es JUSTO cuando se montan todas las secciones de la
         * landing y crean sus ScrollTrigger. Sin esta remedida se quedan con
         * posiciones calculadas sobre un documento sin scroll.
         *
         * En dos frames porque `finish` corre dentro del `onComplete` de un
         * tween, o sea dentro del tick de GSAP, y ahí ScrollTrigger aplaza el
         * refresh en vez de ejecutarlo.
         */
        requestAnimationFrame(() =>
          requestAnimationFrame(() => ScrollTrigger.refresh()),
        );
      };

      const patches = gsap.utils.toArray<HTMLElement>(
        jointRef.current?.children ?? [],
      );

      /**
       * Ancho de la cápsula. Lo escribe su tween, y de aquí salen también los
       * parches, para que la esquina y su relleno vayan siempre al mismo
       * tamaño.
       */
      const cap = { w: 0 };
      const applyCap = () => {
        gsap.set(sleeveRef.current, { width: cap.w });
        /**
         * La esquina que la cápsula está dibujando DE VERDAD en este frame.
         *
         * Dos recortes encadenados, y el segundo es el que se me escapaba: con
         * `box-sizing: border-box` un div de ancho 0 no mide 0, mide lo que
         * suman sus dos bordes. Así que al principio del estirón su ancho real
         * es `stroke * 2` aunque el tween diga 0 — y sobre ESE ancho es sobre
         * el que el navegador recorta el radio. Calculando el parche desde el
         * valor del tween salía más pequeño que la curva y dejaba ver la
         * separación los primeros 10ms.
         */
        const real = Math.max(cap.w, TIMING.sleeve.stroke * 2);
        const k = Math.min(TIMING.shape.radius, real / 2);
        patches.forEach((el, i) => {
          gsap.set(el, {
            width: k,
            height: k,
            backgroundImage: CONCAVE(i === 0 ? "top" : "bottom", k),
          });
        });
      };
      applyCap();

      const letters = gsap.utils.toArray<SVGPathElement>(
        wordRef.current?.querySelectorAll("[data-wordmark-path]") ?? [],
      );
      // Debajo del viewBox del logotipo, que es lo que las esconde. Mismo
      // reveal enmascarado que usa la cortina de transición.
      gsap.set(letters, { y: WORDMARK_HEIGHT });

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduce) {
        // Sin animación no hay quien coloque las piezas, así que se ponen a
        // mano en su estado final. El markup nace en el de PARTIDA —ver el
        // `style` del cuadro— para que no haya destello antes de que arranque
        // el JS, y eso incluye este camino.
        gsap.set(shapeRef.current, {
          width: TIMING.shape.to,
          height: TIMING.shape.to,
        });
        cap.w = TIMING.sleeve.reach;
        applyCap();
        gsap.set(
          [markRef.current, sleeveRef.current, wordRef.current, ...patches],
          { autoAlpha: 1 },
        );
        gsap.set(letters, { y: 0 });
        gsap.set(groupRef.current, { x: -TIMING.sleeve.reach / 2 });

        gsap.to(root, {
          autoAlpha: 0,
          duration: TIMING.reduced,
          ease: "none",
          onComplete: finish,
        });
        return;
      }

      const tl = gsap.timeline({ onComplete: finish });

      // 1. La forma nace como un punto y crece, cuadrándose sola.
      tl.to(shapeRef.current, {
        width: TIMING.shape.to,
        height: TIMING.shape.to,
        duration: TIMING.shape.duration,
        ease: TIMING.shape.ease,
      })
        // 2. El cubo sube hacia dentro mientras la forma todavía crece. El
        //    `overflow-hidden` de la forma es lo que hace que se vea ENTRAR en
        //    ella en vez de flotar por delante.
        .from(
          markRef.current,
          {
            ...TIMING.mark.from,
            transformOrigin: "center",
            duration: TIMING.mark.duration,
            ease: TIMING.mark.ease,
          },
          TIMING.mark.at,
        )
        // El desvanecido, en paralelo pero con su propia curva. Ver mark.fade.
        .fromTo(
          markRef.current,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: TIMING.mark.duration,
            ease: TIMING.mark.fade.ease,
            immediateRender: false,
          },
          TIMING.mark.at,
        )
        // 3. El estirón. Todo lo que tiene que pasar a la vez se cuelga de una
        //    ETIQUETA y no de posiciones relativas.
        //
        //    Antes iban con `"<"`, que apunta al inicio de la animación
        //    ANTERIOR — y al ir añadiendo tweens esa referencia se fue
        //    desplazando sola: el `.set` de las esquinas acabó colgando del
        //    tween de las letras, 0.2s más tarde, y durante ese rato el cuadro
        //    conservaba su curva y dejaba ver la separación. Con una etiqueta
        //    fija, añadir pasos no mueve los que ya estaban.
        .addLabel("open", `+=${TIMING.sleeve.at}`)
        .to(
          cap,
          {
            w: TIMING.sleeve.reach,
            duration: TIMING.sleeve.duration,
            ease: TIMING.sleeve.ease,
            onUpdate: applyCap,
          },
          "open",
        )
        // La cápsula, su contenido y los parches se encienden a la vez.
        .set(
          [sleeveRef.current, wordRef.current, ...patches],
          { autoAlpha: 1 },
          "open",
        )
        // El cuadro cuadra sus esquinas derechas DE GOLPE. Mientras conserve
        // radio, su curva deja una cuña que los parches no cubren —ellos solo
        // resuelven la esquina de la cápsula—, y cualquier duración, por corta
        // que sea, la enseña unos frames. El salto no se nota porque cae en el
        // mismo instante en que la cápsula aparece a su lado.
        .set(
          shapeRef.current,
          { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
          "open",
        )
        // El conjunto se corre a la izquierda la mitad de lo que la cápsula
        // gana por la derecha, así queda centrado en pantalla todo el rato y el
        // gesto se lee como UNA pieza que se ensancha. Se mueve el ENVOLTORIO y
        // no el cuadro: la cápsula se cuelga de su borde, y desplazar solo el
        // cuadro los habría separado.
        .to(
          groupRef.current,
          {
            x: -TIMING.sleeve.reach / 2,
            duration: TIMING.sleeve.duration,
            ease: TIMING.sleeve.ease,
          },
          "open",
        )
        // El nombre sube letra a letra dentro de la cápsula, con ella ya
        // abierta a medias.
        .to(
          letters,
          {
            y: 0,
            duration: WORD.duration,
            stagger: WORD.stagger,
            ease: WORD.ease,
          },
          `open+=${WORD.at}`,
        )
        // 4. PROVISIONAL: se quita con un fundido.
        .to(
          root,
          {
            autoAlpha: 0,
            duration: TIMING.exit.duration,
            ease: TIMING.exit.ease,
          },
          `+=${TIMING.hold}`,
        );

      return () => {
        tl.kill();
        unlockScroll();
      };
    },
    { scope: rootRef },
  );

  if (done) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      // Por encima de todo, incluida la cortina de transición (z-100).
      className="pointer-events-none fixed inset-0 z-[200] grid place-items-center bg-[#131313]"
    >
      {/* El tamaño de CSS es el FINAL; la animación la trae desde el punto.
          `overflow-hidden` no es cosmético: recorta al cubo mientras sube, y
          sin él el logo entraría por delante de la forma en vez de dentro. */}
      {/* Envoltorio en `relative` sin tamaño propio: lo dimensiona el cuadro
          que lleva dentro, así que el manguito puede colgarse de su borde
          derecho con un `left: calc(100% - …)` y seguirlo solo. */}
      <div ref={groupRef} className="relative">
        {/* Los dos parches de la unión. Van por ENCIMA de la cápsula (z-10,
            como el cuadro) y pegados a su canto izquierdo, uno arriba y otro
            abajo. Ver CONCAVE para cómo se dibuja la curva. */}
        <div ref={jointRef} aria-hidden>
          {(["top", "bottom"] as const).map((corner) => (
            <div
              key={corner}
              style={{ left: "100%", [corner]: 0 }}
              className="invisible absolute z-10"
            />
          ))}
        </div>

        {/* La cápsula. Nace con ancho cero pegada al canto derecho del cuadro
            y se abre hacia la derecha, con sus cuatro esquinas a la vista y su
            mismo alto. */}
        <div
          ref={sleeveRef}
          style={{
            left: "100%",
            height: TIMING.shape.to,
            borderRadius: TIMING.shape.radius,
            borderWidth: TIMING.sleeve.stroke,
          }}
          className="invisible absolute top-0 box-border overflow-hidden border-white"
        >
          {/* El nombre. En absoluto para no empujar el ancho de la cápsula,
              que lo gobierna el tween; y pegado a la izquierda con el mismo
              aire que entró en el cálculo de `reach`. */}
          <div
            ref={wordRef}
            className="invisible absolute top-1/2 -translate-y-1/2"
            style={{ left: WORD.pad }}
          >
            <LogoWordmark
              className="w-auto text-white"
              style={{ height: WORD.height }}
            />
          </div>
        </div>

        <div
          ref={shapeRef}
          // Las medidas salen de las constantes y no de clases de Tailwind a
          // propósito: el lado lo necesita también el tween, y tenerlo escrito
          // en dos sitios es pedir que uno se quede atrás.
          //
          // Y es el tamaño de PARTIDA, no el final. El HTML se pinta antes de
          // que corra el JS, así que esto es lo primero que se ve: con el
          // tamaño final puesto había un fogonazo de las piezas ya colocadas
          // antes de arrancar la animación. Por lo mismo nacen `invisible` el
          // logo, la cápsula y los parches, y por lo mismo el camino de
          // `prefers-reduced-motion` tiene que colocarlo todo a mano.
          style={{
            width: TIMING.shape.from,
            height: TIMING.shape.from,
            borderRadius: TIMING.shape.radius,
          }}
          // z-10: el cuadro tapa al manguito, y es eso lo que hace que parezca
          // que brota de debajo en vez de aparecer de la nada.
          className="relative z-10 grid shrink-0 place-items-center overflow-hidden bg-white"
        >
          <div ref={markRef} className="invisible">
            <LogoMark
              style={{ width: MARK_SIZE, height: MARK_SIZE }}
              className="text-[#131313]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
