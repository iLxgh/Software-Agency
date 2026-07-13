import { media } from "@/lib/assets";

export type ProcessStep = {
  id: string;
  title: string;
  description: string;
  video: string;
};

/** Pasos del proceso — se listan uno debajo del otro. */
export const processSteps: ProcessStep[] = [
  {
    id: "STEP 01",
    title: "We uncover your story",
    description:
      "Our platforms have already generated and secured thousands of digital documents and verifiable credentials for institutions across Mexico.",
    video: `${media.processVideos}/step-01.mp4`,
  },
  {
    id: "STEP 02",
    title: "We shape your digital presence",
    description:
      "With your narrative locked, we design and direct a brand and website that feels premium, signals credibility, and gives your audience one clear reason to lean in and act.",
    video: `${media.processVideos}/step-02.mp4`,
  },
  {
    id: "STEP 03",
    title: "We send it into the world",
    description:
      "Your brand and website goes live as a long-term asset that turns attention into opportunity, attracts the clients you're built for, and grows with you.",
    video: `${media.processVideos}/step-03.mp4`,
  },
];

/** Cabecera de la sección — estática. */
export const processIntro = {
  label: "Project Journey",
  body: "Three steps from first conversation to launch. We uncover what makes you matter, shape it into something people feel, and send it into the world to work for you.",
};
