"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { images } from "@/lib/assets";
import { ENTRANCE } from "@/lib/motion";

const ParticleLogo = dynamic(
  () => import("@/components/three/particle-logo").then((m) => m.ParticleLogo),
  { ssr: false },
);

function canUseWebGL() {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    if (!gl) return false;

    (gl as WebGLRenderingContext)
      .getExtension("WEBGL_lose_context")
      ?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function HeroLogo() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const supported = canUseWebGL();
    const sync = () => setEnabled(supported && mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!enabled) return null;

  return (
    <ParticleLogo
      className="h-full! w-full!"
      src={`${images.hero}/Vector.png`}

      density={3}
      pointSize={2.2}

      radius={2.45}
      strength={0.32}

      fit={0.62}
      color="#171717"

      drift={0.045}
      noiseScale={0.8}
      noiseSpeed={0.16}

      follow={0.03}
      revealDelay={ENTRANCE.gate + ENTRANCE.title}
    />
  );
}
