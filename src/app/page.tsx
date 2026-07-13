import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Organizations } from "@/components/sections/organizations";
import { Works } from "@/components/sections/works";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Organizations />
      <Works />
      <Services />
      {/* Footer reveal: el footer queda fijo detrás y Process se desliza por
          encima descubriéndolo al final. El wrapper limita el sticky del footer
          a esta zona (para que no se asome tras las secciones de arriba). */}
      <div className="relative">
        <Process />
        <Footer />
      </div>
    </>
  );
}
