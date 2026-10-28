export type StackCard = {
  index: string;

  eyebrow: string;

  title: string;

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

export const stackIntro = {
  label: "Lo que ponemos sobre la mesa",

  overview1: "No partimos de una tecnología de moda para buscar dónde meterla.",
  overview2:
    "Partimos del problema de tu sector y elegimos, de esta lista, solo lo que se necesita.",

  brandWord: "tecnología\ny\nsectores",
};
