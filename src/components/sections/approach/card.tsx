import { Check } from "lucide-react";
import {
  cx,
  iconGlyphIconSizeClasses,
  iconGlyphSizeClasses,
  iconGlyphVariantClasses,
} from "@/components/ui/icon-glyph-styles";
import type { ApproachCard } from "./slides";

const EASE_OUT = "ease-[cubic-bezier(0.16,1,0.3,1)]";

export type CardTone = "light" | "green";

export function Card({
  area,
  title,
  description,
  bold,
  deliverable,
  tone,
  index,
  className,
}: ApproachCard & { tone: CardTone; index: number; className?: string }) {
  const green = tone === "green";

  return (
    <article
      className={cx(
        "group relative flex w-[22rem] shrink-0 cursor-grab flex-col justify-between overflow-hidden rounded-2xl p-7",

        "select-none",

        green ? "text-background" : "text-foreground",

        className,
        green ? "bg-brand" : "bg-card",
        "shadow-[0_8px_30px_rgba(0,0,0,0.35)]",

        "transition-[translate,box-shadow] duration-500",
        EASE_OUT,
        "hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]",
        "motion-reduce:transition-none",
      )}
    >
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute -top-6 -right-3 font-neue-bold text-[9rem] leading-none tracking-tighter select-none",
          green ? "text-background/25" : "text-brand/25",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className={cx(
              "h-3.5 w-0.5 rounded-full",
              green ? "bg-background" : "bg-brand",
            )}
          />
          <span
            className={cx(
              "text-[10px] font-bold tracking-[0.14em] uppercase",
              green ? "text-background/70" : "text-foreground/50",
            )}
          >
            {area}
          </span>
        </div>

        <h3 className="mt-5 font-neue-bold text-3xl leading-[1.05] tracking-tight text-balance">
          {title}
        </h3>

        <p
          className={cx(
            "mt-5 text-sm leading-relaxed text-pretty",
            green ? "text-background/80" : "text-foreground/60",
          )}
        >
          {description.split("\n").map((line, i) => (
            <span
              key={i}
              className={cx(
                "block",
                bold?.includes(line) &&
                  cx(
                    "font-neue-bold",
                    green ? "text-background" : "text-foreground",
                  ),
              )}
            >
              {line}
            </span>
          ))}
        </p>
      </div>

      <div className="relative">
        <span
          aria-hidden
          className={cx(
            "block h-px w-10 transition-[width] duration-700",
            EASE_OUT,
            "group-hover:w-full motion-reduce:transition-none",
            green ? "bg-background/40" : "bg-foreground/20",
          )}
        />

        <div className="mt-4 flex items-start gap-3">
          <span
            aria-hidden
            className={cx(
              "flex shrink-0 items-center justify-center rounded-lg",
              iconGlyphSizeClasses.sm,

              green
                ? iconGlyphVariantClasses.solid
                : iconGlyphVariantClasses.brand,

              "scale-100 transition-[scale] duration-500",
              EASE_OUT,
              "group-hover:scale-110 motion-reduce:transition-none",
            )}
          >
            <Check className={iconGlyphIconSizeClasses.sm} strokeWidth={2.5} />
          </span>

          <div>
            <span
              className={cx(
                "text-[10px] font-bold tracking-[0.14em] uppercase",
                green ? "text-background/60" : "text-foreground/40",
              )}
            >
              Entregable
            </span>
            <p className="mt-1 font-neue-bold text-sm leading-snug tracking-tight text-pretty">
              {deliverable}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
