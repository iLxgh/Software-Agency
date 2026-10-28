import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { ApproachIntro, ApproachCards } from "@/components/sections/approach";
import { Stack } from "@/components/sections/stack";
import { Platforms } from "@/components/sections/platforms";
import { Trust } from "@/components/sections/trust";
import { Distributors } from "@/components/sections/distributors";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />

      <ApproachIntro />
      <ApproachCards />

      <Stack />
      <Platforms />

      <Trust />

      <Distributors variant="crossed" />

      <div className="relative">
        <Contact />
        <Footer />
      </div>
    </>
  );
}
