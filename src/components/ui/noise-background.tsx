"use client";

import { useEffect, useRef } from "react";

type NoiseBackgroundProps = {
  /** Opacidad de la capa de ruido (0-1). */
  opacity?: number;
  /** Cuadros por segundo del parpadeo. Más bajo = más "TV vieja". */
  fps?: number;
  /** Tamaño del tile de ruido en px. Más chico = puntos más finos. */
  tileSize?: number;
  /**
   * Clases de posicionamiento/blend del canvas. Por defecto es una capa fija
   * sobre toda la web con multiply (para fondos claros). Para fondos oscuros
   * usa una capa scopeada con `mix-blend-screen` (aclara en vez de oscurecer).
   */
  className?: string;
};

/**
 * Tope del búfer, solo como tope de MEMORIA (~34 MB de bitmap). No se usa para
 * abaratar el repintado — de eso se encarga dibujar únicamente la franja
 * visible — así que está alto a propósito: escalar el búfer engorda el grano,
 * y como cada sección mide distinto, cada una acababa con un grano diferente.
 */
const MAX_BUFFER_PIXELS = 8_000_000;

/**
 * Estática de TV animada como capa de ruido.
 * Regenera un tile de ruido por frame (throttled) y lo repite por pantalla.
 * Respeta prefers-reduced-motion (deja un solo frame estático).
 */
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

    /**
     * El búfer se dimensiona con la caja REAL del canvas, no con la ventana.
     * Con `window.innerHeight`, una capa scopeada a una sección de varias
     * pantallas de alto (`absolute inset-0 h-full`) acababa con un bitmap de un
     * viewport estirado por CSS: el ruido se veía en bandas alargadas en vez de
     * en puntos.
     */
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(1, Math.round(rect.width));
      const cssH = Math.max(1, Math.round(rect.height));

      // Tope de píxeles para secciones muy altas: baja la resolución del búfer
      // de forma UNIFORME, así el grano sigue siendo cuadrado (solo un pelín
      // más grueso) y no se repinta un canvas gigante en cada frame.
      const scale = Math.min(1, Math.sqrt(MAX_BUFFER_PIXELS / (cssW * cssH)));

      width = canvas.width = Math.max(1, Math.round(cssW * scale));
      height = canvas.height = Math.max(1, Math.round(cssH * scale));
    };

    resize();

    // ResizeObserver y no `window.resize`: la capa puede cambiar de alto sin
    // que la ventana cambie (contenido dinámico, sticky, etc.).
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

      // El patrón SE RECREA cada frame a propósito: `createPattern` copia la
      // imagen en ese momento, no mantiene una referencia viva al canvas del
      // tile. Creado una sola vez se congela —y si se crea antes del primer
      // putImageData, se queda transparente y no se ve nada.
      const pattern = ctx.createPattern(tile, "repeat");
      if (!pattern) return;

      // Solo se repinta la franja que se está viendo. El búfer sigue a escala
      // 1:1 con la caja (grano idéntico en todas las secciones, midan lo que
      // midan) pero el coste por frame es el de una pantalla, no el de una
      // sección de seis mil píxeles de alto.
      //
      // Lo que queda fuera conserva el último ruido dibujado. Da igual: es
      // ruido aleatorio y, por definición, no está a la vista.
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

    // --- Arranque y parada ---------------------------------------------------
    // Estas capas cubren SECCIONES enteras, muchas de varias pantallas de alto,
    // y hay una por sección. Sin esto, todas repintan su superficie completa 18
    // veces por segundo aunque estén fuera de la vista: con siete capas activas
    // eran ~190 millones de píxeles por segundo, y de ahí el ventilador.
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

    // Solo se anima lo que se está viendo.
    let onScreen = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen && !document.hidden) start();
        else stop();
      },
      // Un poco de margen para que ya esté en marcha cuando entre.
      { rootMargin: "200px" },
    );
    io.observe(canvas);

    // Y nada se anima con la pestaña en segundo plano.
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
