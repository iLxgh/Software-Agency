import { Hero } from "@/components/sections/hero";
// import { About } from "@/components/sections/about";
import { Problem } from "@/components/sections/problem";
// import { Organizations } from "@/components/sections/organizations";
import { ApproachIntro, ApproachCards } from "@/components/sections/approach";
// import { Works } from "@/components/sections/works";
// import { Services } from "@/components/sections/services";
import { Stack } from "@/components/sections/stack";
import { Trust } from "@/components/sections/trust";
import { Distributors } from "@/components/sections/distributors";
import { Contact } from "@/components/sections/contact";
// import { Process } from "@/components/sections/process";
import { Platforms } from "@/components/sections/platforms";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <>
      <Hero />
      {/* Sección de la frase grande: fuera del render por ahora, el componente
          sigue en src/components/sections/about. */}
      {/* <About /> */}
      {/* Agenda una llamada + slider de verbos: fuera del render, el
          componente sigue en src/components/sections/meeting.
          Sus dos mitades estaban dichas mejor en otro sitio —la llamada en
          Contact, con sus tres pasos; los verbos en Approach, con sus cuatro
          formas de trabajo— y el hueco que dejan lo ocupa Problem, que es lo
          que de verdad faltaba después del hero. */}
      {/* <Meeting /> */}
      <Problem />
      {/* Carrusel de organizaciones: fuera del render por ahora, el componente
          sigue en src/components/sections/organizations. */}
      {/* <Organizations /> */}
      {/* Superposición: ApproachIntro queda sticky y ApproachCards sube por
          encima tapándolo. Tienen que ser hermanas adyacentes — el efecto se
          engancha al nextElementSibling. */}
      <ApproachIntro />
      <ApproachCards />
      {/* Success Projects: fuera del render por ahora, el componente sigue en
          src/components/sections/works. */}
      {/* <Works /> */}
      {/* Services ("What we make, made clear"): fuera del render por ahora, el
          componente sigue en src/components/sections/services. Stack reusa su
          mismo formato (intro sticky + cards por encima). */}
      {/* <Services /> */}
      <Stack />
      {/* Process (los videos de pasos): fuera del render por ahora, el
          componente sigue en src/components/sections/process. */}
      {/* <Process /> */}
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
