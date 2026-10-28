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

  target?: string;

  href?: string;

  action?: "about";

  blurb?: string;

  children?: NavLink[];
};

const NAV_ITEM =
  "relative inline-flex items-center rounded-md px-2.5 py-1 text-small font-medium text-muted-foreground transition-colors hover:text-foreground";

const HOVER_BOX =
  "pointer-events-none absolute inset-0 origin-left scale-x-0 rounded-md bg-foreground/10";

const ACTIVE_DOT =
  "pointer-events-none absolute top-1/2 left-0.5 size-1.5 -translate-y-1/2 rounded-full bg-brand";

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

  const pathname = usePathname();
  const talkRef = useRef<HTMLAnchorElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const [hovered, setHovered] = useState<number | null>(null);

  const solutions = navLinks.find((l) => l.children)?.children ?? [];
  const cols =
    hovered === null
      ? "1fr 1fr 1fr"
      : solutions.map((_, i) => `${i === hovered ? GROW : SHRINK}fr`).join(" ");

  const soundOn = useSoundEnabled();
  const aboutOpen = useAboutOpen();

  useArrowHover(talkRef, { direction: "up-right" });

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

      gsap.set(nav, { autoAlpha: 0 });

      let splits: SplitText[] = [];
      let enterTl: gsap.core.Timeline | null = null;
      let st: ScrollTrigger | null = null;
      let call: gsap.core.Tween | null = null;

      const run = () => {
        const units = gsap.utils.toArray<HTMLElement>(
          nav.querySelectorAll(
            "[data-nav-text], [data-nav-logo], [data-nav-block]",
          ),
        );

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

        const talkBadge =
          (talkRef.current?.querySelector("svg")
            ?.parentElement as HTMLElement | null) ?? null;

        const soundBtn = nav.querySelector<HTMLElement>("[data-sound-toggle]");

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

            ENTRANCE.navText - ENTRANCE.navbar,
          );

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

        call = gsap.delayedCall(ENTRANCE.gate + ENTRANCE.navbar, () =>
          enterTl?.play(),
        );

        st = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            enterTl?.timeScale(1.6);

            if (self.scroll() < 80) {
              enterTl?.play();
              return;
            }

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

          onClick={(e) => {
            if (window.location.pathname !== "/") return;
            e.preventDefault();
            scrollToTop();
          }}
          aria-label="Ir al inicio"
          className="flex items-center"
        >
          <span className="block overflow-hidden">
            <span data-nav-logo className="block">
              <Image
                src={`${images.general}/logo-bloxtek.svg`}
                alt="BLOXTEK"
                width={138}
                height={39}

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

                  onMouseEnter={() => setMenuOpen(false)}

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
