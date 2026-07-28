import { HeroContent } from "./content";

export function Hero() {
  return (
    <main className="relative h-dvh overflow-hidden text-foreground">
      {/* pt = alto del navbar fijo (antes iba en el flujo y empujaba el hero):
          pt-4 + barra (py-3 + íconos size-9) = 76px, sm: pt-6 → 84px. */}
      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col px-4 pt-[76px] sm:px-6 sm:pt-[84px] lg:px-8">
        <HeroContent />
      </div>
    </main>
  );
}
