/**
 * PENDIENTE — todo el copy de esta sección lo redacté yo.
 *
 * VOZ: neutra, a propósito. Una versión anterior ponía los síntomas entre
 * comillas, como frases dichas por clientes en la primera llamada ("lo que nos
 * cuentan"). Se descartó porque eso es una afirmación sobre HECHOS —reuniones
 * concretas, cosas que alguien dijo de verdad— y quien escribe la landing no ha
 * estado en ellas. No es lo mismo que afirmar un método, que es lo que hace el
 * resto de la web y lo que Bloxtek sí puede sostener.
 *
 * Por eso ahora son SITUACIONES enunciadas en impersonal: describen un estado
 * de cosas que el visitante reconoce o no, sin atribuirle a nadie haberlo
 * dicho. Si más adelante alguien de Bloxtek confirma que estas frases son las
 * que escucha en las reuniones, se pueden volver a entrecomillar — pero esa
 * decisión la tiene que tomar quien habla con los clientes.
 *
 * Ninguna promete capacidades: cada una apunta a algo que ya está en el stack
 * (firma NOM-151, trazabilidad, expedientes, credenciales verificables).
 */

export const problemIntro = {
  /** Etiqueta junto a la palomita. */
  label: "Antes de proponer nada.",
  /**
   * El titular. La versión anterior era "Casi nunca es la tecnología." y se
   * cambió porque no se entendía sola: fuera de contexto no decía de qué
   * hablaba ni qué venía después. Esta anuncia literalmente lo que el visitante
   * va a leer —cuatro señales— y deja la tesis a la vista.
   */
  titleLead: "Cuatro señales de que el problema",
  titleAccent: "no está en el software.",
  /**
   * Bajada mínima. Está para que el titular no quede solo y para enlazar con
   * las tarjetas. Es un argumento, no una afirmación sobre hechos, y entrega el
   * relevo al "primero entender" de la sección siguiente.
   */
  subtitle:
    "Si reconoces alguna, el punto de partida no es elegir tecnología: es entender dónde se rompe el proceso.",

  /** Rótulos de las tarjetas: nombran la relación entre los dos textos. */
  signalTag: "La situación",
  causeTag: "El problema de fondo",
};

export type Symptom = {
  /** Numeración visible. */
  index: string;
  /** La situación, en impersonal. Corta: tiene que leerse de un vistazo. */
  signal: string;
  /** Qué hay detrás de esa situación. */
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
