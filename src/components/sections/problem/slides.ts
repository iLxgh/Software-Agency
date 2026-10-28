export const problemIntro = {
  label: "Antes de proponer nada.",

  titleLead: "Cuatro señales de que el problema",
  titleAccent: "no está en el software.",

  subtitle:
    "Si reconoces alguna, el punto de partida no es elegir tecnología: es entender dónde se rompe el proceso.",

  signalTag: "La situación",
  causeTag: "El problema de fondo",
};

export type Symptom = {
  index: string;

  signal: string;

  cause: string;
};

export const symptoms: Symptom[] = [
  {
    index: "01",
    signal: "Circulan tres versiones y ninguna manda.",
    cause:
      "No hay una fuente única: cada copia es tan válida como las demás, y cuál es la buena se decide de memoria.",
  },
  {
    index: "02",
    signal: "El sistema está, pero el trabajo va por fuera.",
    cause:
      "El software se eligió sin mirar el proceso real, así que el proceso real lo esquiva con hojas de cálculo.",
  },
  {
    index: "03",
    signal: "Si falta una persona, el trámite se detiene.",
    cause:
      "El procedimiento vive en la cabeza de alguien y no en un sistema que lo sostenga.",
  },
  {
    index: "04",
    signal: "Demostrar quién aprobó qué toma días.",
    cause:
      "Sin rastro verificable, cada auditoría o reclamación se reconstruye a mano.",
  },
];
