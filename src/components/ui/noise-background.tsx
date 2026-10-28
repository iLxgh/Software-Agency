"use client";

import { useEffect, useRef } from "react";

type NoiseBackgroundProps = {
  opacity?: number;

  fps?: number;

  tileSize?: number;

  className?: string;
};

const MAX_BUFFER_PIXELS = 8_000_000;

export function NoiseBackground({
  opacity = 0.08,
  fps = 18,
  tileSize = 160,
  className = "fixed inset-0 -z-10 h-full w-full mix-blend-multiply",
}: NoiseBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(1, Math.round(rect.width));
      const cssH = Math.max(1, Math.round(rect.height));

      const scale = Math.min(1, Math.sqrt(MAX_BUFFER_PIXELS / (cssW * cssH)));

      width = canvas.width = Math.max(1, Math.round(cssW * scale));
      height = canvas.height = Math.max(1, Math.round(cssH * scale));
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

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

      const rect = canvas.getBoundingClientRect();
      const scaleY = height / Math.max(1, rect.height);
      const top = Math.max(0, Math.floor(-rect.top * scaleY));
      const bottom = Math.min(
        height,
        Math.ceil((window.innerHeight - rect.top) * scaleY),
      );
      const band = bottom - top;
      if (band <= 0) return;

      ctx.clearRect(0, top, width, band);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, top, width, band);
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      drawNoise();
      return () => observer.disconnect();
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

    let running = false;
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    let onScreen = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen && !document.hidden) start();
        else stop();
      },

      { rootMargin: "200px" },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (onScreen) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, [fps, tileSize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ opacity }}
    />
  );
}
