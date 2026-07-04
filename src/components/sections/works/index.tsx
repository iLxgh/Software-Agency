"use client";

import { Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { workCards, worksIntro } from "./slides";
import { Card } from "./card";

export function Works() {
  return (
    <section
      className="relative bg-[#131313] text-white"
      aria-label="Success projects"
    >
      {/* divisor: respeta el ancho del contenedor */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-white/10" />
      </div>

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-12 px-4 py-16 sm:px-6 sm:py-20 md:flex-row lg:px-8 lg:py-24">
        {/* Izquierda: título + icono */}
        <div className="flex w-full items-start gap-3 md:w-1/4">
          <IconBadge
            icon={Check}
            size="sm"
            variant="brand"
            className="mt-0.5 text-white"
          />
          <h2 className="font-neue-bold text-lg tracking-wide text-white">
            {worksIntro.label}
          </h2>
        </div>

        {/* Derecha: proyectos */}
        <div className="flex w-full flex-col gap-16 md:w-3/4">
          {workCards.map((card, i) => (
            <Card key={i} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
