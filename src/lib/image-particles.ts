/**
 * Convierte un PNG con transparencia en una nube de puntos: dibuja la imagen en
 * un canvas 2D, lee sus píxeles con getImageData() y queda un punto por cada
 * píxel cuyo alpha supera el umbral.
 *
 * Las posiciones salen normalizadas: el alto de la imagen ocupa 2 unidades de
 * mundo (de -1 a 1) y el ancho se deriva del aspect ratio. Así el componente 3D
 * solo tiene que ajustar el zoom de la cámara para escalar el logo.
 */

export type ParticleSample = {
  /** xyz por partícula. */
  positions: Float32Array;
  /** Semilla 0..1 por partícula, para desincronizar el movimiento. */
  seeds: Float32Array;
  count: number;
  /** Ancho / alto del logo en unidades de mundo. */
  aspect: number;
};

export type SampleOptions = {
  /**
   * Píxeles de la imagen original por partícula. Es el control de densidad:
   * 2 = muy denso, 6 = disperso. El coste crece al cuadrado (density 2 genera
   * ~4x más partículas que density 4).
   */
  density?: number;
  /** Alpha mínimo (0..1) para considerar el píxel parte del logo. */
  alphaThreshold?: number;
  /** Tope duro: por encima se descartan partículas al azar, sin sesgo. */
  maxParticles?: number;
  /**
   * Desorden aleatorio dentro de cada celda, en fracción de celda (0..1).
   * Rompe la rejilla y hace que la nube se vea orgánica.
   */
  jitter?: number;
};

export async function sampleImageParticles(
  src: string,
  {
    density = 3,
    alphaThreshold = 0.35,
    maxParticles = 12000,
    jitter = 0.7,
  }: SampleOptions = {}
): Promise<ParticleSample> {
  const img = new Image();
  img.decoding = "async";
  // El PNG vive en /public (mismo origen), así que el canvas no se contamina.
  img.src = src;
  await img.decode();

  // Reducimos la imagen antes de leerla: cada píxel del canvas reducido es un
  // candidato a partícula, y el downscale promedia el alpha (bordes más suaves).
  const w = Math.max(1, Math.round(img.naturalWidth / density));
  const h = Math.max(1, Math.round(img.naturalHeight / density));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No se pudo crear el contexto 2D para el muestreo");

  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  const minAlpha = alphaThreshold * 255;

  // Primera pasada: cuántos píxeles opacos hay, para saber si hay que diezmar.
  let opaque = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] >= minAlpha) opaque++;
  }
  const keepChance = opaque > maxParticles ? maxParticles / opaque : 1;

  const aspect = w / h;
  const cell = 2 / h; // lado de una celda en unidades de mundo
  const positions: number[] = [];
  const seeds: number[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] < minAlpha) continue;
      if (keepChance < 1 && Math.random() > keepChance) continue;

      const jx = (Math.random() - 0.5) * cell * jitter;
      const jy = (Math.random() - 0.5) * cell * jitter;

      // Centrado en el origen; el eje Y del canvas va al revés que el de WebGL.
      positions.push(
        (x / w - 0.5) * 2 * aspect + jx,
        -(y / h - 0.5) * 2 + jy,
        (Math.random() - 0.5) * 0.04 // pizca de profundidad
      );
      seeds.push(Math.random());
    }
  }

  return {
    positions: Float32Array.from(positions),
    seeds: Float32Array.from(seeds),
    count: seeds.length,
    aspect,
  };
}
