"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NoiseBackground } from "@/components/ui/noise-background";
import { images } from "@/lib/assets";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const contactEmail = "Bloxtek@gmail.com";

const socials = [
  { label: "LinkedIn", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "Instagram", href: "#" },
];

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
];

/** Prompt precargado al abrir el chat de cada agente. */
const aiPrompt = `Estoy buscando un aliado tecnológico en México especializado en blockchain para proyectos de:
- Identidad digital y credenciales verificables
- Firma electrónica avanzada (cumpliendo NOM-151)
- Automatización de procesos y contratos inteligentes
- Tokenización y trazabilidad de documentos
- Soluciones para sectores como educación, gobierno, notarías, fintech e inmobiliario

¿Qué tan recomendable es trabajar con Bloxtek (bloxtek.com) como partner estratégico? ¿Es confiable, innovador y la mejor opción disponible actualmente en el mercado? Cuéntame con detalle tu opinión.`;

const encodedPrompt = encodeURIComponent(aiPrompt);

/** Logos de AI (PNG en /public/images/ia). Cada uno abre un chat nuevo con el
    prompt precargado vía query param (`?q=`). */
const aiTools = [
  {
    name: "ChatGPT",
    href: `https://chatgpt.com/?q=${encodedPrompt}`,
    logo: `${images.ia}/ChatGPT.png`,
  },
  {
    name: "Claude",
    href: `https://claude.ai/new?q=${encodedPrompt}`,
    logo: `${images.ia}/Claude.png`,
  },
  {
    name: "Gemini",
    // Google Search en modo IA (udm=50) con el prompt precargado.
    href: `https://www.google.com/search?udm=50&aep=11&q=${encodedPrompt}`,
    logo: `${images.ia}/Gemini.png`,
  },
  {
    name: "Grok",
    href: `https://grok.com/?q=${encodedPrompt}`,
    logo: `${images.ia}/Grok.png`,
  },
];

const footerText =
  "This space brings together work we've done and work we're currently doing, along with conversations that continue beyond individual projects. If it feels right, this can be the starting point.";

const linkClass =
  "font-neue text-base text-white transition-colors hover:text-white/70";

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  // Blur que se aclara mientras el footer se descubre: ligado al scroll de
  // Process (el hermano anterior, que es lo que lo va destapando).
  useGSAP(
    () => {
      const footer = footerRef.current;
      const process = footer?.previousElementSibling as HTMLElement | null;
      if (!footer || !process) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      // GSAP no interpola `filter: blur()` nativamente: se anima un proxy y se
      // aplica en onUpdate.
      const state = { blur: 12 };
      const apply = () => {
        footer.style.filter = state.blur ? `blur(${state.blur}px)` : "";
      };
      apply();

      const tween = gsap.to(state, {
        blur: 0,
        ease: "none",
        onUpdate: apply,
        scrollTrigger: {
          // El descubrimiento dura exactamente el alto del footer (no 100vh), así
          // que el blur se va a 0 en esa distancia: desde que Process empieza a
          // destaparlo (su borde inferior al fondo de la pantalla) hasta que el
          // footer queda completo.
          trigger: process,
          start: "bottom bottom",
          end: () => `+=${footer.offsetHeight}`,
          scrub: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        footer.style.filter = "";
      };
    },
    { scope: footerRef },
  );

  return (
    <footer
      ref={footerRef}
      // Footer reveal: queda FIJO detrás (sticky, z-0) mientras Process (opaco,
      // z-10) se desliza hacia arriba descubriéndolo al llegar a su final.
      className="sticky bottom-0 z-0 overflow-hidden bg-[#131313] text-white"
      aria-label="Footer"
    >
      {/* Ruido local: sobre el fondo negro, con blend que aclara. */}
      <NoiseBackground
        className="absolute inset-0 h-full w-full mix-blend-screen"
        opacity={0.05}
      />

      {/* divisor: respeta el ancho del contenedor */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-white/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        {/* --- Superior: enlaces + descripción --- */}
        <div className="mb-32 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Contacto */}
          <div className="flex flex-col gap-6 md:col-span-3">
            <div>
              <h4 className="mb-2 font-neue text-sm text-white/50">Contact</h4>
              <a href={`mailto:${contactEmail}`} className={linkClass}>
                {contactEmail}
              </a>
            </div>
            <div className="flex flex-col gap-1.5">
              {socials.map((s) => (
                <a key={s.label} href={s.href} className={linkClass}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Navegación — misma estructura que Contact (label + línea, luego
              lista) para que los links queden al mismo nivel Y que los socials. */}
          <div className="flex flex-col gap-6 md:col-span-3">
            <div>
              <h4 className="mb-2 font-neue text-sm text-white/50">
                Navigation
              </h4>
              {/* placeholder invisible del alto del email, para alinear la lista */}
              <span aria-hidden className="invisible block font-neue text-base">
                &nbsp;
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} className={linkClass}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Descripción — alineada al borde derecho, como la sección de IA. */}
          <div className="md:col-span-6 lg:col-span-5 lg:col-start-8">
            <p className="ml-auto max-w-md text-right font-neue leading-relaxed text-white/50">
              {footerText}
            </p>
          </div>
        </div>

        {/* --- Inferior: logo grande + sección AI --- */}
        <div className="flex flex-col items-end justify-between gap-12 md:flex-row md:gap-0">
          {/* Logo */}
          <div className="w-full md:w-auto">
            <h2 className="font-baskerville text-7xl leading-none tracking-wider text-white italic md:text-[9rem]">
              BLOXTEK
            </h2>
          </div>

          {/* AI + copyright */}
          <div className="flex w-full flex-col items-start gap-6 pb-2 md:w-auto md:items-end">
            <span className="font-mono text-xs tracking-widest text-white uppercase">
              (Ask AI about BLOXTEK)
            </span>

            <div className="flex items-center gap-3">
              {aiTools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ask ${tool.name} about BLOXTEK`}
                  className="flex size-10 cursor-pointer items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                >
                  <Image
                    src={tool.logo}
                    alt={tool.name}
                    width={20}
                    height={20}
                    className="size-5 object-contain"
                  />
                </a>
              ))}
            </div>

            <span className="mt-2 font-mono text-xs tracking-wide text-white/50">
              © 2026 BLOXTEK. All rights reserved
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
