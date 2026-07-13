import { HeroContent } from "./content";

export function Hero() {
  return (
    <main className="relative h-dvh overflow-hidden text-foreground">
      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col px-4 sm:px-6 lg:px-8">
        <HeroContent />
      </div>
    </main>
  );
}
