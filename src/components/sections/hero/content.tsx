import { ArrowDown, Check } from "lucide-react";
import { IconLink } from "@/components/ui/icon-link";
import { ScheduleCard } from "./schedule-card";

export function HeroContent() {
  return (
    <section className="flex flex-1 flex-col justify-center py-8">
      <div className="flex items-center gap-3">
        <span className="flex size-7  text-white items-center justify-center rounded-md bg-brand">
          <Check className="size-4" strokeWidth={3} />
        </span>
        <p className="text-small font-medium">
          B2B / B2G Blockchain Solutions Provider
        </p>
      </div>

      <h1 className="mt-5 max-w-5xl text-balance font-neue-bold text-title">
        We Build{" "}
        <span className="font-baskerville italic">high-performance</span>{" "}
        marketing engines for <br/> B2B Brands
      </h1>

      <p className="mt-6 max-w-md text-pretty text-body text-foreground/80">
        We build, optimize, and scale marketing engines that generate pipeline
        and improve marketing ROI
      </p>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
        <IconLink href="#" icon={ArrowDown} iconSize="lg" className="text-small">
          <span>Discover more</span>
        </IconLink>

        <ScheduleCard />
      </div>
    </section>
  );
}
