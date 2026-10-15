"use client";

import { useRef, useState, type ComponentProps, type ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/ui/transition-link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowUpRight, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { IconLink } from "@/components/ui/icon-link";
import {
  cx,
  iconGlyphIconSizeClasses,
  iconGlyphSizeClasses,
  iconGlyphVariantClasses,
} from "@/components/ui/icon-glyph-styles";
import { images } from "@/lib/assets";
import { ENTRANCE } from "@/lib/motion";
import { useArrowHover } from "@/lib/use-arrow-hover";
import { useSoundEnabled, toggleSound } from "@/lib/sound";
import { scrollToSection, scrollToTop } from "@/lib/scroll-to";
import { openAbout, useAboutOpen } from "@/lib/about-panel";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type NavLink = {
  label: string;
  /** Sección de la landing: hace scroll suave, no navega. */
  target?: string;
  /** Ruta propia: navega de verdad. */
  href?: string;
  /** Acción especial (abrir el panel About). */
  action?: "about";
  /** Descripción corta; solo la usan los items del desplegable. */
  blurb?: string;
  /** Submenú; se despliega en hover o al recibir foco por teclado. */
  children?: NavLink[];
};

/**
 * Se respeta la arquitectura del sitio actual (Soluciones / Sectores /
 * Nosotros) para que quien ya lo conoce no se pierda. Lo que en la web vieja
 * era la página de Soluciones vive ahora repartido en tres bloques de la
 * landing, de ahí el desplegable: caben los tres sin llenar la barra.
 */
/** Estilo compartido por los items de primer nivel (enlaces y desplegable). */
const NAV_ITEM =
  "relative inline-flex items-center rounded-md px-2.5 py-1 text-small font-medium text-muted-foreground transition-colors hover:text-foreground";

const HOVER_BOX =
  "pointer-events-none absolute inset-0 origin-left scale-x-0 rounded-md bg-foreground/10";

/**
 * Marca de "estás aquí": un punto verde pegado al borde izquierdo del item.
 *
 * Se eligió sobre un subrayado o sobre dejar el recuadro de hover encendido
 * por dos razones. Una, que el verde de marca ya es el acento de estado en el
 * resto de la web (la numeración de los índices), así que no introduce
 * vocabulario nuevo. Y dos, que deja el recuadro de hover libre: el item
 * activo sigue respondiendo al cursor como los demás en vez de quedarse con un
 * resalte permanente que lo haría parecer deshabilitado.
 *
 * Va en absoluto para que al cambiar de ruta no se ensanche el item y empuje a
 * los de al lado.
 */
const ACTIVE_DOT =
  "pointer-events-none absolute top-1/2 left-0.5 size-1.5 -translate-y-1/2 rounded-full bg-brand";

/**
 * Reparto del ancho del desplegable al hacer hover: el recuadro activo se
 * lleva GROW y los otros dos se reparten el resto. Suman 3, así que el panel
 * conserva su ancho y solo cambia el reparto interno — misma mecánica que la
 * cuadrícula de Plataformas.
 */
const GROW = 1.18;
const SHRINK = (3 - GROW) / 2;

const navLinks: NavLink[] = [
  {
    label: "Soluciones",
    children: [
      {
        label: "Cómo trabajamos",
        target: "#approach",
        blurb: "Cuatro formas de colaborar",
      },
      {
        label: "Tecnología",
        target: "#stack",
        blurb: "El stack que dominamos",
      },
      {
        label: "Plataformas",
        target: "#platforms",
        blurb: "Productos listos para operar",
      },
    ],
  },
  { label: "Sectores", href: "/sectores" },
  { label: "Distribuidores", target: "#distribuidores" },
  { label: "Nosotros", action: "about" },
];

/**
 * Recuadro del desplegable. Va como componente propio porque `useArrowHover`
 * necesita un ref por tarjeta, y un hook no puede vivir dentro de un .map().
 */
function SolutionCard({
  item,
  onHover,
  onSelect,
}: {
  item: NavLink;
  onHover: () => void;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  // Mismo vuelo de flecha que el CTA de la barra: sale hacia arriba-derecha y
  // vuelve a entrar desde abajo-izquierda.
  useArrowHover(ref, { direction: "up-right" });

  return (
    <a
      ref={ref}
      href={item.target ?? "#"}
      onMouseEnter={onHover}
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
      className="flex min-w-0 flex-col justify-between gap-6 rounded-xl bg-card p-4 transition-colors duration-300 hover:bg-foreground/10"
    >
      <span className="min-w-0">
        <span className="block font-neue-bold text-base tracking-tight text-foreground">
          {item.label}
        </span>
        {/* min-h reserva los dos renglones: al encoger la columna el texto
            reflowa, y sin altura fija la tarjeta más alta estiraba a las tres
            (las celdas del grid se igualan) y el panel entero pegaba un salto. */}
        <span className="mt-1 block min-h-[2.4rem] text-sm leading-snug text-pretty text-muted-foreground">
          {item.blurb}
        </span>
      </span>

      <span className="self-end">
        <IconBadge icon={ArrowUpRight} size="sm" />
      </span>
    </a>
  );
}

/**
 * Un item de primer nivel. Con `href` es una ruta de verdad y va por la
 * cortina; con `target` o `action` no hay a dónde navegar, así que se
 * intercepta el clic.
 */
function LinkOrAnchor({
  link,
  children,
  ...props
}: {
  link: NavLink;
  children: ReactNode;
} & Omit<ComponentProps<"a">, "href">) {
  if (link.href) {
    return (
      <TransitionLink href={link.href} {...props}>
        {children}
      </TransitionLink>
    );
  }

  return (
    <a
      href={link.target ?? "#"}
      onClick={(e) => {
        e.preventDefault();
        if (link.target) scrollToSection(link.target);
        else if (link.action === "about") openAbout();
      }}
      {...props}
    >
      {children}
    </a>
  );
}

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  /** Ruta actual, para marcar en qué sección de la web está el visitante. */
  const pathname = usePathname();
  const talkRef = useRef<HTMLAnchorElement>(null);

  // El desplegable va por estado y no por :hover de CSS: al elegir una opción
  // hay que poder CERRARLO a mano. Con CSS puro el cursor se queda quieto
  // sobre el botón mientras la página baja, el :hover sigue activo y el panel
  // se quedaba abierto aunque la barra ya se hubiera escondido.
  const [menuOpen, setMenuOpen] = useState(false);
  // Recuadro con el cursor encima; null = los tres del mismo ancho.
  const [hovered, setHovered] = useState<number | null>(null);

  const solutions = navLinks.find((l) => l.children)?.children ?? [];
  const cols =
    hovered === null
      ? "1fr 1fr 1fr"
      : solutions.map((_, i) => `${i === hovered ? GROW : SHRINK}fr`).join(" ");

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
      const btn = nav?.querySelector<HTMLElement>("[data-sound-toggle]");
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

      // Oculta antes del primer paint (solo con JS) para evitar el flash.
      gsap.set(nav, { autoAlpha: 0 });

      let splits: SplitText[] = [];
      let enterTl: gsap.core.Timeline | null = null;
      let st: ScrollTrigger | null = null;
      let call: gsap.core.Tween | null = null;

      const run = () => {
        // Se recogen TODAS las unidades del reveal en un solo querySelectorAll,
        // que devuelve orden de DOM. Es lo que hace que el stagger recorra la
        // barra de izquierda a derecha.
        //
        // Antes los bloques (el logo y el chevron) se concatenaban al final del
        // array, así que se llevaban los últimos turnos del stagger: el chevron
        // caía un buen rato después de su propia palabra, y eso era lo que hacía
        // que "Soluciones" pareciera ir a otro ritmo que el resto.
        const units = gsap.utils.toArray<HTMLElement>(
          nav.querySelectorAll(
            "[data-nav-text], [data-nav-logo], [data-nav-block]",
          ),
        );

        // Lo que es texto se parte en palabras; lo que no se puede partir —el
        // logo, que es una imagen, y el chevron— entra entero, pero en su sitio.
        splits = [];
        const allWords: HTMLElement[] = [];
        units.forEach((el) => {
          if (el.hasAttribute("data-nav-text")) {
            const split = new SplitText(el, { type: "words", mask: "words" });
            splits.push(split);
            allWords.push(...(split.words as HTMLElement[]));
          } else {
            allWords.push(el);
          }
        });

        gsap.set(nav, { autoAlpha: 1 });

        if (reduce) {
          splits.forEach((s) => s.revert());
          return;
        }

        // El badge morado de "Talk to us" y el botón de sonido: mismo pop de
        // ícono que en la carga, pero dentro de este timeline para que también se
        // animen al esconder/mostrar.
        const talkBadge =
          (talkRef.current?.querySelector("svg")
            ?.parentElement as HTMLElement | null) ?? null;
        // OJO: por selector de etiqueta esto capturaba el botón de "Soluciones",
        // que es el primer <button> del nav, y le aplicaba el pop de ícono.
        const soundBtn = nav.querySelector<HTMLElement>("[data-sound-toggle]");

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
          iconPop(
            soundBtn as HTMLElement,
            ENTRANCE.icon.sound - ENTRANCE.navbar,
          );

        // Entrada al cargar, con el mismo delay inicial.
        call = gsap.delayedCall(ENTRANCE.gate + ENTRANCE.navbar, () =>
          enterTl?.play(),
        );

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
        onMouseLeave={() => {
          setMenuOpen(false);
          setHovered(null);
        }}
        className="pointer-events-auto relative flex w-full max-w-4xl items-center gap-4 rounded-2xl bg-card px-5 py-3 text-black shadow-[0_0_24px_rgba(0,0,0,0.12)] sm:px-6"
      >
        <TransitionLink
          href="/"
          // En la home sube suave al inicio; desde otra ruta deja que el enlace
          // navegue de verdad, que es lo que se espera de un logo.
          onClick={(e) => {
            if (window.location.pathname !== "/") return;
            e.preventDefault();
            scrollToTop();
          }}
          aria-label="Ir al inicio"
          className="flex items-center"
        >
          {/* Máscara + wrapper: el logo no se puede partir con SplitText como
              los textos, así que entra como bloque con el mismo desplazamiento
              vertical, recortado por el contenedor. */}
          <span className="block overflow-hidden">
            <span data-nav-logo className="block">
              <Image
                src={`${images.general}/logo-bloxtek.svg`}
                alt="BLOXTEK"
                width={138}
                height={39}
                // El optimizador de Next rechaza SVG salvo que se active
                // dangerouslyAllowSVG; un SVG tampoco gana nada al optimizarse.
                unoptimized
                priority
                className="h-6 w-auto sm:h-7"
                draggable={false}
              />
            </span>
          </span>
        </TransitionLink>

        <ul className="mx-auto hidden items-center gap-5 md:flex">
          {navLinks.map((link) =>
            link.children ? (
              <li key={link.label}>
                <button
                  type="button"
                  data-nav-link
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  onMouseEnter={() => setMenuOpen(true)}
                  onFocus={() => setMenuOpen(true)}
                  className={cx(NAV_ITEM, "cursor-pointer gap-1.5")}
                >
                  <span aria-hidden data-hover-box className={HOVER_BOX} />
                  <span data-nav-text className="relative">
                    {link.label}
                  </span>
                  {/* Máscara + wrapper: el chevron no se puede partir con
                      SplitText, así que entra como bloque con el mismo
                      desplazamiento que las palabras. Sin esto aparecía de
                      golpe mientras el texto de al lado hacía su reveal. */}
                  <span className="relative block overflow-hidden">
                    <span data-nav-block className="block">
                      <ChevronDown
                        aria-hidden
                        className={cx(
                          "size-3.5 transition-transform duration-300",
                          menuOpen && "rotate-180",
                        )}
                      />
                    </span>
                  </span>
                </button>
              </li>
            ) : (
              <li key={link.label}>
                <LinkOrAnchor
                  link={link}
                  data-nav-link
                  // Pasar por cualquier otro item cierra el desplegable.
                  onMouseEnter={() => setMenuOpen(false)}
                  // Solo los items que son RUTA pueden estar activos; los que
                  // hacen scroll a una sección de la landing no cambian de
                  // página, así que no hay un "aquí" que marcar.
                  aria-current={
                    link.href && pathname === link.href ? "page" : undefined
                  }
                  className={cx(
                    NAV_ITEM,
                    link.href &&
                      pathname === link.href &&
                      "pl-4 text-foreground",
                  )}
                >
                  {/* recuadro gris que crece de izq. a der. en hover */}
                  <span aria-hidden data-hover-box className={HOVER_BOX} />
                  {link.href && pathname === link.href && (
                    <span aria-hidden className={ACTIVE_DOT} />
                  )}
                  <span data-nav-text className="relative">
                    {link.label}
                  </span>
                </LinkOrAnchor>
              </li>
            ),
          )}
        </ul>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <IconLink
            ref={talkRef}
            href="#contacto"
            icon={ArrowUpRight}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#contacto");
            }}
          >
            <span data-nav-text className="hidden sm:inline">
              Agendar llamada
            </span>
          </IconLink>
          <button
            type="button"
            data-sound-toggle
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
            <span data-sound-icon className="flex items-center justify-center">
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
        {/* --- Panel del desplegable ---
            Cuelga del <nav> y no del <li>, que es lo que le permite ocupar todo
            el ancho de la barra. Al ser descendiente del nav en el DOM, mover
            el cursor hacia él no dispara el mouseLeave del nav (React sigue el
            árbol, no la geometría), así que no se cierra por el camino.
            El pt-3 hace de puente sobre el hueco visual.

            Nada de `invisible` para ocultarlo: `visibility` no interpola, así
            que al cerrar el panel desaparecía de golpe sin llegar a
            desvanecerse. Se oculta solo con opacidad, y el `inert` lo saca del
            tabulador y del árbol de accesibilidad mientras está cerrado. */}
        <div
          inert={!menuOpen}
          className={cx(
            "absolute inset-x-0 top-full pt-3",
            "transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            menuOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0",
          )}
        >
          {/* El ancho se reparte con fracciones de grid: el recuadro activo
              crece y los otros dos encogen en el mismo gesto, sin que el panel
              cambie de tamaño. La curva se pasa del destino y vuelve, así que
              los tres rebotan al acomodarse. */}
          <div
            style={{ gridTemplateColumns: cols }}
            onMouseLeave={() => setHovered(null)}
            className="grid gap-3 rounded-2xl bg-background p-3 shadow-[0_10px_40px_rgba(0,0,0,0.14)] transition-[grid-template-columns] duration-[550ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          >
            {solutions.map((item, i) => (
              <SolutionCard
                key={item.label}
                item={item}
                onHover={() => setHovered(i)}
                onSelect={() => {
                  setMenuOpen(false);
                  setHovered(null);
                  if (item.target) scrollToSection(item.target);
                }}
              />
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
