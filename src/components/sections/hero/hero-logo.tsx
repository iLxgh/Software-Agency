"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { images } from "@/lib/assets";
import { ENTRANCE } from "@/lib/motion";

// three.js pesa: fuera del bundle inicial y sin prerender (necesita WebGL).
const ParticleLogo = dynamic(
  () => import("@/components/three/particle-logo").then((m) => m.ParticleLogo),
  { ssr: false },
);

/**
 * Comprueba que el navegador pueda darnos un contexto WebGL AHORA, no solo que
 * lo soporte en teoría. Cada pestaña tiene un presupuesto de contextos, y
 * cuando se agota (típico en desarrollo, donde cada hot-reload del <Canvas>
 * consume uno) el navegador los bloquea: sin esta comprobación, three lanza y
 * el error se propaga como unhandledRejection tumbando la página entera.
 */
function canUseWebGL() {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    if (!gl) return false;
    // Libera el contexto de sondeo, que si no gastaría uno del presupuesto.
    (gl as WebGLRenderingContext)
      .getExtension("WEBGL_lose_context")
      ?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function HeroLogo() {
  // Solo se descarga el chunk 3D si el viewport da para mostrarlo y si de
  // verdad hay WebGL disponible.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const supported = canUseWebGL();
    const sync = () => setEnabled(supported && mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Sin WebGL el hero se queda sin logo, pero el resto de la página funciona.
  if (!enabled) return null;

  return (
    <ParticleLogo
      className="h-full! w-full!"
      src={`${images.hero}/Vector.png`}
      // Sobre el PNG de 453x475: density 2 ≈ 7.600 partículas, 3 ≈ 3.500.
      density={3}
      pointSize={2.2}
      // Radio mayor que el alto del logo (2 unidades): el cursor influye en
      // toda la nube, con muy poca fuerza en los extremos.
      radius={2.45}
      strength={0.32}
      // Fracción del canvas que ocupa el logo. Es bajo a propósito: el canvas
      // desborda su hueco de layout (ver hero/index.tsx) para dejar aire a las
      // partículas, así que el logo debe ocupar solo una parte de él.
      fit={0.62}
      color="#171717"
      // Movimiento en reposo: amplitud, grano del ruido y velocidad.
      drift={0.045}
      noiseScale={0.8}
      noiseSpeed={0.16}
      // Retardo del cursor: más bajo = más arrastre.
      follow={0.03}
      revealDelay={ENTRANCE.gate + ENTRANCE.title}
    />
  );
}
