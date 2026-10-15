"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NoiseBackground } from "@/components/ui/noise-background";
import { cx } from "@/components/ui/icon-glyph-styles";
import { approachCards } from "./slides";
import { Card } from "./card";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Píxeles por segundo del desfile. Lento: son cartas para leer al pasar. */
const SPEED = 38;

/**
 * Efecto de cuadro colgado.
 *
 * Cada carta pivota sobre el centro de su borde superior —el clavo—. Lo que la
 * inclina NO es la velocidad del desfile, sino la velocidad *extra*: el desfile
 * constante es ya su posición de reposo, igual que un cuadro en un tren a
 * velocidad fija cuelga recto. Solo las aceleraciones lo mueven.
 *
 * La vuelta al reposo es un resorte amortiguado de verdad, integrado a mano. Se
 * descartó un ease elástico porque obliga a fijar una duración, y aquí el
 * empujón puede cambiar a mitad del recorrido: el resorte absorbe eso sin
 * reiniciar nada.
 */
const SWING = {
  /** Rigidez del resorte. Más bajo = vuelta más larga y más mecida. */
  stiffness: 60,
  /** Amortiguación. Más bajo = más oscilaciones antes de parar. */
  damping: 7.5,
  /** Grados de inclinación por cada píxel/segundo de velocidad extra. */
  tiltPerVelocity: 0.008,
  /** Tope de inclinación, en grados. */
  maxTilt: 9,
  /**
   * Píxeles/segundo de empuje por cada píxel/segundo de scroll. El scroll no
   * cambia la velocidad del bucle: suma un desplazamiento propio que se apaga,
   * así que al parar el desfile vuelve solo a su marcha de siempre.
   */
  scrollToPush: 0.55,
  /** Tope del empuje, en px/s. El desfile de base va a SPEED. */
  maxPush: 900,
  /** Fracción del empuje que sobrevive cada segundo. Media vida: ~0,27 s. */
  pushDecay: 0.08,
} as const;

/**
 * Posición de cada carta: desnivel, inclinación, tono y orden de apilado. Es lo
 * que las saca de la fila recta y hace que parezcan repartidas sobre una mesa.
 *
 * `h` y `height` son el mismo alto dos veces: Tailwind necesita la clase
 * literal, y el cálculo de abajo necesita el número. Si se cambia uno hay que
 * cambiar el otro —el mismo acuerdo que ADVANCE y ADVANCE_PX.
 *
 * El `z` alterna a propósito: con todas al mismo nivel, cada carta taparía
 * siempre a la anterior y el solape se leería como una baraja ordenada. Al
 * alternarlo, unas pasan por encima y otras por debajo.
 */
const LAYOUT = [
  { y: 72, rotate: -3, tone: "light", z: 2, h: "h-[23rem]", height: 368 },
  { y: -64, rotate: 2.5, tone: "green", z: 1, h: "h-[27rem]", height: 432 },
  { y: 48, rotate: 2, tone: "light", z: 3, h: "h-[25rem]", height: 400 },
  { y: -80, rotate: -2.5, tone: "green", z: 1, h: "h-[24rem]", height: 384 },
] as const;

/**
 * Corrección de centrado óptico.
 *
 * Los desniveles de arriba son transforms, y los transforms no cuentan para el
 * layout: `items-center` centra la CAJA del track —que mide lo que la carta más
 * alta— y no la mancha que las cartas ocupan de verdad, que los desniveles
 * estiran hacia arriba y hacia abajo en cantidades distintas. El resultado era
 * un hueco mayor abajo que arriba.
 *
 * Esto mide esa mancha y devuelve cuánto hay que bajar el track para que su
 * centro óptico caiga en el centro de la franja. Se calcula de LAYOUT en vez de
 * fijar un número a mano para que siga cuadrando si se retocan los desniveles.
 */
const CENTER_FIX = (() => {
  const box = Math.max(...LAYOUT.map((l) => l.height));
  const top = Math.min(...LAYOUT.map((l) => l.y));
  const bottom = Math.max(...LAYOUT.map((l) => l.y + l.height));
  return (box - (top + bottom)) / 2;
})();

