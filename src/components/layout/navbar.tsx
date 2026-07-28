"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react";
import { IconLink } from "@/components/ui/icon-link";
import {
  cx,
  iconGlyphIconSizeClasses,
  iconGlyphSizeClasses,
  iconGlyphVariantClasses,
} from "@/components/ui/icon-glyph-styles";
import { ENTRANCE } from "@/lib/motion";
import { useArrowHover } from "@/lib/use-arrow-hover";
import { useSoundEnabled, toggleSound } from "@/lib/sound";
import { scrollToTarget, scrollToTop } from "@/lib/scroll-to";
import { openAbout, useAboutOpen } from "@/lib/about-panel";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

// `target` = id de la sección a la que hace scroll; `action` = acción especial.
const navLinks: { label: string; target?: string; action?: "about" }[] = [
  { label: "About", action: "about" },
  { label: "Work", target: "#work" },
  { label: "Services", target: "#services" },
  { label: "Process", target: "#process" },
];

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const talkRef = useRef<HTMLAnchorElement>(null);

  const soundOn = useSoundEnabled();
  const aboutOpen = useAboutOpen();

  useArrowHover(talkRef, { direction: "up-right" });

  // Hover de los links de sección: un recuadro gris que crece de izquierda a
  // derecha al entrar y, al salir, se achica hacia la derecha (swap de origen).
  useGSAP(
    () => {
      const nav = navRef.current;
      if (!nav) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      const links = gsap.utils.toArray<HTMLElement>(
        nav.querySelectorAll("[data-nav-link]"),
      );
      const cleanups: Array<() => void> = [];

      links.forEach((link) => {
        const box = link.querySelector<HTMLElement>("[data-hover-box]");
        if (!box) return;
        gsap.set(box, { scaleX: 0, transformOrigin: "left center" });

        const enter = () =>
          gsap.to(box, {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 0.6,
            ease: "power2.out",
            // mata cualquier tween previo del mismo box para que no se queden
            // solapados y el recuadro se quede pegado al pasar rápido.
            overwrite: true,
          });
        const leave = () =>
          gsap.to(box, {
            scaleX: 0,
            transformOrigin: "right center",
            duration: 0.55,
            ease: "power2.inOut",
            overwrite: true,
          });

        link.addEventListener("mouseenter", enter);
        link.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          link.removeEventListener("mouseenter", enter);
          link.removeEventListener("mouseleave", leave);
        });
      });

      return () => cleanups.forEach((c) => c());
    },
    { scope: navRef },
  );

  // Botón de sonido: hover = solo scale; click = press + rebote. Se anima el
  // span wrapper (estable) en vez del svg, que se reemplaza al mutear.
  useGSAP(
    () => {
      const nav = navRef.current;
      const btn = nav?.querySelector("button");
      const icon = nav?.querySelector<HTMLElement>("[data-sound-icon]");
      if (!btn || !icon) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      let hovering = false;

      const enter = () => {
        hovering = true;
        gsap.to(icon, {
          scale: 1.18,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
        });
      };
      const leave = () => {
        hovering = false;
        gsap.to(icon, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
          overwrite: true,
        });
      };
      // Click: se hunde y rebota (feedback claro del click).
      const press = () => {
        gsap
          .timeline()
          .to(icon, {
            scale: 0.8,
            duration: 0.1,
            ease: "power2.in",
            overwrite: true,
          })
          .to(icon, {
            scale: hovering ? 1.18 : 1,
            duration: 0.5,
            ease: "back.out(3.5)",
          });
      };

      btn.addEventListener("mouseenter", enter);
      btn.addEventListener("mouseleave", leave);
      btn.addEventListener("click", press);
      return () => {
        btn.removeEventListener("mouseenter", enter);
        btn.removeEventListener("mouseleave", leave);
        btn.removeEventListener("click", press);
      };
    },
    { scope: navRef },
  );

  useGSAP(
    () => {
      const nav = navRef.current;
      if (!nav) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const textEls = gsap.utils.toArray<HTMLElement>(
        nav.querySelectorAll("[data-nav-text]"),
      );

      // Oculta antes del primer paint (solo con JS) para evitar el flash.
      gsap.set(nav, { autoAlpha: 0 });

      let splits: SplitText[] = [];
      let enterTl: gsap.core.Timeline | null = null;
      let st: ScrollTrigger | null = null;
      let call: gsap.core.Tween | null = null;

      const run = () => {
        splits = textEls.map(
          (el) => new SplitText(el, { type: "words", mask: "words" }),
        );
        const allWords = splits.flatMap((s) => s.words);

        gsap.set(nav, { autoAlpha: 1 });

        if (reduce) {
          splits.forEach((s) => s.revert());
          return;
        }

        // El badge morado de "Talk to us" y el botón de sonido: mismo pop de
        // ícono que en la carga, pero dentro de este timeline para que también se
        // animen al esconder/mostrar.
        const talkBadge =
          (talkRef.current?.querySelector("svg")?.parentElement as
            | HTMLElement
            | null) ?? null;
        const soundBtn = nav.querySelector("button");

        // Timeline de ENTRADA (pausado): de escondido -> visible, con los mismos
        // valores/tiempos que la carga. Se reproduce tal cual para aparecer (al
        // cargar y al hacer scroll hacia arriba) y su `reverse()` es la animación
        // de esconderse. Así la bajada y la aparición son idénticas a la carga.
        enterTl = gsap
          .timeline({ paused: true })
          .fromTo(
            nav,
            { yPercent: -140, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: ENTRANCE.navbarDuration,
              ease: ENTRANCE.ease,
            },
            0,
          )
          .fromTo(
            allWords,
            { yPercent: 100 },
            { yPercent: 0, duration: 1.1, stagger: 0.09, ease: "power3.out" },
            // mismo desfase que en la carga: los textos arrancan 0.4s después
            // que la barra (navText 0.55 − navbar 0.15).
            ENTRANCE.navText - ENTRANCE.navbar,
          );

        // Pop de los íconos (escala + rotación con rebote), en su mismo tiempo
        // relativo (delay de carga − delay de la barra).
        const iconPop = (target: HTMLElement, at: number) =>
          enterTl!.fromTo(
            target,
            { scale: 0, rotate: -35, autoAlpha: 0 },
            {
              scale: 1,
              rotate: 0,
              autoAlpha: 1,
              transformOrigin: "center",
              duration: ENTRANCE.icon.duration,
              ease: ENTRANCE.icon.ease,
            },
            at,
          );
        if (talkBadge) iconPop(talkBadge, ENTRANCE.icon.talk - ENTRANCE.navbar);
        if (soundBtn)
          iconPop(soundBtn as HTMLElement, ENTRANCE.icon.sound - ENTRANCE.navbar);

        // Entrada al cargar, con el mismo delay inicial.
        call = gsap.delayedCall(ENTRANCE.navbar, () => enterTl?.play());

        // --- Esconder / mostrar según dirección de scroll ---
        st = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            // Esconder/mostrar (post-carga) va más rápido y fluido que la entrada
            // inicial: solo se acelera aquí, que únicamente se dispara con scroll.
            enterTl?.timeScale(1.6);
            // Cerca del tope: siempre visible.
            if (self.scroll() < 80) {
              enterTl?.play();
              return;
            }
            // Scroll hacia abajo → esconder (reverse); hacia arriba → mostrar.
            if (self.direction === 1) enterTl?.reverse();
            else enterTl?.play();
          },
        });
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        call?.kill();
        st?.kill();
        enterTl?.kill();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: navRef },
  );

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:pt-6 ${
        aboutOpen ? "-translate-x-[50px]" : ""
      }`}
    >
      <nav
        ref={navRef}
        className="pointer-events-auto flex w-full max-w-4xl items-center gap-4 rounded-2xl bg-card px-5 py-3 text-black shadow-[0_0_24px_rgba(0,0,0,0.12)] sm:px-6"
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
          aria-label="Back to top"
          className="text-xl font-extrabold tracking-tight"
        >
          <span data-nav-text>BLOXTEK</span>
        </a>

        <ul className="mx-auto hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.target ?? "#"}
                data-nav-link
                onClick={(e) => {
                  e.preventDefault();
                  if (link.target) scrollToTarget(link.target);
                  else if (link.action === "about") openAbout();
                }}
                className="relative inline-flex items-center rounded-md px-2.5 py-1 text-small font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {/* recuadro gris que crece de izq. a der. en hover */}
                <span
                  aria-hidden
                  data-hover-box
                  className="pointer-events-none absolute inset-0 origin-left scale-x-0 rounded-md bg-foreground/10"
                />
                <span data-nav-text className="relative">
                  {link.label}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <IconLink ref={talkRef} href="#" icon={ArrowUpRight}>
            <span data-nav-text className="hidden sm:inline">
              Talk to us
            </span>
          </IconLink>
          <button
            type="button"
            aria-label={soundOn ? "Mute sound" : "Unmute sound"}
            aria-pressed={!soundOn}
            onClick={() => toggleSound()}
            className={cx(
              "flex cursor-pointer items-center justify-center rounded-lg",
              iconGlyphSizeClasses.md,
              iconGlyphVariantClasses.solid,
            )}
          >
            {/* wrapper estable: el svg se reemplaza al mutear, este span no, así
                las animaciones de hover/click no se pierden. */}
            <span
              data-sound-icon
              className="flex items-center justify-center"
            >
              {soundOn ? (
                <Volume2
                  className={iconGlyphIconSizeClasses.md}
                  strokeWidth={2.5}
                />
              ) : (
                <VolumeX
                  className={iconGlyphIconSizeClasses.md}
                  strokeWidth={2.5}
                />
              )}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
