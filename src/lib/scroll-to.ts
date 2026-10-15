"use client";

import type Lenis from "lenis";

/** Alto aprox. del navbar fijo, para no dejar la sección justo debajo de él. */
const NAV_OFFSET = -96;

let lenisInstance: Lenis | null = null;

/** El provider de smooth scroll registra aquí su instancia de Lenis. */
export function setLenis(l: Lenis | null) {
  lenisInstance = l;
}

// --- Bloqueo de scroll de la página (p. ej. mientras un panel/modal está abierto) ---
let lockCount = 0;

/**
 * Congela el scroll de la página: pausa Lenis y bloquea el overflow nativo (para
 * el fallback sin Lenis y para que no se filtre el scroll nativo). Un contenedor
 * `position: fixed` con su propio `overflow-y-auto` sigue scrolleando aparte.
 */
export function lockScroll() {
  if (typeof document === "undefined") return;
  lockCount++;
  if (lockCount > 1) return;

  lenisInstance?.stop();
  const sbw = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = "hidden";
  if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
}

/** Restaura el scroll de la página. */
export function unlockScroll() {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  document.documentElement.style.overflow = "";
  document.body.style.paddingRight = "";
  lenisInstance?.start();
}

/**
 * Va a una sección de la landing desde donde sea.
 *
 * Si ya estamos en la home hace scroll suave; si estamos en otra ruta (por
 * ejemplo /sectores) la sección no existe en el DOM, así que navega a la home
 * con el hash y deja que el navegador salte allí. Sin esto, los enlaces de la
 * navbar simplemente no hacían nada fuera de la home.
 */
export function scrollToSection(hash: string) {
  if (typeof window === "undefined") return;

  if (window.location.pathname !== "/") {
    window.location.href = `/${hash}`;
    return;
  }
  scrollToTarget(hash);
}

/** Scroll suave a una sección (selector `#id` o elemento), con offset del navbar. */
export function scrollToTarget(target: string | HTMLElement) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset: NAV_OFFSET, duration: 1.2 });
    return;
  }

  // Fallback sin Lenis (p. ej. reduced motion): scroll nativo con el mismo offset.
  const el =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : target;
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET;
  window.scrollTo({ top: y, behavior: "smooth" });
}

/**
 * Salta al tope SIN animación. Para usar mientras algo tapa la pantalla (la
 * cortina de la transición de página): con scroll suave se vería a la nueva
 * página subiendo sola en cuanto se destapa.
 */
export function jumpToTop() {
  if (typeof window === "undefined") return;
  if (lenisInstance) {
    // `force: true` es imprescindible, no un extra. Esta función se usa con la
    // cortina puesta, y para ponerla `lockScroll` ha llamado a `lenis.stop()`:
    // un Lenis parado IGNORA `scrollTo`. Sin esto el salto no ocurría, la
    // página nueva se destapaba a la altura de scroll de la anterior, y todo lo
    // que depende del scroll —entradas, pins, posiciones— aparecía a destiempo
    // o a medio colocar hasta recargar.
    lenisInstance.scrollTo(0, { immediate: true, force: true });
    return;
  }
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

/** Scroll suave hasta el tope de la página (logo). */
export function scrollToTop() {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { duration: 1.2 });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}
