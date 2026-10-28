import Image from "next/image";
import { cx } from "@/components/ui/icon-glyph-styles";
import { platformsIntro, type Platform } from "./slides";

type QuadrantProps = Platform & {
  active?: boolean | null;
  onMouseEnter?: () => void;
};

const LOGO_MOTION =
  "transition-[width,height] duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none";

const ART_MOTION =
  "origin-bottom-right scale-100 transition-[scale] duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none";

export function Quadrant({
  name,
  description,
  audience,
  image,
  alt,
  logo,
  active = null,
  onMouseEnter,
}: QuadrantProps) {
  return (
    <article
      onMouseEnter={onMouseEnter}

      className="relative flex h-full cursor-pointer flex-col justify-between gap-6 overflow-hidden bg-[#F7F6F4] p-7 sm:p-8"
    >
      <div className="relative z-10 max-w-sm shrink-0">
        <h3 className="font-neue-bold text-3xl leading-[1.02] tracking-tight sm:text-4xl">
          {name}
        </h3>
        <p className="mt-4 font-neue text-base leading-relaxed text-foreground/60">
          {description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="font-neue text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase">
            {platformsIntro.audienceLabel}
          </span>
          {audience.map((item) => (
            <span
              key={item}
              className="rounded-lg border border-foreground/10 bg-foreground/[0.03] px-2.5 py-1 font-neue text-sm text-foreground/70"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-end">
        <div
          className={cx(
            "relative z-10 shrink-0 rounded-xl bg-foreground",
            LOGO_MOTION,

            active === true
              ? "size-16"
              : active === false
                ? "size-12"
                : "size-14",
          )}
        >
          <Image
            src={logo}
            alt={name}
            fill
            sizes="56px"
            className="object-contain p-3"
            draggable={false}
          />
        </div>

        <div
          className={cx(
            "pointer-events-none absolute top-0 -right-7 -bottom-7 left-[34%] sm:-right-8 sm:-bottom-8",
            ART_MOTION,

            active === true
              ? "scale-[1.08]"
              : active === false
                ? "scale-[0.94]"
                : "scale-100",
          )}
        >
          <Image
            src={image}
            alt={alt}
            fill
            sizes="(min-width: 768px) 36vw, 72vw"
            className="object-contain object-right-bottom"
            draggable={false}
          />
        </div>
      </div>
    </article>
  );
}
