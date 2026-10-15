import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * `next build` y `next dev` comparten `.next` por defecto. Si se lanza un
   * build con el dev server vivo, el build reescribe miles de ficheros que el
   * watcher del dev está observando: invalidaciones en cascada, recompilación
   * continua (CPU al techo) y ChunkLoadError en el navegador, porque los chunks
   * que estaba sirviendo desaparecen a media petición.
   *
   * Con esto, un build de verificación puede escribir aparte:
   *   NEXT_DIST_DIR=.next-check next build   (o `npm run build:check`)
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
