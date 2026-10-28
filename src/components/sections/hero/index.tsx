import { HeroContent } from "./content";
import { HeroLogo } from "./hero-logo";

export function Hero() {
  return (
    <main className="relative h-dvh overflow-hidden text-foreground">
      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col px-4 pt-[76px] sm:px-6 sm:pt-[84px] lg:px-8">
        <div className="flex flex-1 items-center gap-8 xl:gap-12">
          <HeroContent />

          <div className="relative hidden h-[62vh] max-h-[640px] w-[40%] shrink-0 lg:block">
            <div className="absolute inset-x-[-28%] inset-y-[-26%]">
              <HeroLogo />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
