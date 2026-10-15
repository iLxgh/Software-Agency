export type ApproachCard = {
  /** Disciplina a la que pertenece la tarjeta; va encima del título. */
  area: string;
  title: string;
  /**
   * Texto que entra al hacer hover. Cada salto de línea es un renglón propio,
   * así que sirve para listas cortas (ver la 4ª tarjeta).
   */
  description: string;
  /**
   * Renglones de `description` que van en negrita. Se compara la línea
   * completa, por eso los nombres de proyecto van cada uno en su renglón.
   */
  bold?: string[];
  /**
   * Qué te llevas. Sustituyó a la CTA que había antes: estas tarjetas no son
   * enlaces —son un carrusel que se arrastra—, así que una etiqueta de acción
   * con flecha prometía un clic que no existe. Ver nota en `card.tsx`.
   *
   * PENDIENTE: redactado por inferencia de las descripciones. Validar con
   * Bloxtek que el entregable de cada línea es exactamente este.
   */
  deliverable: string;
};

/** Las cuatro formas de trabajo. */
export const approachCards: ApproachCard[] = [
  {
    area: "Estrategia",
    title: "Consultoría Digital",
    description:
      "¿No sabes por dónde empezar?\nDiagnosticamos tu operación antes de proponer una sola línea de código.",
    deliverable: "Diagnóstico de tu operación y hoja de ruta priorizada",
  },
  {
    area: "Ingeniería",
    title: "Desarrollo a Medida",
    description:
      "Tu proceso no cabe en un software genérico. Lo construimos a la medida de cómo trabajas de verdad.",
    deliverable: "Software propio, con su código y su documentación",
  },
  {
    area: "Integración",
    title: "Soluciones Modulares",
    description:
      "Componentes ya probados que se adaptan a tu operación y funcionan en semanas, no meses.",
    deliverable: "Componentes ya probados, integrados a tus sistemas",
  },
  {
    area: "Producto",
    title: "Plataformas Propias",
    description:
      "Problemas de industria ya resueltos:\nLegalBlox\nEduBlox\nRealVext\nWallox\nlistos para operar.",
    bold: ["LegalBlox", "EduBlox", "RealVext", "Wallox"],
    deliverable: "Una plataforma lista para operar desde el primer día",
  },
];
