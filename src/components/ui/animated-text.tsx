"use client";

import { createElement, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

type SplitType = "words" | "chars" | "lines";

type AnimatedTextProps = {
  children: ReactNode;
  /** Etiqueta a renderizar (p, h1, span, ...). Default: "p". */
  as?: ElementType;
  className?: string;
  /** Unidad de animación. Default: "words". */
  split?: SplitType;
  /**
   * Desplazamiento inicial de cada unidad, en % de su propio alto.
   * Positivo = entra desde abajo; negativo = entra desde arriba.
   */
  from?: number;
  duration?: number;
  /** Segundos entre cada unidad. */
  stagger?: number;
  /** Retraso antes de arrancar (para escalonar con otros componentes). */
  delay?: number;
  ease?: string;
  /**
   * Píxeles extra de "aire" bajo cada unidad dentro de la máscara.
   * Útil para fuentes con descendentes/itálicas que se recortan (ej. Baskerville).
   * Se compensa con margin negativo para no alterar el layout.
   */
  maskPadBottom?: number;
};

/**
 * Texto con entrada tipo "mask reveal": divide el contenido en palabras/letras/líneas
 * (cada una dentro de una máscara overflow-hidden vía SplitText) y las hace entrar
 * con desplazamiento vertical y stagger. Reutilizable en cualquier texto.
 */
export function AnimatedText({
  children,
  as = "p",
  className,
  split = "words",
  from = 100,
  duration = 1.1,
  stagger = 0.09,
  delay = 0,
  ease = "power3.out",
  maskPadBottom = 0,
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      // Oculta antes del primer paint (solo si hay JS) para evitar flash del texto.
      gsap.set(el, { autoAlpha: 0 });

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      let instance: SplitText | null = null;

      const run = () => {
        if (!ref.current) return;
        instance = new SplitText(el, { type: split, mask: split });
        const targets =
          split === "chars"
            ? instance.chars
            : split === "lines"
              ? instance.lines
              : instance.words;

        // Extiende la máscara hacia abajo para no recortar descendentes/itálicas.
        if (maskPadBottom) {
          targets.forEach((t) => {
            const unit = t as HTMLElement;
            unit.style.paddingBottom = `${maskPadBottom}px`;
            const mask = unit.parentElement;
            if (mask) mask.style.marginBottom = `${-maskPadBottom}px`;
          });
        }

        gsap.set(el, { autoAlpha: 1 });
        if (reduce) return; // deja el texto visible sin movimiento

        gsap.from(targets, { yPercent: from, duration, stagger, delay, ease });
      };

      // Espera a que las fuentes carguen para que el split use el layout final.
      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => instance?.revert();
    },
    { scope: ref }
  );

  return createElement(as, { ref, className }, children);
}
