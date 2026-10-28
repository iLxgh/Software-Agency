import { images } from "@/lib/assets";

export type Platform = {
  name: string;
  description: string;

  audience: string[];

  image: string;
  alt: string;

  logo: string;
};

export const platforms: Platform[] = [
  {
    name: "LegalBlox",
    description: "Contratos con validez legal, sellados en blockchain.",
    audience: ["Notarías", "Despachos", "Fintechs", "Gobierno"],
    image: `${images.cube}/legalblox.jpg`,
    alt: "Contrato de confidencialidad de LegalBlox con su sello de blockchain y la firma electrónica verificada",
    logo: `${images.organizations}/legalblox.png`,
  },
  {
    name: "EduBlox",
    description: "Diplomas y credenciales verificables al instante.",
    audience: ["Universidades", "Centros de formación"],
    image: `${images.cube}/edublox.jpg`,
    alt: "Certificado de EduBlox con su estado de verificación instantánea y los metadatos del emisor",
    logo: `${images.organizations}/edublox.png`,
  },
  {
    name: "Wallox",
    description: "La billetera digital que conecta todo el ecosistema.",
    audience: ["Cualquier usuario con credenciales Bloxtek"],
    image: `${images.cube}/wallox.jpg`,
    alt: "Billetera digital de Wallox con credenciales de LegalBlox y EduBlox dentro",
    logo: `${images.organizations}/wallox-logo.png`,
  },
  {
    name: "RealVext",
    description: "Compra-venta y renta inmobiliaria sin papel.",
    audience: ["Desarrolladoras", "Brokers", "Plataformas de inversión"],
    image: `${images.cube}/realvext.jpg`,
    alt: "Certificado de propiedad tokenizada de RealVext con su estado de transacción y la participación fraccionada",
    logo: `${images.organizations}/realvext.png`,
  },
];

export const platformsIntro = {
  label: "Plataformas Bloxtek",

  count: "04 productos",

  audienceLabel: "Para",

  subtitle:
    "Productos propios que ya están en operación. Si tu caso encaja en uno, el punto de partida no es una hoja en blanco.",
};
