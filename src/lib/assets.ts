/**
 * Rutas de assets estáticos servidos desde /public.
 * Usa estas constantes para evitar strings mágicos en componentes.
 */
export const images = {
  hero: "/images/hero",
  general: "/images/general",
  organizations: "/images/organizations",
  cube: "/images/cube",
  fadedLogo: "/images/logo-desvanecido",
  ia: "/images/ia",
} as const;

export const media = {
  video: "/media/video",
  processVideos: "/media/video/process-videos",
  audio: "/media/audio",
} as const;

export const fonts = {
  sans: "/fonts/sans",
  serif: "/fonts/serif",
  display: "/fonts/display",
  mono: "/fonts/mono",
} as const;
