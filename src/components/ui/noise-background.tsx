"use client";

import { useEffect, useRef } from "react";

type NoiseBackgroundProps = {
  /** Opacidad de la capa de ruido (0-1). */
  opacity?: number;
  /** Cuadros por segundo del parpadeo. Más bajo = más "TV vieja". */
  fps?: number;
  /** Tamaño del tile de ruido en px. Más chico = puntos más finos. */
  tileSize?: number;
};

/**
 * Estática de TV animada como capa fija sobre toda la web.
 * Regenera un tile de ruido por frame (throttled) y lo repite por pantalla.
 * Respeta prefers-reduced-motion (deja un solo frame estático).
 */
export function NoiseBackground({
  opacity = 0.08,
  fps = 18,
  tileSize = 160,
}: NoiseBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Tile fuera de pantalla que se regenera con ruido.
    const tile = document.createElement("canvas");
    tile.width = tileSize;
    tile.height = tileSize;
    const tileCtx = tile.getContext("2d");
    if (!tileCtx) return;
    const imageData = tileCtx.createImageData(tileSize, tileSize);
    const buffer = imageData.data;

    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawNoise = () => {
      for (let i = 0; i < buffer.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        buffer[i] = v;
        buffer[i + 1] = v;
        buffer[i + 2] = v;
        buffer[i + 3] = 255;
      }
      tileCtx.putImageData(imageData, 0, 0);

      const pattern = ctx.createPattern(tile, "repeat");
      if (!pattern) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      drawNoise();
      return () => window.removeEventListener("resize", resize);
    }

    let raf = 0;
    let last = 0;
    const interval = 1000 / fps;

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < interval) return;
      last = t;
      drawNoise();
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [fps, tileSize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full mix-blend-multiply"
      style={{ opacity }}
    />
  );
}
