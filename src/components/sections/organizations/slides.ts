import { images } from "@/lib/assets";

export type OrgCard = {
  logo: string;
  alt: string;
  metrics: { value: string; label: string }[];
};

/** Tarjetas del carrusel — se recorren con las flechas de la cabecera. */
export const orgCards: OrgCard[] = [
  {
    logo: `${images.organizations}/logo1.png`,
    alt: "Brand 1 logo",
    metrics: [
      { value: "200%", label: "Inbound Leads" },
      { value: "53%", label: "More qualified pipe" },
    ],
  },
  {
    logo: `${images.organizations}/logo2.png`,
    alt: "Brand 2 logo",
    metrics: [
      { value: "+60", label: "More Leads" },
      { value: "70%", label: "Win rate" },
    ],
  },
  {
    logo: `${images.organizations}/logo3.png`,
    alt: "Brand 3 logo",
    metrics: [
      { value: "12%", label: "Inbound Leads" },
      { value: "400%", label: "More qualified pipe" },
    ],
  },
  {
    logo: `${images.organizations}/logo1.png`,
    alt: "Brand 1 logo",
    metrics: [
      { value: "+80", label: "More Leads" },
      { value: "65%", label: "Win rate" },
    ],
  },
  {
    logo: `${images.organizations}/logo2.png`,
    alt: "Brand 2 logo",
    metrics: [
      { value: "3x", label: "Pipeline Growth" },
      { value: "90%", label: "Retention rate" },
    ],
  },
  {
    logo: `${images.organizations}/logo3.png`,
    alt: "Brand 3 logo",
    metrics: [
      { value: "150%", label: "Inbound Leads" },
      { value: "2x", label: "Revenue" },
    ],
  },
];

/** Texto de la cabecera — estático. */
export const orgIntro = {
  body: "Our platforms have already generated and secured thousands of digital documents and verifiable credentials for institutions across Mexico.",
  ctaLabel: "Explore all results",
  ctaHref: "#",
};
