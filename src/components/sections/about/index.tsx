"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  aboutStats,
  founder,
  mainPhrase,
  type PhrasePart,
} from "./slides";

/** Frase de dos tonos: `start` en negro, `fade` en gris. */
function TwoTone({ start, fade }: PhrasePart) {
  return (
    <>
      {start} <span className="text-foreground/30">{fade}</span>
    </>
  );
}

/** Iniciales para el avatar placeholder (ignora lo que está entre paréntesis). */
function initials(name: string) {
  return name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function About() {
  const total = aboutStats.length;
  const [current, setCurrent] = useState(0);
  const stat = aboutStats[current];

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  return (
    <section
      className="relative border-t border-foreground/20 text-foreground"
      aria-label="About BLOXTEK"
    >
      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-0 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[320px_1fr] lg:px-8 lg:py-24">
        {/* ---- PANEL IZQUIERDO: slider (rota) ---- */}
        <div className="flex flex-col gap-10 border-b border-foreground/15 pb-10 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-12">
          <div>
            {/* barra de progreso (estática por ahora) */}
            <div className="relative mb-5 h-[3px] w-full overflow-hidden rounded-full bg-foreground/15">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                style={{ width: `${((current + 1) / total) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous slide"
                  className="flex size-8 items-center justify-center rounded-full transition-opacity hover:opacity-60"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next slide"
                  className="flex size-8 items-center justify-center rounded-full transition-opacity hover:opacity-60"
                >
                  <ArrowRight className="size-5" />
                </button>
              </div>
              <span className="text-sm tabular-nums text-foreground/50">
                {String(current + 1).padStart(2, "0")}/
                {String(total).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* stat (rota con el slider) */}
          <div>
            <p className="font-neue-bold text-6xl tracking-tight sm:text-7xl">
              {stat.stat}
            </p>
            <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-foreground/50">
              {stat.caption}
            </p>
          </div>
        </div>

        {/* ---- PANEL DERECHO: frase + autor (ESTÁTICO) ---- */}
        <div className="flex flex-col justify-between gap-10 pt-10 lg:pl-14 lg:pt-0">
          <div className="space-y-8">
            <p className="font-neue text-3xl font-medium leading-[1.15] text-balance sm:text-4xl lg:text-5xl xl:text-[3.25rem]">
              <TwoTone {...mainPhrase.intro[0]} />{" "}
              <TwoTone {...mainPhrase.intro[1]} />
            </p>

            <p className="font-neue text-3xl font-medium leading-[1.15] text-balance sm:text-4xl lg:text-5xl xl:text-[3.25rem]">
              <TwoTone {...mainPhrase.outro} />
            </p>
          </div>

          {/* autor */}
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground/10 text-sm font-semibold text-foreground/60">
              {initials(founder.name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {founder.name}
              </p>
              <p className="text-sm text-foreground/50">{founder.title}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
