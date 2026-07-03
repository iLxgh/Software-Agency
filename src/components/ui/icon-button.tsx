import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import {
  cx,
  iconGlyphIconSizeClasses,
  iconGlyphSizeClasses,
  iconGlyphVariantClasses,
  type IconGlyphSize,
  type IconGlyphVariant,
} from "./icon-glyph-styles";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  size?: IconGlyphSize;
  variant?: IconGlyphVariant;
};

/** Standalone clickable icon button (e.g. sound toggle). Use IconBadge instead when nesting inside an <a>. */
export function IconButton({
  icon: Icon,
  size = "md",
  variant = "solid",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        "flex items-center justify-center rounded-lg",
        iconGlyphSizeClasses[size],
        iconGlyphVariantClasses[variant],
        className
      )}
      {...props}
    >
      <Icon className={iconGlyphIconSizeClasses[size]} strokeWidth={2.5} />
    </button>
  );
}
