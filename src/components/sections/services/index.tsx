"use client";

import { Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { NoiseBackground } from "@/components/ui/noise-background";
import { servicesIntro } from "./slides";

export function Services() {
  return (
    <section
      className="relative flex min-h-screen flex-col overflow-hidden bg-[#131313] text-white"
      aria-label="Services"
    >
      {/* Ruido local: sobre el fondo negro, con blend que aclara para que se vea. */}
      <NoiseBackground
        className="absolute inset-0 h-full w-full mix-blend-screen"
        opacity={0.05}
      />

      {/* divisor: respeta el ancho del contenedor */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-white/10" />
      </div>

      {/* Contenido: llena el alto y reparte las tres bandas de arriba a abajo. */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-between gap-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* --- Banda superior: intro (check + label) + título arriba-izquierda --- */}
        <div>
          {/* intro de la sección (mismo estilo que Works) */}
          <div className="mb-10 flex items-start gap-3">
            <IconBadge
              icon={Check}
              size="sm"
              variant="brand"
              className="mt-0.5 text-white"
            />
            <p className="font-neue text-lg tracking-wide text-white">
              {servicesIntro.label}
            </p>
          </div>

          {/* título + palabra de marca gigante anclada a su misma altura/derecha */}
          <div className="relative">
            <h2 className="relative z-10 font-neue-bold text-title leading-[1.02] tracking-tight">
              What we make,
              <br />
              <span className="font-baskerville text-[0.92em] italic">
                made clear
              </span>
            </h2>

            <span
              aria-hidden
              className="pointer-events-none absolute top-2 right-0 select-none font-baskerville text-[4rem] leading-none tracking-tighter text-white/10 italic sm:text-[6rem] lg:text-[8rem]"
            >
              {servicesIntro.brandWord}
            </span>
          </div>
        </div>

        {/* --- Banda media: subtítulo (izq) + párrafos escalonados (der) --- */}
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          {/* Subtítulo: blanco, despegado ~40px del borde izquierdo. */}
          <p className="ml-10 font-neue text-base text-white">
            {servicesIntro.subtext}
          </p>

          {/* Párrafos: mismo ancho; el segundo escalonado (arranca al centro del
              primero vía ml-auto). El grupo se corre hacia el centro con mr. */}
          <div className="w-full max-w-[24rem] md:mr-[29%]">
            <p className="max-w-[16rem] font-neue text-base leading-relaxed text-white/50">
              {servicesIntro.overview1}
            </p>
            <p className="mt-4 ml-auto max-w-[16rem] font-neue text-base leading-relaxed text-white/50">
              {servicesIntro.overview2}
            </p>
          </div>
        </div>

        {/* --- Banda inferior: textos escalonados (izq) + segundo título (der) --- */}
        <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          {/* Textos escalonados, esquinados abajo-izquierda. Palabras clave en
              blanco; el resto en gris. */}
          <div className="w-full max-w-[24rem]">
            <p className="max-w-[16rem] font-neue text-base leading-relaxed text-white/50">
              <span className="text-white">Explore</span> each discipline. See
              the craft behind every <span className="text-white">service</span>.
            </p>
            <p className="mt-4 ml-auto max-w-[16rem] font-neue text-base leading-relaxed text-white/50">
              <span className="text-white">Touch</span> the thinking that shapes
              the work. Find where your <span className="text-white">idea</span>{" "}
              fits.
            </p>
          </div>

          {/* segundo título abajo-derecha */}
          <h2 className="text-right font-neue-bold text-title leading-[1.02] tracking-tight">
            Capability shaped
            <br />
            <span className="font-baskerville text-[0.92em] italic">
              into services
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
}
