export type IconGlyphSize = "sm" | "md" | "lg";
export type IconGlyphVariant = "brand" | "solid" | "muted";

export const iconGlyphSizeClasses: Record<IconGlyphSize, string> = {
  sm: "size-7",
  md: "size-9",
  lg: "size-11",
};

export const iconGlyphIconSizeClasses: Record<IconGlyphSize, string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

export const iconGlyphVariantClasses: Record<IconGlyphVariant, string> = {
  brand: "bg-brand text-brand-foreground",
  solid: "bg-foreground text-background",
  muted: "bg-foreground/10 text-foreground",
};

export function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
