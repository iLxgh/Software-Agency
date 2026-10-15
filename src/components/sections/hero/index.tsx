import { HeroContent } from "./content";
import { HeroLogo } from "./hero-logo";

export function Hero() {
  return (
    <main className="relative h-dvh overflow-hidden text-foreground">
      {/* pt = alto del navbar fijo (antes iba en el flujo y empujaba el hero):
          pt-4 + barra (py-3 + íconos size-9) = 76px, sm: pt-6 → 84px. */}
      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col px-4 pt-[76px] sm:px-6 sm:pt-[84px] lg:px-8">
        {/* Dos columnas desde lg: copy a la izquierda, logo de partículas a la
            derecha. Por debajo de lg el logo no se monta (ver HeroLogo). */}
        <div className="flex flex-1 items-center gap-8 xl:gap-12">
          <HeroContent />

          {/* Alto explícito: el <Canvas> mide su contenedor, y un h-full sobre
              un flex item centrado puede colapsar a 0. */}
          <div className="relative hidden h-[62vh] max-h-[640px] w-[40%] shrink-0 lg:block">
            {/* El canvas desborda su hueco de layout: las partículas empujadas
                por el cursor y las de la entrada llegan bastante más allá del
                logo, y si el canvas acaba ahí se ven cortadas. No intercepta
                clics, así que puede solaparse con el texto sin estorbar.
                Ojo: estos insets y el `fit` de HeroLogo van de la mano — si
                agrandas la caja, baja el fit para que el logo no crezca. */}
            <div className="absolute inset-x-[-28%] inset-y-[-26%]">
              <HeroLogo />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
