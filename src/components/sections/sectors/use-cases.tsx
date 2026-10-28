"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Check, Pause } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { FollowCursor } from "@/components/ui/follow-cursor";
import { cx } from "@/components/ui/icon-glyph-styles";
import { platforms } from "@/components/sections/platforms/slides";
import { useCasesByPlatform, type UseCase } from "./slides";

gsap.registerPlugin(useGSAP);

const SPEED = 26;

const GAP = "pb-4";

const EASE_OUT = "ease-[cubic-bezier(0.16,1,0.3,1)]";

const MASK =
  "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)";

function MarqueeColumn({
  cases,
  direction,
  offset = 0,
}: {
  cases: UseCase[];
  direction: "up" | "down";
  offset?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
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
        const half = track.scrollHeight / 2;
        if (!half) return;

        const vars = { ease: "none", duration: half / SPEED, repeat: -1 };
        tweenRef.current =
          direction === "up"
            ? gsap.to(track, { yPercent: -50, ...vars })
            : gsap.fromTo(track, { yPercent: -50 }, { yPercent: 0, ...vars });

        tweenRef.current.progress(offset);
      };

      const fonts = document.fonts?.ready ?? Promise.resolve();
      fonts.then(run);

      return () => {
        tweenRef.current?.kill();
        tweenRef.current = null;
      };
    },

    { scope: wrapRef },
  );

  return (
    <div
      ref={wrapRef}

      onMouseEnter={() => tweenRef.current?.pause()}
      onMouseLeave={() => tweenRef.current?.play()}
    >
      <div ref={trackRef} className="will-change-transform">
        {[0, 1].map((copy) =>
          cases.map((uc, i) => (
            <div key={`${copy}-${uc.perfil}`} className={GAP}>
              <UseCaseCard
                useCase={uc}
                index={i}
                total={cases.length}

                duplicate={copy === 1}
              />
            </div>
          )),
        )}
      </div>
    </div>
  );
}

function UseCaseCard({
  useCase,
  index,
  total,
  duplicate,
}: {
  useCase: UseCase;
  index: number;
  total: number;
  duplicate: boolean;
}) {
  const tall = index % 3 === 1;
  const short = index % 3 === 2;

  return (
    <article
      data-card
      aria-hidden={duplicate || undefined}
      className={cx(
        "group relative rounded-2xl bg-background shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:z-10",
        tall ? "p-6" : short ? "p-4" : "p-5",

        "transition-[scale,background-color,box-shadow] duration-400",
        EASE_OUT,
        "hover:scale-[1.04] hover:bg-brand/10 hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)]",
        "motion-reduce:transition-none motion-reduce:hover:scale-100",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-bold text-brand-foreground tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[10px] font-bold text-foreground/30 tabular-nums">
          / {String(total).padStart(2, "0")}
        </span>
      </div>

      <h3
        className={cx(
          "mt-3 font-neue-bold leading-tight tracking-tight text-balance text-foreground",
          tall ? "text-xl" : "text-lg",
        )}
      >
        {useCase.perfil}
      </h3>

      <p
        className={cx(
          "mt-2 font-neue leading-snug text-pretty text-foreground/60",
          tall ? "text-base" : "text-sm",
        )}
      >
        {useCase.caso}
      </p>
    </article>
  );
}

export function UseCases() {
  const [active, setActive] = useState(0);

  const [shown, setShown] = useState(0);

  const gridRef = useRef<HTMLDivElement>(null);

  const current = platforms[shown];
  const cases = useCasesByPlatform[current.name] ?? [];

  const cards = () =>
    gsap.utils.toArray<HTMLElement>(
      gridRef.current?.querySelectorAll("[data-card]") ?? [],
    );

  const select = (i: number) => {
    if (i === active) return;
    setActive(i);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setShown(i);
      return;
    }

    gsap.to(cards(), {
      autoAlpha: 0,
      duration: 0.25,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => setShown(i),
    });
  };

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      gsap.fromTo(
        cards(),
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.5,
          stagger: 0.03,
          ease: "power3.out",
          overwrite: true,
        },
      );
    },
    { dependencies: [shown], scope: gridRef },
  );

  return (
    <section
      aria-label="Casos de uso por plataforma"
      className="border-t border-foreground/15 py-16 lg:py-0"
    >
      <div className="flex flex-col gap-12 lg:h-screen lg:flex-row lg:items-center lg:gap-20">
        <div className="lg:w-[42%] lg:shrink-0">
          <div className="mb-8 flex items-center gap-3">
            <IconBadge icon={Check} size="sm" variant="brand" />
            <span className="font-neue text-base">
              Casos de uso por plataforma
            </span>
          </div>

          <h2 className="font-neue-bold text-3xl leading-[1.05] tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Qué resuelve cada plataforma,{" "}
            <span className="font-baskerville text-[0.92em] italic">
              y para quién.
            </span>
          </h2>

          <p className="mt-5 max-w-md font-neue text-base leading-relaxed text-pretty text-foreground/60">
            Las mismas cuatro, usos distintos según quién las use.
          </p>

          <div
            role="tablist"
            aria-label="Plataformas"
            className="mt-8 flex flex-col gap-2"
          >
            {platforms.map((platform, i) => {
              const selected = i === active;
              return (
                <button
                  key={platform.name}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => select(i)}
                  className={cx(
                    "group relative cursor-pointer overflow-hidden rounded-xl border py-3 pr-3 pl-5 text-left",
                    "transition-[colors,translate] duration-500",
                    EASE_OUT,
                    selected
                      ? "border-transparent bg-foreground text-background"
                      : "border-foreground/10 bg-foreground/[0.03] hover:translate-x-1 hover:border-brand",
                  )}
                >
                  <span
                    aria-hidden
                    className={cx(
                      "absolute inset-y-0 left-0 w-1 origin-top bg-brand",
                      "transition-transform duration-500",
                      EASE_OUT,
                      selected
                        ? "scale-y-100"
                        : "scale-y-0 group-hover:scale-y-100",
                    )}
                  />

                  <span className="flex items-center justify-between gap-4">
                    <span className="font-neue-bold text-lg tracking-tight">
                      {platform.name}
                    </span>
                    <span
                      className={cx(
                        "grid size-7 shrink-0 place-items-center rounded-lg transition-all duration-500",
                        EASE_OUT,
                        selected
                          ? "bg-brand text-brand-foreground opacity-100"
                          : "bg-brand/0 text-brand opacity-0 group-hover:bg-brand/15 group-hover:opacity-100",
                      )}
                    >
                      <ArrowUpRight
                        aria-hidden
                        className="size-4"
                        strokeWidth={2.5}
                      />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <FollowCursor
          className="relative flex-1 lg:h-full"
          content={
            <div
              ref={gridRef}

              className="relative h-[60vh] lg:-mx-6 lg:h-full lg:px-6 lg:py-16"
              style={{
                maskImage: MASK,
                maskRepeat: "no-repeat",
                maskSize: "100% 100%",
                WebkitMaskImage: MASK,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskSize: "100% 100%",
              }}
            >
              <div className="grid h-full grid-cols-2 gap-4">
                <MarqueeColumn cases={cases} direction="down" />
                <MarqueeColumn cases={cases} direction="up" offset={0.5} />
              </div>
            </div>
          }
        >
          <Pause className="size-4" strokeWidth={0} fill="currentColor" />
        </FollowCursor>
      </div>
    </section>
  );
}
