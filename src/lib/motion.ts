/**
 * Tiempos compartidos para la animación de entrada del sitio (en segundos).
 * Ajusta aquí los delays/duraciones para recalibrar la "armonía" y la suavidad.
 */
export const ENTRANCE = {
  ease: "power3.out",

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
