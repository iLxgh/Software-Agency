/**
 * Tiempos compartidos para la animación de entrada del sitio (en segundos).
 * Ajusta aquí los delays/duraciones para recalibrar la "armonía" y la suavidad.
 */
export const ENTRANCE = {
  ease: "power3.out",

  /**
   * Cuánto esperan las entradas que arrancan CON LA CARGA de la página —el
   * hero y el navbar— antes de empezar.
   *
   * Cae donde la pantalla de carga (`providers/preloader.tsx`) empieza a
   * abrirse —no al final de su coreografía—, para que el hero esté entrando
   * mientras el fuego descubre la página en vez de aparecer ya terminado. Con
   * sus tiempos actuales la salida arranca a los 3.6s.
   *
   * Va en pareja con el montaje de `<Preloader />` en `app/layout.tsx`: si se
   * quita la pantalla, esto vuelve a 0, o el hero tarda tres segundos en
   * aparecer sin motivo.
   *
   * Solo se le suma a los retrasos ABSOLUTOS desde la carga. Los que son
   * relativos entre sí (el navbar calcula varios como diferencias) no la
   * necesitan, porque la diferencia no cambia. Y `sectors` usa `tagline` como
   * retraso de una entrada que dispara la cortina de transición, no la carga:
   * ahí se usa el valor crudo a propósito.
   */
  gate: 3.6,

  // Delays de arranque de cada bloque
  navbar: 0.15,
  // Textos de la navbar: sincronizados con los textos del hero
  navText: 0.55,
  navTextStagger: 0.05,
  tagline: 0.55,
  title: 0.7,
  description: 1.15,
  cta: 1.4,
  card: 1.05,

  // Duraciones — más largas = entrada más suave
  navbarDuration: 1.4,
  cardDuration: 1.2,

  // Pop de íconos (escala + rotación con rebote)
  icon: {
    ease: "back.out(1.6)",
    duration: 0.7,
    // delays por ícono
    check: 0.7,
    talk: 0.95,
    sound: 1.05,
    discover: 1.55,
    card: 1.6,
  },
} as const;
