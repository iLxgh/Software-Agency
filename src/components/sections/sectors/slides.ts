export type Sector = {
  id: string;
  name: string;

  problema: string;

  riesgo: string;

  solucion: string;

  plataforma?: string;
};

export const sectors: Sector[] = [
  {
    id: "legal",
    name: "Legal",
    problema:
      "Operaciones basadas en papel, firmas físicas y archivos no verificables; protocolización manual de actos notariales.",
    riesgo:
      "Los documentos electrónicos sin sellado NOM-151 pierden validez probatoria, y sin trazabilidad blockchain no hay forma de demostrar la integridad documental.",
    solucion:
      "Firma electrónica con estándares NOM-151 y trazabilidad blockchain de cada acto.",
    plataforma: "LegalBlox",
  },
  {
    id: "educativo",
    name: "Educativo",
    problema:
      "Certificaciones en papel o PDF fácilmente falsificables; verificar una credencial toma semanas.",
    riesgo:
      "El fraude académico daña la credibilidad de la institución y los empleadores dejan de confiar en sus títulos.",
    solucion:
      "EduBlox emite credenciales verificables sobre blockchain con estándares W3C Verifiable Credentials.",
    plataforma: "EduBlox",
  },
  {
    id: "inmobiliario",
    name: "Inmobiliario",
    problema:
      "Múltiples documentos físicos, firmas que exigen presencia simultánea y una gestión opaca del expediente.",

    riesgo:
      "Cada firma presencial alarga el cierre y suma un punto donde la operación se puede caer; sin expediente verificable, probar qué se firmó y cuándo depende del archivo físico.",

    solucion:
      "RealVext lleva el ciclo de compraventa y renta a digital: expediente único, firma remota con validez legal y trazabilidad de cada movimiento.",
    plataforma: "RealVext",
  },
  {
    id: "fintech",
    name: "Fintech",
    problema:
      "Necesidad de velocidad frente a cumplimiento regulatorio; fricción en el onboarding y en la firma.",

    riesgo:
      "Un onboarding lento pierde usuarios; uno rápido sin sellado ni trazabilidad deja la operación sin cómo demostrar cumplimiento ante el regulador.",
    solucion:
      "LegalBlox automatiza el ciclo completo: onboarding digital, firma electrónica con sellado NOM-151, trazabilidad de cada transacción y cumplimiento AML integrado.",
    plataforma: "LegalBlox",
  },
  {
    id: "gobierno",
    name: "Gobierno",

    problema:
      "Trámites que siguen pidiendo papel y ventanilla, y expedientes repartidos entre dependencias que no se hablan entre sí.",
    riesgo:
      "Sin identidad digital ni sellado verificable, cada dependencia revalida al ciudadano desde cero y no queda rastro auditable de quién firmó qué ni cuándo.",
    solucion:
      "Identidad digital soberana para el ciudadano, firma de convenios con sellado NOM-151 y trazabilidad blockchain de cada expediente.",
    plataforma: "LegalBlox + Wallox",
  },
];

export type UseCase = {
  perfil: string;
  caso: string;
};

export const useCasesByPlatform: Record<string, UseCase[]> = {
  LegalBlox: [
    {
      perfil: "Corporativo",
      caso: "Firma de contratos laborales, de confidencialidad o de servicio.",
    },
    {
      perfil: "Inmobiliario",
      caso: "Formalización de contratos de compraventa o renta.",
    },
    {
      perfil: "Gobierno",
      caso: "Firma de convenios de colaboración con otras entidades.",
    },
    { perfil: "Legal", caso: "Gestión de contratos con sellado NOM-151." },
    {
      perfil: "Recursos Humanos",
      caso: "Contratación digital masiva con e.firma o biométrica.",
    },
  ],
  EduBlox: [
    {
      perfil: "Centros de capacitación",
      caso: "Certificados digitales de cursos y talleres.",
    },
    {
      perfil: "Educativo",
      caso: "Emisión automática de títulos profesionales verificables.",
    },
    {
      perfil: "Programas de gobierno",
      caso: "Reconocimiento de capacitación laboral y social.",
    },
    {
      perfil: "Grandes empresas",
      caso: "Certificación interna de formaciones obligatorias para empleados.",
    },
    {
      perfil: "Plataformas e-learning",
      caso: "Badges o credenciales para módulos finalizados.",
    },
  ],
  Wallox: [
    {
      perfil: "Legal",
      caso: "Profesionales llevan sus licencias o certificaciones notariales.",
    },
    {
      perfil: "Educativo",
      caso: "Estudiantes almacenan credenciales y certificados emitidos por instituciones.",
    },
    {
      perfil: "Gobierno",
      caso: "Identidad digital soberana para acceso a servicios públicos.",
    },
    {
      perfil: "Salud",
      caso: "Pacientes almacenan seguros, diagnósticos o historiales.",
    },
    {
      perfil: "RH / Corporativo",
      caso: "Gestión de credenciales de empleados: cursos, antigüedad, autorizaciones.",
    },
  ],
  RealVext: [
    {
      perfil: "Desarrolladoras inmobiliarias",
      caso: "Registro y visualización de propiedades en venta con trazabilidad.",
    },
    {
      perfil: "Agencias de renta",
      caso: "Firma y control de contratos de renta con historial de inquilinos.",
    },
    {
      perfil: "Inversionistas",
      caso: "Acceso a propiedades tokenizadas para invertir desde la app.",
    },
    {
      perfil: "Usuarios finales",
      caso: "Consulta segura de propiedades y documentación desde la app.",
    },
    {
      perfil: "Notarías",
      caso: "Validación de documentos antes de la protocolización.",
    },
  ],
};

export const sectorsIntro = {
  label: "Sectores",
  subtitle:
    "Trabajamos con instituciones y empresas que requieren resultados reales.",
  body: "No aplicamos la misma receta a todos los sectores. Entendemos los retos normativos, operativos y tecnológicos de cada industria para diseñar soluciones que realmente funcionen en su contexto.",

  masSectores: ["Salud", "Turismo y Entretenimiento", "Corporativo"],
};
