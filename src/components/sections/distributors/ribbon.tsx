"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cx } from "@/components/ui/icon-glyph-styles";

gsap.registerPlugin(useGSAP);

const SPEED = 55;

type RibbonProps = {
  items: string[];
  href: string;

  reverse?: boolean;
  className?: string;
};

export function Ribbon({
  items,
  href,
  reverse = false,
  className,
}: RibbonProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      const run = () => {
        if (!trackRef.current) return;

        const half = track.scrollWidth / 2;
        if (!half) return;

        const duration = half / SPEED;
        const vars = { ease: "none", duration, repeat: -1 } as const;

        tweenRef.current = reverse
          ? gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, ...vars })
          : gsap.to(track, { xPercent: -50, ...vars });
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tweenRef.current?.kill();
        tweenRef.current = null;
      };
    },
    { scope: rootRef, dependencies: [reverse] },
  );

  return (
    <div
      ref={rootRef}

      className={cx("overflow-hidden", className)}

      onMouseEnter={() => tweenRef.current?.pause()}
      onMouseLeave={() => tweenRef.current?.play()}
    >
      <div ref={trackRef} className="flex w-max">
        {[0, 1].map((copy) => (
          <div
            key={copy}

            aria-hidden={copy === 1}
            className="flex shrink-0"
          >
            {items.map((item) => (
              <span key={item} className="flex shrink-0 items-center">
                <a
                  href={href}
                  tabIndex={copy === 1 ? -1 : undefined}
                  className="px-7 py-4 text-sm font-bold tracking-[0.18em] whitespace-nowrap uppercase transition-opacity hover:opacity-60"
                >
                  {item}
                </a>

                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rotate-45 bg-current"
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
