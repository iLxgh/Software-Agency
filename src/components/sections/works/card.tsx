import Image from "next/image";
import type { WorkCard } from "./slides";

export function Card({ image, alt, title, description, stat }: WorkCard) {
  return (
    <div className="flex w-full flex-col gap-8 lg:flex-row">
      {/* imagen */}
      <div className="w-full shrink-0 lg:w-[65%]">
        <Image
          src={image}
          alt={alt}
          width={800}
          height={600}
          className="aspect-4/3 w-full rounded-2xl object-cover shadow-[0_0_24px_rgba(0,0,0,0.35)]"
        />
      </div>

      {/* info */}
      <div className="flex w-full flex-col justify-start py-2 lg:w-[35%]">
        <h3 className="mb-4 font-neue-bold text-xl text-white">{title}</h3>

        <p className="mb-12 font-neue text-base leading-relaxed text-white/50">
          {description}
        </p>

        <div className="mt-auto lg:mt-0">
          <span className="mb-3 inline-block rounded-lg bg-white/10 px-3 py-1 font-neue-bold text-lg text-white">
            {stat.value}
          </span>
          <p className="font-neue text-sm leading-tight text-white/50 whitespace-pre-line">
            {stat.label}
          </p>
        </div>
      </div>
    </div>
  );
}
