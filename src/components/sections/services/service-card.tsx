import Image from "next/image";
import { images } from "@/lib/assets";

type ServiceCardProps = {
  image?: string;
  alt?: string;
  title: string;
  description: string;
};

export function ServiceCard({
  image = `${images.works}/project1.jpg`,
  alt = "",
  title,
  description,
}: ServiceCardProps) {
  return (
    <article className="relative h-[400px] w-[320px] overflow-hidden rounded-2xl">
      {/* imagen que cubre toda la card */}
      <Image src={image} alt={alt} fill className="object-cover" />

      {/* panel blanco con bordes superiores redondeados */}
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-6">
        <h3 className="font-neue-bold text-lg text-foreground">{title}</h3>
        <p className="mt-2 font-neue text-sm leading-relaxed text-foreground/60">
          {description}
        </p>
      </div>
    </article>
  );
}
