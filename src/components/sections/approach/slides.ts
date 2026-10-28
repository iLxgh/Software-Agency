export type ApproachCard = {
  area: string;
  title: string;

  description: string;

  bold?: string[];

  deliverable: string;
};

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
