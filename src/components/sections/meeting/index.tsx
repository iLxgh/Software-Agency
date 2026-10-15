import { ScheduleCard } from "@/components/ui/schedule-card";
import { StatSlider } from "@/components/ui/stat-slider";
import { meetingSlides } from "./slides";

/**
 * Sección de media pantalla: tarjeta de "schedule a meeting" a la izquierda y
 * slider de cifras a la derecha, ambos alineados en el centro.
 */
export function Meeting() {
  return (
    <section
      id="meeting"
      className="relative text-foreground"
      aria-label="Agenda una reunión"
    >
      {/* divisor: respeta el ancho del contenedor */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-t border-foreground/20" />
      </div>

      {/* lg:items-stretch = la tarjeta y el slider comparten altura; en móvil
          se apilan y el align vuelve a ser horizontal. */}
      <div className="mx-auto flex min-h-[50vh] max-w-[1400px] flex-col items-center justify-between gap-14 px-4 py-16 sm:px-6 lg:flex-row lg:items-stretch lg:gap-20 lg:px-8">
        <ScheduleCard
          reveal="scroll"
          className="max-w-md lg:max-w-none lg:w-[48%]"
        />
        <StatSlider
          slides={meetingSlides}
          size="lg"
          // Sin justify-between: el slider no estira su contenido para llenar
          // el alto de la tarjeta, se queda compacto y centrado.
          className="w-full max-w-md lg:self-center"
        />
      </div>
    </section>
  );
}
