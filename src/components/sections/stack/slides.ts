export type StackCard = {
  /** Numeración visible de la card. */
  index: string;
  /** Etiqueta corta encima del título. */
  eyebrow: string;
  /** Admite salto de línea (\n) para controlar el corte. */
  title: string;
  /** Cada elemento se pinta como un badge. */
  items: string[];
};

export const stackCards: StackCard[] = [
  {
    index: "01",
    eyebrow: "Stack",
    title: "Tecnología\nque dominamos",
    items: [
      "Blockchain (LACNet)",
      "Firma electrónica NOM-151",
      "Credenciales verificables W3C",
      "Identidad descentralizada (SSI)",
      "KYC y biometría",
      "Smart contracts",
      "IPFS",
      "APIs de integración",
    ],
  },
  {
    index: "02",
    eyebrow: "Sectores",
    title: "Sectores donde\nya trabajamos",
    items: [
      "Legal y Notarías",
      "Fintech",
      "Educación",
      "Inmobiliario",
      "Gobierno",
      "Salud",
      "Turismo y Entretenimiento",
      "Corporativo",
    ],
  },
];

/**
 * Textos de la sección. Los marcados con PENDIENTE los redacté yo para
 * rellenar el formato heredado de Services — cámbialos cuando tengas los
 * definitivos.
 */
export const stackIntro = {
  /** PENDIENTE — etiqueta junto al check. */
  label: "Lo que ponemos sobre la mesa",

  /** Texto central, partido en dos párrafos. */
  overview1:
    "No partimos de una tecnología de moda para buscar dónde meterla.",
  overview2:
    "Partimos del problema de tu sector y elegimos, de esta lista, solo lo que se necesita.",

  /** Palabra gigante de fondo, arriba a la derecha. Un renglón por línea. */
  brandWord: "tecnología\ny\nsectores",
};
