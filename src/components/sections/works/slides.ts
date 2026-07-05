import { images } from "@/lib/assets";

export type WorkCard = {
  image: string;
  /** Imagen que se revela al hacer hover sobre la card. */
  overlay: string;
  alt: string;
  title: string;
  description: string;
  stat: { value: string; label: string };
};

/** Proyectos destacados de la sección Works. */
export const workCards: WorkCard[] = [
  {
    image: `${images.works}/project1.jpg`,
    overlay: `${images.works}/work-web/work1.png`,
    alt: "LegalBlox project",
    title: "LegalBlox",
    description:
      "Brand refresh and website for a practice with a decade of crafting high-end homes for Australian families.",
    stat: { value: "32%", label: "Increase in average\nsession duration" },
  },
  {
    image: `${images.works}/project2.jpg`,
    overlay: `${images.works}/work-web/work2.png`,
    alt: "NotaryChain project",
    title: "NotaryChain",
    description:
      "Full digital identity platform helping institutions issue and verify credentials at scale across Mexico.",
    stat: { value: "3x", label: "Growth in verified\ndocuments issued" },
  },
  {
    image: `${images.works}/project3.jpg`,
    overlay: `${images.works}/work-web/work3.png`,
    alt: "TrustFolio project",
    title: "TrustFolio",
    description:
      "End-to-end rebrand and product design for a fintech securing digital contracts for SMBs.",
    stat: { value: "48%", label: "More qualified\ninbound leads" },
  },
];

export const worksIntro = {
  label: "Success Projects",
};
