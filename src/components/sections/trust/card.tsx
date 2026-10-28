import { TONES, type TrustCard as TrustCardData } from "./slides";

function renderHeadline(headline: string) {
  return headline.split("**").map((chunk, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-neue-bold">
        {chunk}
      </strong>
    ) : (
      <span key={i}>{chunk}</span>
    ),
  );
}

export function TrustCard({
  index,
  eyebrow,
  headline,
  support,
  badges,
  tone,
}: TrustCardData) {
  const { bg, logo, logoFrom, logoTo } = TONES[tone];

  return (
    <article
      style={{ backgroundColor: bg }}

      className="flex h-[75vh] w-full flex-col justify-between overflow-hidden rounded-3xl p-8 text-white sm:p-12 lg:p-16"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] font-bold tracking-[0.16em] uppercase">
          {eyebrow}
        </span>
        <span className="text-[11px] font-bold tabular-nums text-white/50">
          {index} / 04
        </span>
      </div>

      <div className="flex items-center gap-10 lg:gap-20">
        <div
          aria-hidden
          className="hidden aspect-square w-[22%] max-w-[260px] shrink-0 md:block"
          style={{
            backgroundImage: `linear-gradient(to right, ${logoFrom}, ${logoTo})`,
            maskImage: `url(${logo})`,
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",

            WebkitMaskImage: `url(${logo})`,
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
          }}
        />

        <div className="max-w-3xl">
          <p className="font-neue text-3xl leading-[1.1] tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {renderHeadline(headline)}
          </p>
          <p className="mt-6 max-w-lg font-neue text-base leading-relaxed text-white/60 sm:text-lg">
            {support}
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <li
            key={badge}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white/80"
          >
            {badge}
          </li>
        ))}
      </ul>
    </article>
  );
}
