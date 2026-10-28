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

      {/* Superposición: ApproachIntro queda sticky y ApproachCards sube por
          encima tapándolo. Tienen que ser hermanas adyacentes — el efecto se
          engancha al nextElementSibling. */}
      <ApproachIntro />
      <ApproachCards />

      <Stack />
      <Platforms />

      {/* Footer reveal: el footer queda fijo detrás (sticky) y la última
          sección se desliza por encima descubriéndolo al final. El wrapper
          acota el sticky del footer a esta zona — por eso solo la ÚLTIMA
          sección puede vivir aquí dentro, y es Trust quien hereda ese papel.

          OJO: el footer se ancla al fondo del viewport en cuanto este wrapper
          entra en pantalla, así que llega a solaparse con la sección de arriba.
          Esa sección necesita un z-index que lo supere (ver el z-10 de
          Platforms) o el footer le asomará por el borde inferior. */}
      <Trust />

      {/* Cambia variant a "straight" para ver las dos cintas rectas en vez de
          cruzadas. */}
      <Distributors variant="crossed" />

      <div className="relative">
        <Contact />
        <Footer />
      </div>
    </>
  );
}
