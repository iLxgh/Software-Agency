"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Check } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { NoiseBackground } from "@/components/ui/noise-background";
import { Card } from "./card";
import { stackCards, stackIntro } from "./slides";
import { ENTRANCE } from "@/lib/motion";
import { useCoverBlur } from "@/lib/use-cover-blur";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);



/**
 * Opacidad de la palabra gigante del fondo: en reposo, y cuando la card que le
 * corresponde está pasando por delante del panel.
 *
 * El `<span>` madre pasó a `text-white` a secas (antes era `text-white/10`)
 * porque la opacidad hay que poder SUBIRLA, y con el alfa metido en el color
 * el techo habría sido ese 10%.
 */
const BRAND_DIM = 0.1;
const BRAND_LIT = 0.38;

/**
 * Mismo formato que Services: un intro fijo (sticky) que ocupa la pantalla y
 * unas cards que pasan por encima con z mayor. Al terminar las cards, el intro
 * se suelta.
 */
export function Stack() {
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLSpanElement>(null);

  /**
   * Se difumina conforme las cards lo van tapando. El hook lee el progreso de
   * la hermana SIGUIENTE del elemento que recibe, y aquí esa hermana es justo
   * el contenedor de las cards, así que encaja sin tocar nada.
   *
   * Es el mismo recurso que usa ApproachIntro, y aquí la superposición es toda
   * la gracia de la sección: el intro se queda fijo y pierde foco mientras lo
   * cubren, en vez de quedarse nítido debajo como si no pasara nada.
   */
  useCoverBlur(stickyRef, { start: "top 105%", ease: "power1.in" });

  // Entrada del intro: mask-reveal en textos + pop del check.
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

        // Las descendentes (f, g, j, y) se salen por debajo de la caja de la
        // palabra y el mask, que es overflow-hidden, las recorta. Se les da
        // aire abajo y se compensa con margin negativo, así no altera el
        // layout ni mueve los renglones.
        splits.forEach((s) =>
          s.words.forEach((w) => {
            const unit = w as HTMLElement;
            unit.style.paddingBottom = "7px";
            const mask = unit.parentElement;
            if (mask) mask.style.marginBottom = "-7px";
          }),
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

  /**
   * El fondo responde a la card que tiene delante.
   *
   * El panel se queda pineado mientras pasan las dos cards, y las dos son
   * justo las mitades de la palabra del fondo —"tecnología" y "sectores"—, así
   * que se enciende la que toca. El pineo deja de ser solo decorativo: orienta.
   *
   * La card activa se elige por CERCANÍA al centro de la pantalla, en un único
   * ScrollTrigger, y no con un trigger por card que se encienda y se apague.
   * Con dos cards y 38vh de hueco, los rangos de dos triggers se solapan en los
   * tránsitos y el último `onToggle` que llega gana: eso parpadea. Midiendo
   * distancias siempre hay una sola respuesta.
   */
  useGSAP(
    () => {
      const brand = brandRef.current;
      const cards = cardsRef.current;
      if (!brand || !cards) return;

      const parts = gsap.utils.toArray<HTMLElement>(
        brand.querySelectorAll("[data-brand-card]"),
      );
      const items = gsap.utils.toArray<HTMLElement>(cards.children);
      if (!parts.length || parts.length !== items.length) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      /** Índice encendido ahora mismo; -1 = ninguno. Evita retweenear igual. */
      let lit = -1;

      const apply = (next: number) => {
        if (next === lit) return;
        lit = next;
        parts.forEach((part, i) => {
          gsap.to(part, {
            opacity: i === next ? BRAND_LIT : BRAND_DIM,
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
      };

      const st = ScrollTrigger.create({
        trigger: cards,
        start: "top bottom",
        end: "bottom top",
        onUpdate: () => {
          const mid = window.innerHeight / 2;
          let best = -1;
          let bestDist = Infinity;

          items.forEach((el, i) => {
            const r = el.getBoundingClientRect();
            const dist = Math.abs(r.top + r.height / 2 - mid);
            if (dist < bestDist) {
              bestDist = dist;
              best = i;
            }
          });

          // Margen de media pantalla: si la card más cercana ni siquiera anda
          // cerca del centro, no está "pasando por delante" de nada y las dos
          // mitades vuelven a apagarse.
          apply(bestDist > mid ? -1 : best);
        },
      });

      return () => {
        st.kill();
        gsap.set(parts, { opacity: BRAND_DIM });
      };
    },
    { scope: stickyRef },
  );

  // Palabra gigante de fondo: mask-reveal por letras al llegar.
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

        // El mask es overflow-hidden y recorta todo lo que un glifo saque fuera
        // de su ancho de avance. En la Baskerville itálica eso pasa en los tres
        // lados: la inclinación se sale por la derecha, y el bucle inferior de
        // la "g" de "tecnología" se sale por abajo Y por la izquierda.
        // Cada padding se compensa con un margen negativo del mismo tamaño en
        // el mask, así que el texto no se mueve ni un píxel.
        const PAD = { x: "0.12em", left: "0.06em", bottom: "9px" };

        split.chars.forEach((c) => {
          const ch = c as HTMLElement;
          ch.style.paddingRight = PAD.x;
          ch.style.paddingLeft = PAD.left;
          ch.style.paddingBottom = PAD.bottom;
          const mask = ch.parentElement;
          if (mask) {
            mask.style.marginRight = `-${PAD.x}`;
            mask.style.marginLeft = `-${PAD.left}`;
            mask.style.marginBottom = `-${PAD.bottom}`;
          }
        });

        gsap.from(split.chars, {
          yPercent: 100,
          duration: 0.8,
          stagger: 0.02,
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
      id="stack"
      // overflow-x clip (no `hidden`, que rompería el sticky de abajo) para que
      // la palabra de fondo no cause scroll horizontal.
      className="relative bg-[#131313] pb-10 text-white"
      style={{ overflowX: "clip" }}
      aria-label="Tecnología y sectores"
    >
      {/* Intro FIJO (sticky): se queda mientras las cards pasan por encima.

          `top-0` y `h-screen` exactos, y eso es deliberado. Antes se pineaba
          80px por encima del viewport (top negativo, alto 100vh + 80) para
          engancharse un poco más tarde, y el precio era que la CAJA del panel
          y el ÁREA VISIBLE no coincidían: el centro de la caja caía 40px por
          encima del centro de la pantalla, así que centrar el contenido en la
          caja lo dejaba descentrado en pantalla, y compensarlo descuadraba los
          márgenes de la composición. Imposible tener las dos cosas.

          Igualando caja y viewport, el problema desaparece en vez de
          compensarse: un solo centrado sirve para los dos, y el divisor queda
          además a la vista mientras está pineado. */}
      <div
        ref={stickyRef}
        className="sticky top-0 z-10 flex h-screen flex-col overflow-hidden"
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

        {/* Contenido: el texto y la palabra gigante, como UN grupo centrado.
            Que la palabra vuelva al flujo es lo que iguala los márgenes: con
            `justify-center` el espacio libre se reparte por igual arriba y
            abajo, así que el hueco divisor→texto y el hueco palabra→borde
            inferior salen idénticos por construcción, sin números que calibrar
            ni que dependan de cuánto mida el texto.

            Lo que NO vale es `justify-between` (como estaba antes): manda uno
            al techo y la otra al suelo, y es lo que tenía el título pegado
            arriba. */}
        <div
          ref={contentRef}
          className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center gap-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          {/* --- Intro: check + label, título y texto central --- */}
          <div>
            <div className="mb-10 flex items-start gap-3">
              <IconBadge
                icon={Check}
                size="sm"
                variant="brand"
                className="mt-0.5"
              />
              <p
                data-reveal
                className="font-neue text-lg tracking-wide text-white"
              >
                {stackIntro.label}
              </p>
            </div>

            <h2
              data-reveal
              className="max-w-4xl font-neue-bold text-title leading-[1.02] tracking-tight"
            >
              <span className="font-baskerville text-[0.92em] italic">
                Una sola infraestructura.
              </span>
              <br />
              Muchas industrias,
              <br />
              muchas tecnologías
            </h2>

            {/* Texto central: alineado a la izquierda, colgando del título. */}
            <div className="mt-10 max-w-[32rem]">
              <p
                data-reveal
                className="font-neue text-base leading-relaxed text-white/50"
              >
                {stackIntro.overview1}
              </p>
              <p
                data-reveal
                className="mt-1 font-neue text-base leading-relaxed text-white/50"
              >
                {stackIntro.overview2}
              </p>
            </div>
          </div>


          {/* Palabra gigante: esquinada abajo a la derecha, pero con sus
              líneas alineadas a la izquierda entre sí. Es un flex item, no un
              overlay: tiene que ocupar sitio real para que el reparto vertical
              la cuente y los márgenes de arriba y abajo cuadren. */}
          <span
            ref={brandRef}
            aria-hidden
            className="pointer-events-none hidden self-end text-left leading-[0.95] font-baskerville text-[2.5rem] tracking-tighter text-white italic select-none sm:text-[3.5rem] lg:block lg:text-[5rem]"
          >
            {/* Partida en piezas para poder encender la que corresponde a la
                card que está pasando. El orden de los `data-brand-card` sigue
                el de `stackCards`: 0 = Tecnología, 1 = Sectores. La "y" no
                pertenece a ninguna, así que se queda siempre apagada. */}
            <span data-brand-card="0" style={{ opacity: BRAND_DIM }}>
              tecnología
            </span>{" "}
            <span style={{ opacity: BRAND_DIM }}>y</span>{" "}
            <span data-brand-card="1" style={{ opacity: BRAND_DIM }}>
              sectores
            </span>
          </span>
        </div>
      </div>

      {/* Cards en scroll normal, POR ENCIMA del intro sticky (z mayor). */}
      {/* gap en vh y no en px: al ser solo dos cards, el hueco marca también el
          ritmo con el que pasan por encima del intro fijo, y así se mantiene
          proporcionado en cualquier alto de pantalla. */}
      <div
        ref={cardsRef}
        className="relative z-20 mx-auto flex max-w-[1400px] flex-col gap-[38vh] px-4 pt-[15vh] pb-[30vh] sm:px-6 lg:px-8"
      >
        {stackCards.map((card, i) => (
          <div
            key={card.index}
            className={`flex ${
              i % 2 === 0
                ? "justify-start md:pl-[8%]"
                : "justify-end md:pr-[8%]"
            }`}
          >
            <Card {...card} />
          </div>
        ))}
      </div>

      {/* Ruido para el borde inferior de la sección (el `pb-10` del <section>),
          que queda por DEBAJO del sticky y su ruido no alcanza a cubrir. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-10 overflow-hidden">
        <NoiseBackground
          className="absolute inset-0 h-full w-full mix-blend-screen"
          opacity={0.05}
        />
      </div>
    </section>
  );
}
