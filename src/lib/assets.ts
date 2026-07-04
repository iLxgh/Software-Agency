/**
 * Rutas de assets estáticos servidos desde /public.
 * Usa estas constantes para evitar strings mágicos en componentes.
 */
export const images = {
  hero: "/images/hero",
  gallery: "/images/gallery",
  logos: "/images/logos",
  icons: "/images/icons",
  general: "/images/general",
  founder: "/images/about",
  organizations: "/images/organizations",
  works: "/images/works",
} as const;

export const media = {
  video: "/media/video",
  audio: "/media/audio",
} as const;

export const fonts = {
  sans: "/fonts/sans",
  serif: "/fonts/serif",
  display: "/fonts/display",
  mono: "/fonts/mono",
} as const;
