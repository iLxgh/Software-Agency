"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Volume2 } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { IconLink } from "@/components/ui/icon-link";
import { AnimatedText } from "@/components/ui/animated-text";
import { ENTRANCE } from "@/lib/motion";
import { useArrowHover } from "@/lib/use-arrow-hover";

gsap.registerPlugin(useGSAP);

const navLinks = ["About", "Work", "Services", "Process"];

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const talkRef = useRef<HTMLAnchorElement>(null);

  useArrowHover(talkRef, { direction: "up-right" });

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduce) return;

      gsap.from(navRef.current, {
        yPercent: -140,
        autoAlpha: 0,
        duration: ENTRANCE.navbarDuration,
        delay: ENTRANCE.navbar,
        ease: ENTRANCE.ease,
      });
    },
    { scope: navRef }
  );

  return (
    <header className="flex justify-center pt-4 sm:pt-6 text-black">
      <nav
        ref={navRef}
        className="flex w-full max-w-4xl items-center gap-4 rounded-2xl bg-card px-5 py-3 shadow-[0_0_24px_rgba(0,0,0,0.12)] sm:px-6"
      >
        <a href="#" className="text-xl font-extrabold tracking-tight">
          <AnimatedText as="span" delay={ENTRANCE.navText}>
            BLOXTEK
          </AnimatedText>
        </a>

        <ul className="mx-auto hidden items-center gap-7 md:flex">
          {navLinks.map((link, i) => (
            <li key={link}>
              <a
                href="#"
                className="text-small font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <AnimatedText
                  as="span"
                  delay={ENTRANCE.navText + i * ENTRANCE.navTextStagger}
                >
                  {link}
                </AnimatedText>
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <IconLink
            ref={talkRef}
            href="#"
            icon={ArrowUpRight}
            iconAnimateIn
            iconDelay={ENTRANCE.icon.talk}
          >
            <AnimatedText
              as="span"
              className="hidden sm:inline"
              delay={ENTRANCE.navText}
            >
              Talk to us
            </AnimatedText>
          </IconLink>
          <IconButton
            icon={Volume2}
            aria-label="Toggle sound"
            animateIn
            delay={ENTRANCE.icon.sound}
          />
        </div>
      </nav>
    </header>
  );
}