/**
 * El desnivel y la inclinación de reposo los pone GSAP, no el estilo inline.
 *
 * Es obligado: en cuanto GSAP toca el transform de un elemento, absorbe sus
 * propiedades `rotate`/`translate` dentro de `transform` y las anula. Dejarlas
 * en el estilo significaba que la inclinación por inercia borraba la de reposo.
 * Con todo en manos de GSAP, se suman donde tienen que sumarse: en el número.
 */

/**
 * Cuánto avanza el desfile por carta. Es MENOR que el ancho de la carta
 * (22rem), y esa diferencia es justo el solape. Con los desniveles y las
 * alturas variadas de arriba, lo que se cruza son esquinas, no el texto.
 *
 * Va como ancho fijo del envoltorio y no como margen negativo: así cada hueco
 * aporta exactamente lo mismo y el 50% del recorrido sigue cayendo donde
 * empieza la copia. Con márgenes, el bucle vuelve a dar el salto de cada vuelta.
 */
const ADVANCE = "w-[20.8rem]";
/** El mismo avance en píxeles, para calcular cuántas copias hacen falta. */
const ADVANCE_PX = 20.8 * 16;

/**
 * Las cuatro formas de trabajo, como cartas repartidas que desfilan de derecha
 * a izquierda. Sube por encima de `ApproachIntro` (que queda sticky detrás)
 * tapándolo: de ahí el z-10, el fondo opaco y el margen superior.
 */
