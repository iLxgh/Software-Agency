"use client";

import {
  createContext,
  useState,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { jumpToTop, lockScroll, unlockScroll } from "@/lib/scroll-to";
import { TransitionLogo } from "./transition-logo";
import { WORDMARK_HEIGHT } from "@/components/ui/logo-wordmark";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Tiempos de la cortina. Todo lo ajustable, junto. */
const TIMING = {
  /**
   * La cortina sube desde abajo hasta tapar la pantalla. Entra con las esquinas
   * DE ARRIBA muy redondeadas y se va enderezando: lo que se ve mientras sube
   * es su borde superior, así que ahí es donde la curva cuenta.
   */
  cover: { duration: 0.6, ease: "power4.inOut" },
  /** Radio de la curva en los dos extremos del recorrido. */
  radius: 100,
  /** Reveal del nombre, ya con la pantalla tapada. */
  word: { duration: 0.7, stagger: 0.04, ease: "power3.out" },
  /** Respiro con el logo trazado antes de destapar. */
  hold: 0.1,
  /**
   * Cuánto ANTES de que la cortina acabe de salir se da la señal a las entradas
   * de la página nueva.
   *
   * Si se diera al final, el texto empezaba a aparecer con la cortina ya fuera
   * y se notaba un hueco muerto. Y si se diera al principio de la salida,
   * tampoco: la cortina sube, o sea que descubre la pantalla DE ABAJO ARRIBA y
   * la cabecera es lo último en quedar a la vista, así que la animación se
   * habría consumido entera por detrás.
   *
   * Con 1.4 la señal cae ANTES de que la cortina empiece a moverse —durante el
   * reveal del logotipo—, así que la página de debajo ya está animando cuando
   * la cortina arranca. Es lo que se pidió: que no se note hueco. El precio es
   * que parte de la entrada ocurre a puerta cerrada; si se quiere recuperar,
   * basta con bajar este número.
   */
  reveal_cue: 1.4,
  /**
   * La cortina sigue subiendo y sale por arriba, con el logo puesto. Al salir
   * se curvan las esquinas DE ABAJO, que son las que quedan a la vista según
   * se marcha: el gesto es el inverso al de la entrada.
   */
  reveal: { duration: 0.7, ease: "power4.inOut" },
  /** Con prefers-reduced-motion: solo un fundido corto. */
  reduced: 0.2,
} as const;

type TransitionContextValue = {
  /** Navega tapando la pantalla. Ignora la ruta actual y navegaciones en curso. */
  navigate: (href: string) => void;
  /**
   * `true` mientras la cortina tapa la pantalla. Las entradas de la página
   * nueva lo consultan para no reproducirse a puerta cerrada: si no, cuando la
   * cortina se va el texto ya entró y la página aparece estática.
   */
  covering: boolean;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function usePageTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error(
      "usePageTransition debe usarse dentro de TransitionProvider",
    );
  }
  return ctx;
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const [covering, setCovering] = useState(false);

  /** Bloquea clics mientras hay una transición viva. */
  const busyRef = useRef(false);
  /**
   * Resolver de la espera por el cambio de ruta. Se completa desde el efecto
   * que observa `pathname`, no con un setTimeout: así el destape ocurre cuando
   * la nueva página existe de verdad, por lenta que haya sido.
   */
  const pendingRef = useRef<{ href: string; resolve: () => void } | null>(null);

  const wordPaths = useCallback(
    () =>
      gsap.utils.toArray<SVGPathElement>(
        logoRef.current?.querySelectorAll("[data-wordmark-path]") ?? [],
      ),
    [],
  );

  /**
   * Deja las letras justo debajo del viewBox. El propio viewport del SVG hace
   * de máscara, así que ahí no se ven — es el mismo reveal enmascarado que usan
   * los titulares de la web, pero sin necesitar SplitText.
   */
  const resetWord = useCallback(() => {
    gsap.set(wordPaths(), { y: WORDMARK_HEIGHT });
  }, [wordPaths]);

  // Estado de reposo: cortina fuera de pantalla y letras sin asomar.
  useGSAP(
    () => {
      gsap.set(overlayRef.current, { yPercent: 100, autoAlpha: 1 });
      resetWord();
    },
    { scope: overlayRef },
  );

  // Cuando Next termina de montar la ruta nueva, se libera la espera.
  useGSAP(
    () => {
      const pending = pendingRef.current;
      if (!pending) return;
      if (pending.href.split("?")[0].split("#")[0] !== pathname) return;

      pendingRef.current = null;
      pending.resolve();
    },
    { dependencies: [pathname] },
  );

  const navigate = useCallback(
    (href: string) => {
      if (busyRef.current) return;

      const target = href.split("?")[0].split("#")[0];
      if (target === pathname) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      busyRef.current = true;
      setCovering(true);
      // Nada de scrollear por debajo mientras la cortina está puesta.
      lockScroll();

      const waitForRoute = () =>
        new Promise<void>((resolve) => {
          pendingRef.current = { href, resolve };
          router.push(href);
          // Red de seguridad: si la ruta nunca cambia (404, navegación
          // cancelada), no dejamos la cortina pegada tapando la pantalla.
          window.setTimeout(() => {
            if (pendingRef.current?.resolve === resolve) {
              pendingRef.current = null;
              resolve();
            }
          }, 3000);
        });

      const finish = () => {
        // Reposición instantánea abajo, lista para la siguiente navegación.
        gsap.set(overlayRef.current, { yPercent: 100, borderRadius: 0 });
        resetWord();
        unlockScroll();

        busyRef.current = false;
        // Red de seguridad: en el camino normal la señal ya se dio a mitad de
        // la salida, y en el de `prefers-reduced-motion` se da aquí. Repetirlo
        // no cuesta nada, React ignora un estado que no cambia.
        setCovering(false);

        /**
         * Remedida obligatoria de ScrollTrigger tras cada navegación.
         *
         * Mientras la cortina está puesta el scroll se bloquea con
         * `overflow: hidden` en el <html>, así que el documento se queda sin
         * altura de recorrido. Las secciones de la página nueva se montan JUSTO
         * ahí, y sus ScrollTrigger calculan start/end contra un documento sin
         * scroll. Como un `from` deja al elemento en su estado inicial hasta
         * que el trigger dispara, lo que se ve es gente invisible o a medio
         * colocar —palomitas que no aparecen, cards en miniatura, texto
         * desplazado— y solo se arreglaba recargando, porque nada volvía a
         * medir.
         *
         * Va en DOS frames y no aquí mismo, y esa es la parte que importa:
         * `finish` se ejecuta dentro del `onComplete` de un tween, o sea dentro
         * del tick de GSAP, y ScrollTrigger APLAZA un refresh pedido ahí en vez
         * de ejecutarlo. Saliendo del tick se hace de verdad; el segundo frame
         * da tiempo además a que React confirme el `setCovering(false)` de
         * arriba y a que las entradas que dependen de esa bandera ya existan.
         */
        requestAnimationFrame(() =>
          requestAnimationFrame(() => ScrollTrigger.refresh()),
        );
      };

      if (reduce) {
        // Sin recorrido: solo un fundido corto, ida y vuelta.
        gsap
          .timeline()
          .set(overlayRef.current, { yPercent: 0, autoAlpha: 0 })
          .to(overlayRef.current, {
            autoAlpha: 1,
            duration: TIMING.reduced,
            ease: "none",
          })
          .call(() => {
            void waitForRoute().then(() => {
              jumpToTop();
              gsap.to(overlayRef.current, {
                autoAlpha: 0,
                duration: TIMING.reduced,
                ease: "none",
                onComplete: () => {
                  gsap.set(overlayRef.current, { autoAlpha: 1 });
                  finish();
                },
              });
            });
          });
        return;
      }

      const tl = gsap.timeline();

      // 1. La cortina sube y tapa.
      // Se animan las esquinas por separado y no el `borderRadius` de golpe:
      // así se controla exactamente qué par se curva en cada tramo.
      tl.fromTo(
        overlayRef.current,
        {
          yPercent: 100,
          borderTopLeftRadius: TIMING.radius,
          borderTopRightRadius: TIMING.radius,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        },
        {
          yPercent: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          duration: TIMING.cover.duration,
          ease: TIMING.cover.ease,
        },
      )
        // 2. Ya tapado: se cambia la ruta por debajo y entra el logo.
        .call(() => {
          void waitForRoute().then(() => {
            // Con la pantalla cubierta: ni se ve el salto ni hay flash de la
            // página nueva antes de tiempo.
            jumpToTop();
          });
        })
        // Las letras suben a su sitio, escalonadas de izquierda a derecha. Se
        // quedan puestas: suben con la cortina, sin deshacerse.
        .to(wordPaths(), {
          y: 0,
          duration: TIMING.word.duration,
          stagger: TIMING.word.stagger,
          ease: TIMING.word.ease,
        })
        // 3. Sigue subiendo y sale por arriba, destapando la página nueva.
        //    `>` espera a que la ruta esté montada antes de arrancar.
        .to(overlayRef.current, {
          yPercent: -100,
          borderBottomLeftRadius: TIMING.radius,
          borderBottomRightRadius: TIMING.radius,
          duration: TIMING.reveal.duration,
          ease: TIMING.reveal.ease,
          delay: TIMING.hold,
          onComplete: finish,
        })
        // La salida a las entradas de la página nueva, a mitad de la subida de
        // la cortina y no al final. Ver TIMING.reveal_cue.
        .call(() => setCovering(false), [], `>-${TIMING.reveal_cue}`);
    },
    [pathname, router, wordPaths, resetWord],
  );

  return (
    <TransitionContext.Provider value={{ navigate, covering }}>
      {children}

      {/* La cortina. `fixed` + `dvh` para que en móvil cubra también la franja
          de la barra del navegador. Nunca captura clics: en reposo está fuera
          de pantalla y, mientras anima, el scroll ya está bloqueado. */}
      <div
        ref={overlayRef}
        aria-hidden
        // bg-[#131313]: el mismo "negro" que usan el footer y las secciones
        // oscuras. No es negro puro, y cambiar de paleta no debería cambiar el
        // color de la cortina.
        className="pointer-events-none fixed inset-0 z-[100] grid h-[100dvh] w-screen place-items-center bg-[#131313]"
      >
        <div ref={logoRef}>
          <TransitionLogo />
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
