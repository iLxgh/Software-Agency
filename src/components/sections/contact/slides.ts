/**
 * PENDIENTE — todo el copy de esta sección lo redacté yo a partir de lo que
 * pediste (el título del formulario) y del tono de Trust. Cámbialo cuando
 * tengas el definitivo.
 */

export const contactIntro = {
  label: "Hablemos",
  /** Etiquetas cortas bajo el párrafo. */
  reassurances: ["30 minutos", "Sin compromiso", "Respondemos en 24 h"],
};

export type CallStep = {
  number: string;
  title: string;
  body: string;
};

/** Qué pasa en la llamada, en orden. */
export const callSteps: CallStep[] = [
  {
    number: "01",
    title: "Descubrimiento",
    body: "Entendemos tu operación, los sistemas que ya usas y dónde está el cuello de botella.",
  },
  {
    number: "02",
    title: "Diagnóstico",
    body: "Revisamos si el problema pide blockchain, software a medida o ninguna de las dos.",
  },
  {
    number: "03",
    title: "Propuesta",
    body: "Alcance, tiempos y costos por escrito. Sin letras chiquitas.",
  },
];

/** Etapa del proyecto: chips del paso 2, para no obligar a escribirlo todo. */
export const projectStages = [
  "Explorando",
  "Proyecto definido",
  "Ya en marcha",
];
