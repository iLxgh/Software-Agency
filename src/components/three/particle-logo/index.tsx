"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ParticleCloud, type ParticleCloudProps } from "./particle-cloud";

export type ParticleLogoProps = ParticleCloudProps & { className?: string };

/**
 * Logo en PNG convertido en nube de partículas interactiva.
 * El canvas ocupa todo su contenedor, así que el padre debe tener alto.
 */
export function ParticleLogo({ className, ...props }: ParticleLogoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  // El hero está arriba del todo de una página muy larga. Sin esto, three sigue
  // renderizando a 60 fps con miles de partículas aunque el logo lleve cinco
  // pantallas fuera de la vista — y lo mismo con la pestaña en segundo plano.
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let onScreen = true;
    const sync = () => setActive(onScreen && !document.hidden);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "100px" },
    );
    io.observe(el);

    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div ref={wrapRef} className="h-full w-full">
      <Canvas
        className={className}
        // "never" congela el bucle sin desmontar la escena: al volver retoma
        // donde estaba, sin tener que recrear el contexto WebGL ni volver a
        // muestrear el PNG.
        frameloop={active ? "always" : "never"}
        // Ortográfica: el logo es plano, y así el tamaño de cada punto no depende
        // de la distancia a la cámara.
        orthographic
        camera={{ position: [0, 0, 10], zoom: 200, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        // El canvas es más grande que el logo (necesita aire para que las
        // partículas empujadas no se corten) y puede solaparse con el texto del
        // hero, así que no debe interceptar clics: el cursor se sigue desde
        // window, no desde el propio canvas.
        style={{ pointerEvents: "none" }}
        // Decorativo: fuera del árbol de accesibilidad.
        aria-hidden
      >
        <ParticleCloud {...props} />
      </Canvas>
    </div>
  );
}
