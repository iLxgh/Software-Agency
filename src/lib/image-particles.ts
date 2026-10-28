export type ParticleSample = {
  positions: Float32Array;

  seeds: Float32Array;
  count: number;

  aspect: number;
};

export type SampleOptions = {
  density?: number;

  alphaThreshold?: number;

  maxParticles?: number;

  jitter?: number;
};

export async function sampleImageParticles(
  src: string,
  {
    density = 3,
    alphaThreshold = 0.35,
    maxParticles = 12000,
    jitter = 0.7,
  }: SampleOptions = {},
): Promise<ParticleSample> {
  const img = new Image();
  img.decoding = "async";

  img.src = src;
  await img.decode();

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

  let opaque = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] >= minAlpha) opaque++;
  }
  const keepChance = opaque > maxParticles ? maxParticles / opaque : 1;

  const aspect = w / h;
  const cell = 2 / h;
  const positions: number[] = [];
  const seeds: number[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] < minAlpha) continue;
      if (keepChance < 1 && Math.random() > keepChance) continue;

      const jx = (Math.random() - 0.5) * cell * jitter;
      const jy = (Math.random() - 0.5) * cell * jitter;

      positions.push(
        (x / w - 0.5) * 2 * aspect + jx,
        -(y / h - 0.5) * 2 + jy,
        (Math.random() - 0.5) * 0.04,
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
