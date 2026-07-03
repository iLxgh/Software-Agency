import { Navbar } from "@/components/layout/navbar";
import { HeroContent } from "./content";

export function Hero() {
  return (
    <main className="relative h-dvh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col px-4 sm:px-6 lg:px-8">
        <Navbar />
        <HeroContent />
      </div>
    </main>
  );
}
