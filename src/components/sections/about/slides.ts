/** Fragmento de frase con dos tonos: `start` en negro, `fade` en gris. */
export type PhrasePart = {
  start: string;
  fade: string;
};

/** Frase grande de la derecha — ESTÁTICA (no cambia con el slider). */
export const mainPhrase: { intro: PhrasePart[]; outro: PhrasePart } = {
  intro: [
    {
      start:
        "Great founders changing the world deserve a presence as powerful as what",
      fade: "they're building.",
    },
    {
      start:
        "Most founders we work with are building something significant but their website",
      fade: "doesn't show it yet.",
    },
  ],
  outro: {
    start: "That gap costs more than revenue. It costs the",
    fade: "certainty that your brand is finally being understood.",
  },
};

/** Autor de la frase — estático. */
export const founder = {
  name: "Tania Barron (Lorem impsum)",
  title: "Founder, BLOXTEK",
};

/** Stats de la izquierda — ROTAN con las flechas / la barra. */
export type Stat = {
  stat: string;
  caption: string;
};

export const aboutStats: Stat[] = [
  {
    stat: "+15",
    caption:
      "Founder-led brands from disruptive creative agencies to consumer brands",
  },
  {
    stat: "+40",
    caption: "B2B brands scaled with full-funnel marketing engines",
  },
  {
    stat: "3x",
    caption: "Average pipeline growth within 90 days of launch",
  },
];
