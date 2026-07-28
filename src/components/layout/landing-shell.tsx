"use client";

import type { ReactNode } from "react";
import { useAboutOpen } from "@/lib/about-panel";

/**
 * Envuelve toda la landing (navbar + secciones) para poder empujarla ~50px a la
 * izquierda cuando se abre el panel About, dando la sensación de que el modal la
 * desplaza. Sin transform cuando está cerrado, para no romper los `sticky`.
 */
export function LandingShell({ children }: { children: ReactNode }) {
  const open = useAboutOpen();

  return (
    <div
      className={`flex min-h-full flex-1 flex-col transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        open ? "-translate-x-[50px]" : ""
      }`}
    >
      {children}
    </div>
  );
}
