"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cx } from "./icon-glyph-styles";

gsap.registerPlugin(useGSAP);

type FollowCursorProps = {
  /** Lo que se dibuja dentro del cursor (un icono, normalmente). */
  children: ReactNode;
  /** Zona que lo activa. Al entrar aparece; al salir, desaparece. */
  className?: string;
  /** Contenido normal de la zona. */
  content: ReactNode;
};

/**
 * Cursor personalizado que sigue al puntero.
 *
 * Un `cursor: url()` de CSS no se puede animar: el navegador lo cambia de golpe
 * y no hay estados intermedios. Para que entre y salga con transición hace
 * falta un elemento de verdad, y eso es esto.
 *
 * El seguimiento va con `quickTo`, que interpola hacia la última posición en
 * lugar de saltar a ella: de ahí el retardo suave. El cursor nativo se oculta
 * dentro de la zona para que no se vean los dos.
 */
export function FollowCursor({
  children,
  className,
  content,
}: FollowCursorProps) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const zone = zoneRef.current;
      const dot = dotRef.current;
      if (!zone || !dot) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Sin puntero fino (móvil, tablet) no hay hover que valga: ni se monta.
      const fine = window.matchMedia("(pointer: fine)").matches;
      if (reduce || !fine) return;

      // Centrado en el puntero y escondido de inicio.
      gsap.set(dot, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
      zone.style.cursor = "none";

      // quickTo mantiene un tween vivo y le va cambiando el destino: mucho más
      // barato que crear un tween por cada mousemove, y da el arrastre suave.
      const moveX = gsap.quickTo(dot, "x", { duration: 0.45, ease: "power3" });
      const moveY = gsap.quickTo(dot, "y", { duration: 0.45, ease: "power3" });

      const onMove = (e: PointerEvent) => {
        moveX(e.clientX);
        moveY(e.clientY);
      };

      const onEnter = (e: PointerEvent) => {
        // Se coloca de golpe en el punto de entrada: si no, el cursor viaja
        // desde donde se quedó la última vez y se ve volar por la pantalla.
        gsap.set(dot, { x: e.clientX, y: e.clientY });
        gsap.to(dot, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
          // "auto" y no `true`: `true` mata TODOS los tweens del elemento,
          // incluidos los de quickTo que mueven x/y — y el cursor se quedaba
          // clavado donde entró. "auto" solo pisa las propiedades que coinciden.
          overwrite: "auto",
        });
      };

      const onLeave = () => {
        gsap.to(dot, {
          scale: 0,
          autoAlpha: 0,
          duration: 0.35,
          ease: "power3.in",
          overwrite: "auto",
        });
      };

      zone.addEventListener("pointermove", onMove);
      zone.addEventListener("pointerenter", onEnter);
      zone.addEventListener("pointerleave", onLeave);

      return () => {
        zone.removeEventListener("pointermove", onMove);
        zone.removeEventListener("pointerenter", onEnter);
        zone.removeEventListener("pointerleave", onLeave);
        zone.style.cursor = "";
      };
    },
    { scope: zoneRef },
  );

  return (
    <div ref={zoneRef} className={className}>
      {content}

      {/* fixed + pointer-events-none: flota sobre todo y nunca se interpone
          entre el cursor y lo que hay debajo. */}
      <div
        ref={dotRef}
        aria-hidden
        className={cx(
          "pointer-events-none fixed top-0 left-0 z-50 grid size-11 place-items-center",
          "rounded-full bg-brand text-brand-foreground shadow-[0_4px_20px_rgba(0,0,0,0.2)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
