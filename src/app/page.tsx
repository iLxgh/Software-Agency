import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Organizations } from "@/components/sections/organizations";
import { Works } from "@/components/sections/works";
import { Services } from "@/components/sections/services";
import { ServiceCard } from "@/components/sections/services/service-card";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Organizations />
      <Works />
      <Services />

      {/* PREVIEW TEMPORAL: card centrada para verla. Quitar después. */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
        <ServiceCard
          title="Strategy"
          description="Positioning, messaging, and the story that makes your brand impossible to ignore."
        />
      </div>
    </>
  );
}
