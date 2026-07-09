import { images } from "@/lib/assets";

export type ServiceItem = {
  image: string;
  alt: string;
  title: string;
  description: string;
};

/** Las 4 cards que pasan (pin + scroll) en la sección Services. */
export const serviceCards: ServiceItem[] = [
  {
    image: `${images.services}/Website-Strategy_upscayl_2x_upscayl-standard-4x.png`,
    alt: "Strategy",
    title: "Brand Strategy",
    description:
      "The plan behind the site. Goals, structure, and flow — mapped before a single pixel.",
  },
  {
    image: `${images.services}/website-design_upscayl_2x_upscayl-standard-4x.png`,
    alt: "Design",
    title: "Website Design",
    description:
      "Where form meets feeling. Clean interfaces shaped around how people actually see.",
  },
  {
    image: `${images.services}/web-development_upscayl_2x_upscayl-standard-4x.png`,
    alt: "Development",
    title: "Website Development",
    description:
      "Where form meets feeling. Clean interfaces shaped around how people actually see.",
  },
  {
    image: `${images.services}/Brand-Strategy_upscayl_2x_upscayl-standard-4x.png`,
    alt: "Brand",
    title: "Brand Strategy",
    description:
      "The thinking before the design. Direction, voice, and meaning — defined from the start.",
  },
];

/** Textos de la sección Services — estáticos. */
export const servicesIntro = {
  /** Etiqueta junto al check. */
  label: "What we can help with",
  /** Sub-texto pequeño bajo el titular izquierdo. */
  subtext: "Few services. Full focus. Real range",
  /** Primer párrafo descriptivo. */
  overview1:
    "An open look at what we offer. Strategy, design, and development — brought together with clarity and intent.",
  /** Segundo párrafo (escalonado a la derecha del primero). */
  overview2: "Every service built to stand on its own, and to work as one.",
  /** Palabra de marca gigante de fondo. */
  brandWord: "bloxtek",
};
