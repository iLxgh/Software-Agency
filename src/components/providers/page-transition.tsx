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

const TIMING = {
  cover: { duration: 0.6, ease: "power4.inOut" },

  radius: 100,

  word: { duration: 0.7, stagger: 0.04, ease: "power3.out" },

  hold: 0.1,

  reveal_cue: 1.4,

  reveal: { duration: 0.7, ease: "power4.inOut" },

  reduced: 0.2,
} as const;

type TransitionContextValue = {
  navigate: (href: string) => void;

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

  const busyRef = useRef(false);

  const pendingRef = useRef<{ href: string; resolve: () => void } | null>(null);

  const wordPaths = useCallback(
    () =>
      gsap.utils.toArray<SVGPathElement>(
        logoRef.current?.querySelectorAll("[data-wordmark-path]") ?? [],
      ),
    [],
  );

  const resetWord = useCallback(() => {
    gsap.set(wordPaths(), { y: WORDMARK_HEIGHT });
  }, [wordPaths]);

  useGSAP(
    () => {
      gsap.set(overlayRef.current, { yPercent: 100, autoAlpha: 1 });
      resetWord();
    },
    { scope: overlayRef },
  );

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

      lockScroll();

      const waitForRoute = () =>
        new Promise<void>((resolve) => {
          pendingRef.current = { href, resolve };
          router.push(href);

          window.setTimeout(() => {
            if (pendingRef.current?.resolve === resolve) {
              pendingRef.current = null;
              resolve();
            }
          }, 3000);
        });

      const finish = () => {
        gsap.set(overlayRef.current, { yPercent: 100, borderRadius: 0 });
        resetWord();
        unlockScroll();

        busyRef.current = false;

        setCovering(false);

        requestAnimationFrame(() =>
          requestAnimationFrame(() => ScrollTrigger.refresh()),
        );
      };

      if (reduce) {
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

        .call(() => {
          void waitForRoute().then(() => {
            jumpToTop();
          });
        })

        .to(wordPaths(), {
          y: 0,
          duration: TIMING.word.duration,
          stagger: TIMING.word.stagger,
          ease: TIMING.word.ease,
        })

        .to(overlayRef.current, {
          yPercent: -100,
          borderBottomLeftRadius: TIMING.radius,
          borderBottomRightRadius: TIMING.radius,
          duration: TIMING.reveal.duration,
          ease: TIMING.reveal.ease,
          delay: TIMING.hold,
          onComplete: finish,
        })

        .call(() => setCovering(false), [], `>-${TIMING.reveal_cue}`);
    },
    [pathname, router, wordPaths, resetWord],
  );

  return (
    <TransitionContext.Provider value={{ navigate, covering }}>
      {children}

      <div
        ref={overlayRef}
        aria-hidden

        className="pointer-events-none fixed inset-0 z-[100] grid h-[100dvh] w-screen place-items-center bg-[#131313]"
      >
        <div ref={logoRef}>
          <TransitionLogo />
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
