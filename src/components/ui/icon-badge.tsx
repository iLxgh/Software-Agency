import type { LucideIcon } from "lucide-react";
import {
  cx,
  iconGlyphIconSizeClasses,
  iconGlyphSizeClasses,
  iconGlyphVariantClasses,
  type IconGlyphSize,
  type IconGlyphVariant,
} from "./icon-glyph-styles";

type IconBadgeProps = {
  icon: LucideIcon;
  size?: IconGlyphSize;
  variant?: IconGlyphVariant;
  className?: string;
};

/** Decorative icon bubble for use inside links (e.g. arrow badges next to a CTA label). */
export function IconBadge({
  icon: Icon,
  size = "md",
  variant = "brand",
  className,
}: IconBadgeProps) {
  return (
    <span
      className={cx(
        "flex shrink-0 items-center justify-center rounded-lg",
        iconGlyphSizeClasses[size],
        iconGlyphVariantClasses[variant],
        className
      )}
    >
      <Icon className={iconGlyphIconSizeClasses[size]} strokeWidth={2.5} />
    </span>
  );
}
