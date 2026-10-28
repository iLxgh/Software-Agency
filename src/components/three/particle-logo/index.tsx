"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ParticleCloud, type ParticleCloudProps } from "./particle-cloud";

export type ParticleLogoProps = ParticleCloudProps & { className?: string };

export function ParticleLogo({ className, ...props }: ParticleLogoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

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

        frameloop={active ? "always" : "never"}

        orthographic
        camera={{ position: [0, 0, 10], zoom: 200, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}

        style={{ pointerEvents: "none" }}

        aria-hidden
      >
        <ParticleCloud {...props} />
      </Canvas>
    </div>
  );
}
