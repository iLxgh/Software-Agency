"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { IconLink } from "@/components/ui/icon-link";
import { ENTRANCE } from "@/lib/motion";
import { useArrowHover } from "@/lib/use-arrow-hover";
import { useSoundEnabled, toggleSound } from "@/lib/sound";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const navLinks = ["About", "Work", "Services", "Process"];

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const talkRef = useRef<HTMLAnchorElement>(null);

  const soundOn = useSoundEnabled();

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
          });
        const leave = () =>
          gsap.to(box, {
            scaleX: 0,
            transformOrigin: "right center",
            duration: 0.55,
            ease: "power2.inOut",
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
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-6">
      <nav
        ref={navRef}
        className="pointer-events-auto flex w-full max-w-4xl items-center gap-4 rounded-2xl bg-card px-5 py-3 text-black shadow-[0_0_24px_rgba(0,0,0,0.12)] sm:px-6"
      >
        <a href="#" className="text-xl font-extrabold tracking-tight">
          <span data-nav-text>BLOXTEK</span>
        </a>

        <ul className="mx-auto hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <li key={link}>
              <a
                href="#"
                data-nav-link
                className="relative inline-flex items-center rounded-md px-2.5 py-1 text-small font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {/* recuadro gris que crece de izq. a der. en hover */}
                <span
                  aria-hidden
                  data-hover-box
                  className="pointer-events-none absolute inset-0 origin-left scale-x-0 rounded-md bg-foreground/10"
                />
                <span data-nav-text className="relative">
                  {link}
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
          <IconButton
            icon={soundOn ? Volume2 : VolumeX}
            aria-label={soundOn ? "Mute sound" : "Unmute sound"}
            aria-pressed={!soundOn}
            onClick={() => toggleSound()}
            className="cursor-pointer"
          />
        </div>
      </nav>
    </header>
  );
}
