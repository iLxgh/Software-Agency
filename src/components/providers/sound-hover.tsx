"use client";

import { useEffect } from "react";
import { playTap, playClick, ensureAmbient } from "@/lib/sound";

/** Elementos clickeables sobre los que suena el tap al hacer hover. */
const SELECTOR = "a[href], button, [role='button']";

/**
 * Escucha global (delegación) que reproduce un tap al entrar con el cursor a
 * cualquier elemento clickeable — navbar, botones, footer, flechas del carrusel,
 * etc. — sin cablear cada componente. Un tap por entrada (no se repite mientras
 * te mueves dentro del mismo elemento).
 */
export function SoundHover() {
  useEffect(() => {
    let current: Element | null = null;

    const onOver = (e: PointerEvent) => {
      const el =
        (e.target as Element | null)?.closest?.(SELECTOR) ?? null;
      if (!el || el === current) return;
      // No suena en botones deshabilitados (ej. flechas del carrusel al tope).
      if (el instanceof HTMLButtonElement && el.disabled) return;
      current = el;
      playTap();
    };

    const onOut = (e: PointerEvent) => {
      if (!current) return;
      const to = e.relatedTarget as Node | null;
      // Al salir realmente del elemento actual, se limpia para permitir que
      // vuelva a sonar si se re-entra.
      if (!to || !current.contains(to)) current = null;
    };

    // Click en un clickeable → main-tap.
    const onDown = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(SELECTOR) ?? null;
      if (!el) return;
      if (el instanceof HTMLButtonElement && el.disabled) return;
      playClick();
    };

    // Arranca el ambiente de fondo en el primer gesto (autoplay bloqueado sin él).
    const startAmbient = () => ensureAmbient();
    window.addEventListener("pointerdown", startAmbient, { once: true });
    window.addEventListener("keydown", startAmbient, { once: true });

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("pointerdown", startAmbient);
      window.removeEventListener("keydown", startAmbient);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return null;
}
