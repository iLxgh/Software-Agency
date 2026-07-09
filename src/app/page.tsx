import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Organizations } from "@/components/sections/organizations";
import { Works } from "@/components/sections/works";
import { Services } from "@/components/sections/services";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Organizations />
      <Works />
      <Services />
    </>
  );
}
