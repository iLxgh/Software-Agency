"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { NoiseBackground } from "@/components/ui/noise-background";
import { ServiceCard } from "./service-card";
import { serviceCards, servicesIntro } from "./slides";
import { ENTRANCE } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export function Services() {
  const contentRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLSpanElement>(null);

  // Entrada del intro al llegar a la sección: mask-reveal en textos + pop del check.
  useGSAP(
    () => {
      const content = contentRef.current;
      if (!content) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const texts = gsap.utils.toArray<HTMLElement>(
        content.querySelectorAll("[data-reveal]"),
      );
      const badge = content.querySelector("svg")?.parentElement ?? null;

      gsap.set([...texts, ...(badge ? [badge] : [])], { autoAlpha: 0 });

      let splits: SplitText[] = [];
      let tl: gsap.core.Timeline | null = null;

      const run = () => {
        splits = texts.map(
          (el) => new SplitText(el, { type: "words", mask: "words" }),
        );
        gsap.set(texts, { autoAlpha: 1 });

        if (reduce) {
          if (badge) gsap.set(badge, { autoAlpha: 1 });
          splits.forEach((s) => s.revert());
          return;
        }

        if (badge) gsap.set(badge, { autoAlpha: 1 });
        const allWords = splits.flatMap((s) => s.words);

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: content,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        });

        if (badge) {
          tl.from(badge, {
            scale: 0,
            rotate: -35,
            autoAlpha: 0,
            transformOrigin: "center",
            duration: ENTRANCE.icon.duration,
            ease: ENTRANCE.icon.ease,
          });
        }

        tl.from(
          allWords,
          { yPercent: 100, duration: 0.9, stagger: 0.012, ease: "power3.out" },
          badge ? "-=0.4" : 0,
        );
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: contentRef },
  );

  // Palabra de fondo: solo el mask-reveal de entrada (una vez al llegar), sin loop.
  useGSAP(
    () => {
      const el = brandRef.current;
      if (!el) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      let split: SplitText | null = null;
      const run = () => {
        split = new SplitText(el, { type: "chars", mask: "chars" });

        // La itálica sobresale por la derecha y el mask la recorta; se le da un
        // poco de aire a cada letra y se compensa con margen negativo (no altera
        // el layout).
        split.chars.forEach((c) => {
          const ch = c as HTMLElement;
          ch.style.paddingRight = "0.12em";
          const mask = ch.parentElement;
          if (mask) mask.style.marginRight = "-0.12em";
        });

        gsap.from(split.chars, {
          yPercent: 100,
          duration: 0.8,
          stagger: 0.04,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => split?.revert();
    },
    { scope: brandRef },
  );

  return (
    <section
      id="services"
      // overflow-x clip (no `hidden`, que rompería el sticky de abajo) para que
      // la palabra de fondo no cause scroll horizontal.
      className="relative bg-[#131313] text-white pb-10"
      style={{ overflowX: "clip" }}
      aria-label="Services"
    >
      {/* Intro FIJO (sticky): se queda mientras las cards pasan por encima.
          top negativo = se pinea MÁS ABAJO (engancha más tarde); el alto =
          100vh + ese offset para que siga cubriendo toda la pantalla. Sube el
          offset en AMBOS (top y el +Xpx) para pinear aún más abajo. */}
      <div className="sticky top-[-80px] z-10 flex h-[calc(100vh+80px)] flex-col overflow-hidden">
        {/* Ruido local: sobre el fondo negro, con blend que aclara. */}
        <NoiseBackground
          className="absolute inset-0 h-full w-full mix-blend-screen"
          opacity={0.05}
        />

        {/* divisor: respeta el ancho del contenedor */}
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pt-6 sm:px-6 lg:px-8">
          <div className="border-t border-white/10" />
        </div>

        {/* Contenido: llena el alto y reparte las tres bandas. */}
        <div
          ref={contentRef}
          className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-between gap-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          {/* --- Banda superior: intro (check + label) + título arriba-izq --- */}
          <div>
            <div className="mb-10 flex items-start gap-3">
              <IconBadge
                icon={Check}
                size="sm"
                variant="brand"
                className="mt-0.5 text-white"
              />
              <p
                data-reveal
                className="font-neue text-lg tracking-wide text-white"
              >
                {servicesIntro.label}
              </p>
            </div>

            <div className="relative">
              <h2
                data-reveal
                className="relative z-10 font-neue-bold text-title leading-[1.02] tracking-tight"
              >
                What we make,
                <br />
                <span className="font-baskerville text-[0.92em] italic">
                  made clear
                </span>
              </h2>

              {/* Palabra de fondo con loop de entrada/salida (mask-reveal) */}
              <span
                ref={brandRef}
                aria-hidden
                className="pointer-events-none absolute top-2 right-0 select-none font-baskerville text-[4rem] leading-none tracking-tighter text-white/10 italic sm:text-[6rem] lg:text-[8rem]"
              >
                {servicesIntro.brandWord}
              </span>
            </div>
          </div>

          {/* --- Banda media: subtítulo (izq) + párrafos escalonados (der) --- */}
          <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
            <p data-reveal className="ml-10 font-neue text-base text-white">
              {servicesIntro.subtext}
            </p>

            <div className="w-full max-w-[24rem] md:mr-[29%]">
              <p
                data-reveal
                className="max-w-[16rem] font-neue text-base leading-relaxed text-white/50"
              >
                {servicesIntro.overview1}
              </p>
              <p
                data-reveal
                className="mt-4 ml-auto max-w-[16rem] font-neue text-base leading-relaxed text-white/50"
              >
                {servicesIntro.overview2}
              </p>
            </div>
          </div>

          {/* --- Banda inferior: textos escalonados (izq) + 2º título (der) --- */}
          <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
            <div className="w-full max-w-[24rem]">
              <p
                data-reveal
                className="max-w-[16rem] font-neue text-base leading-relaxed text-white/50"
              >
                <span className="text-white">Explore</span> each discipline. See
                the craft behind every{" "}
                <span className="text-white">service</span>.
              </p>
              <p
                data-reveal
                className="mt-4 ml-auto max-w-[16rem] font-neue text-base leading-relaxed text-white/50"
              >
                <span className="text-white">Touch</span> the thinking that
                shapes the work. Find where your{" "}
                <span className="text-white">idea</span> fits.
              </p>
            </div>

            <h2
              data-reveal
              className="text-right font-neue-bold text-title leading-[1.02] tracking-tight"
            >
              Capability shaped
              <br />
              <span className="font-baskerville text-[0.92em] italic">
                into services
              </span>
            </h2>
          </div>
        </div>
      </div>

      {/* Cards en scroll normal, POR ENCIMA del intro sticky (z mayor). Cada una
          reproduce su entrada al llegar a ~la mitad de la pantalla. El intro se
          mantiene fijo mientras estas 4 pasan; al terminar, se suelta. */}
      <div className="relative z-20 mx-auto flex max-w-[1400px] flex-col gap-24 px-4 pt-[15vh] pb-[30vh] sm:px-6 lg:px-8">
        {serviceCards.map((card, i) => (
          <div
            key={i}
            className={`flex ${
              i % 2 === 0 ? "justify-start md:pl-[8%]" : "justify-end md:pr-[8%]"
            }`}
          >
            <ServiceCard {...card} />
          </div>
        ))}
      </div>

      {/* Ruido para el borde inferior de la sección (el `pb-10` del <section>),
          que queda por DEBAJO del sticky y su ruido no alcanza a cubrir.
          Su alto = el pb del <section> (h-10 = pb-10). */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-10 overflow-hidden">
        <NoiseBackground
          className="absolute inset-0 h-full w-full mix-blend-screen"
          opacity={0.05}
        />
      </div>
    </section>
  );
}