export function ApproachCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  /**
   * Cuántas veces se repite la tanda de cartas.
   *
   * El tween recorre el 50% del track, o sea la mitad de las copias. Esa mitad
   * tiene que medir AL MENOS lo que la pantalla: si se queda corta, al dar la
   * vuelta el salto hacia atrás es menor que el ancho visible y se ve el hueco
   * del final y el pop de la primera carta entrando de golpe.
   *
   * Cuatro cartas ocupan ~1216px, así que con dos copias se quedaba corto en
   * cualquier monitor. Se calcula en cliente porque depende del viewport.
   */
  const [copies, setCopies] = useState(2);

  useEffect(() => {
    const copyWidth = approachCards.length * ADVANCE_PX;
    const sync = () => {
      // +1 de margen para que nunca se vea el borde de la última copia.
      const needed = 2 * (Math.ceil(window.innerWidth / copyWidth) + 1);
      setCopies((c) => (c === needed ? c : needed));
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  // Desfile infinito de derecha a izquierda.
  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      // El tween se crea DESPUÉS de las fuentes, y este efecto se vuelve a
      // ejecutar cuando cambia el número de copias. Sin esta bandera, la
      // promesa de la ejecución vieja resuelve igualmente tras la limpieza y
      // crea un segundo tween sobre el mismo track: dos animaciones peleando
      // por `xPercent`, y el arrastre pausando solo una de ellas.
      let cancelled = false;

      const run = () => {
        if (cancelled || !trackRef.current) return;
        // Contenido duplicado: recorrer el 50% deja un frame idéntico al
        // inicial, así que el bucle no tiene costura.
        const half = track.scrollWidth / 2;
        if (!half) return;

        gsap.to(track, {
          xPercent: -50,
          ease: "none",
          duration: half / SPEED,
          repeat: -1,
        });
      };

      // Las cartas llevan texto: medir antes de que carguen las fuentes da un
      // ancho equivocado y la velocidad sale mal.
      const fonts = document.fonts?.ready ?? Promise.resolve();
      void fonts.then(run);

      return () => {
        cancelled = true;
        // Por si quedara alguno suelto de una ejecución anterior.
        gsap.killTweensOf(track);
      };
    },
    { scope: trackRef, dependencies: [copies] },
  );

  // Reposo, arrastre e inercia: un solo mecanismo.
  //
  // El tween del bucle corre siempre a velocidad constante y nadie lo toca. Las
  // tres veces que algo intentó gobernarlo por dentro —`progress`, `totalTime`,
  // `timeScale`— acabó peleándose con él. Aquí todo lo demás es un `x` en
  // píxeles sobre el mismo track: GSAP guarda `x` y `xPercent` por separado y
  // los compone, así que conviven sin pisarse.
  //
  // Ese `x` lo escribe SOLO este bucle de ticker, con un único acumulador. Por
  // eso el arrastre, el empuje del scroll y el impulso al soltar son la misma
  // magnitud en vez de tres sistemas compitiendo por la misma propiedad.
  useGSAP(
    () => {
      const track = trackRef.current;
      const zone = dragRef.current;
      const section = sectionRef.current;
      if (!track || !zone || !section) return;

      const swings = gsap.utils.toArray<HTMLElement>(track.children);
      const bases = swings.map((_, i) => LAYOUT[i % LAYOUT.length].rotate);
      const tilters = swings.map((el) =>
        gsap.quickSetter(el, "rotation", "deg"),
      );

      // Posición de reposo: desnivel, inclinación y el clavo arriba al centro.
      swings.forEach((el, i) => {
        gsap.set(el, {
          y: LAYOUT[i % LAYOUT.length].y,
          rotation: bases[i],
          transformOrigin: "50% 0%",
        });
      });

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      // Las cartas se quedan colocadas, pero quietas: sin desfile no hay
      // inercia que simular, y mecerlas sería justo lo que se pidió evitar.
      if (reduce) return;

      const setX = gsap.quickSetter(track, "x", "px");

      /** Desplazamiento acumulado, en px. Lo único que escribe `x`. */
      let offset = 0;
      /** Empuje vivo en px/s: lo llena el scroll y el impulso al soltar. */
      let push = 0;
      /** Inclinación actual y su velocidad angular: el estado del resorte. */
      let tilt = 0;
      let tiltVel = 0;

      let dragging = false;
      let startX = 0;
      let startOffset = 0;
      let lastX = 0;
      let lastT = 0;
      /** Velocidad del gesto en px/s, medida entre eventos de puntero. */
      let dragVel = 0;

      /** Fuera de pantalla no hay nada que mecer. */
      let active = true;

      /** Ancho de UNA tanda de cartas, medido del DOM. */
      const batchWidth = () => {
        const batches = track.children.length / approachCards.length;
        return batches ? track.scrollWidth / batches : 0;
      };

      const frame = () => {
        if (!active) return;
        // Tope al delta: una pestaña en segundo plano devuelve saltos enormes,
        // y con ellos la integración del resorte explota.
        const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 1 / 20);
        const decay = Math.pow(SWING.pushDecay, dt);

        if (dragging) {
          // Si el dedo se queda quieto sin soltar, el gesto deja de inclinar.
          dragVel *= decay;
        } else {
          push *= decay;
          offset += push * dt;
        }

        const batch = batchWidth();
        if (batch) {
          // El contenido se repite exactamente cada tanda, así que saltar justo
          // esa distancia es invisible: de ahí el arrastre sin fin.
          offset = gsap.utils.wrap(-batch, 0, offset);
          setX(offset);
        }

        // Velocidad EXTRA sobre el desfile de base. Positiva = hacia la
        // derecha, y entonces el bajo de la carta se queda a la izquierda: de
        // ahí el signo invertido.
        const extra = dragging ? dragVel : push;
        const target = gsap.utils.clamp(
          -SWING.maxTilt,
          SWING.maxTilt,
          -extra * SWING.tiltPerVelocity,
        );

        tiltVel +=
          ((target - tilt) * SWING.stiffness - tiltVel * SWING.damping) * dt;
        tilt += tiltVel * dt;

        for (let i = 0; i < tilters.length; i++) tilters[i](bases[i] + tilt);
      };

      gsap.ticker.add(frame);

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          active = self.isActive;
        },
        onUpdate: (self) => {
          // Mientras la mano arrastra, manda la mano.
          if (dragging) return;
          // Velocidad positiva al bajar; el empuje va a la izquierda, o sea
          // negativo. Al subir se invierte solo, y en cuanto el scroll para el
          // empuje se apaga y el desfile sigue a la izquierda como siempre.
          push = -gsap.utils.clamp(
            -SWING.maxPush,
            SWING.maxPush,
            self.getVelocity() * SWING.scrollToPush,
          );
        },
      });

      // Arrastre. En horizontal no estorba al scroll de la página (eso sí lo
      // haría uno vertical), así que aquí sí merece la pena.
      const onDown = (e: PointerEvent) => {
        dragging = true;
        startX = lastX = e.clientX;
        lastT = e.timeStamp;
        startOffset = offset;
        // El empuje heredado se descarta: a partir de aquí la posición la fija
        // el dedo, y sumarle inercia vieja haría que se escapara de la mano.
        push = 0;
        dragVel = 0;
        zone.setPointerCapture(e.pointerId);
        zone.style.cursor = "grabbing";
      };

      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const batch = batchWidth();
        if (!batch) return;

        // Sigue al dedo 1:1, sin factores que calibrar.
        offset = gsap.utils.wrap(-batch, 0, startOffset + (e.clientX - startX));

        // Suelo al intervalo: dos eventos en el mismo milisegundo darían una
        // velocidad infinita.
        const dt = Math.max(e.timeStamp - lastT, 8) / 1000;
        dragVel = (e.clientX - lastX) / dt;
        lastX = e.clientX;
        lastT = e.timeStamp;
      };

      const onUp = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        // El gesto se convierte en empuje: al soltar en movimiento, el desfile
        // se lleva el impulso y se va apagando. Es el mismo canal que el
        // scroll, así que la inclinación sigue saliendo sola.
        push = dragVel;
        if (zone.hasPointerCapture(e.pointerId)) {
          zone.releasePointerCapture(e.pointerId);
        }
        zone.style.cursor = "";
      };

      zone.addEventListener("pointerdown", onDown);
      zone.addEventListener("pointermove", onMove);
      zone.addEventListener("pointerup", onUp);
      zone.addEventListener("pointercancel", onUp);

      return () => {
        gsap.ticker.remove(frame);
        st.kill();
        zone.removeEventListener("pointerdown", onDown);
        zone.removeEventListener("pointermove", onMove);
        zone.removeEventListener("pointerup", onUp);
        zone.removeEventListener("pointercancel", onUp);
      };
    },
    { scope: sectionRef, dependencies: [copies] },
  );

  return (
    <section
      ref={sectionRef}
      id="approach"
      // mt: el hueco con el título de arriba y, a la vez, el colchón de scroll
      // antes de que las cartas empiecen a taparlo.
      className="relative z-10 mt-[150px] flex min-h-screen flex-col overflow-hidden bg-[#131313] text-white"
      aria-label="Cuatro formas de trabajo"
    >
      {/* Ruido local: sobre el fondo negro, con blend que aclara para que se vea. */}
      <NoiseBackground
        className="absolute inset-0 h-full w-full mix-blend-screen"
        opacity={0.05}
      />

      {/* divisor: respeta el ancho del contenedor */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-white/10" />
      </div>

      {/* --- La franja ---
          Ocupa el alto que sobra y centra el desfile. El desfile sale del
          contenedor a propósito: las cartas tienen que entrar y salir por los
          bordes de la pantalla, no por los márgenes del grid. */}
      <div
        ref={dragRef}
        className="relative z-10 flex flex-1 touch-pan-y items-center py-12"
      >
        <div
          ref={trackRef}
          className="flex w-max will-change-transform"
          // Margen y no transform: `x` ya está ocupado por el desfile.
          style={{ marginTop: CENTER_FIX }}
        >
          {Array.from({ length: copies }, (_, copy) =>
            approachCards.map((card, i) => {
              const { tone, z, h } = LAYOUT[i % LAYOUT.length];
              return (
                <div
                  key={`${copy}-${card.title}`}
                  className={cx("relative", ADVANCE)}
                  // Solo el apilado: el desnivel y la inclinación los coloca
                  // GSAP, por lo explicado en LAYOUT.
                  style={{ zIndex: z }}
                  // La segunda copia solo cierra el bucle.
                  // Solo la primera tanda se anuncia: el resto son el bucle.
                  aria-hidden={copy > 0 || undefined}
                >
                  <Card {...card} tone={tone} index={i} className={h} />
                </div>
              );
            }),
          )}
        </div>
      </div>
    </section>
  );
}
