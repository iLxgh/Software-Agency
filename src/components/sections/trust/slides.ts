import { images } from "@/lib/assets";

export type TrustCard = {
  index: string;

  eyebrow: string;

  headline: string;

  support: string;

  badges: string[];
  tone: "light" | "dark";
};

export const TONES = {
  light: {
    bg: "var(--trust-light)",

    logoFrom: "var(--trust-light)",
    logoTo: "var(--trust-light-fade)",
    logo: `${images.fadedLogo}/logo-bloxtek-desvanecido-1.png`,
  },
  dark: {
    bg: "var(--trust-dark)",
    logoFrom: "var(--trust-dark)",
    logoTo: "var(--trust-dark-fade)",
    logo: `${images.fadedLogo}/logo-bloxtek-desvanecido-2.png`,
  },
} as const;

export const trustIntro = {
  label: "Nuestros compromisos.",
};

export const trustCards: TrustCard[] = [
  {
    index: "01",
    eyebrow: "Honestidad",
    headline: "Si tu problema no necesita blockchain, **te lo decimos**.",
    support:
      "Preferimos perder un proyecto antes que venderte una tecnología que no necesitas.",
    badges: ["Diagnóstico primero", "Alcance real", "Sin humo"],
    tone: "light",
  },
  {
    index: "02",
    eyebrow: "Cumplimiento",
    headline: "Cumplimos tiempos y calidad medible, **sin letras chiquitas**.",
    support:
      "Entregables, fechas y criterios de aceptación por escrito desde el primer día.",
    badges: ["Hitos definidos", "Calidad medible", "Sin sorpresas"],
    tone: "dark",
  },
  {
    index: "03",
    eyebrow: "Cercanía",
    headline: "Nos adaptamos a **tus zonas horarias** y a tu equipo.",
    support:
      "Trabajamos en tu huso horario y con las herramientas que tu equipo ya usa.",
    badges: ["Tu horario", "Tus herramientas", "Equipo integrado"],
    tone: "light",
  },
  {
    index: "04",
    eyebrow: "Lenguaje",
    headline:
      "Hablamos **el idioma del negocio**, no solo el de la tecnología.",
    support:
      "Traducimos la parte técnica a decisiones que puedas defender en tu comité.",
    badges: ["Sin jerga", "Caso de negocio", "Decisiones claras"],
    tone: "dark",
  },
];
