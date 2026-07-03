import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { images } from "@/lib/assets";

export function ScheduleCard() {
  return (
    <div className="flex text-black w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-lg">
      <div className="flex flex-col justify-between p-5">
        <p className="text-body font-semibold leading-tight text-balance≈">
          Schedule a meeting to explore your idea!
        </p>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight">BLOXTEK</span>
          <IconBadge icon={ArrowUpRight} size="lg" className="text-white"/>
        </div>
      </div>

      <div className="relative hidden w-[52%] shrink-0 sm:block">
        <Image
          src={`${images.hero}/Schedule.png`}
          alt="Schedule preview"
          fill
          className="object-cover"
          draggable={false}
        />
      </div>
    </div>
  );
}
