import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { IconBadge } from "./icon-badge";
import { cx, type IconGlyphSize, type IconGlyphVariant } from "./icon-glyph-styles";

type IconLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  icon: LucideIcon;
  iconSize?: IconGlyphSize;
  iconVariant?: IconGlyphVariant;
  /** Anima el pop del ícono en la entrada. */
  iconAnimateIn?: boolean;
  /** Retraso del pop del ícono, en segundos. */
  iconDelay?: number;
  children: ReactNode;
};

export function IconLink({
  icon,
  iconSize = "md",
  iconVariant = "brand",
  iconAnimateIn = false,
  iconDelay = 0,
  children,
  className,
  ...props
}: IconLinkProps) {
  return (
    <a className={cx("flex items-center gap-3 font-semibold", className)} {...props}>
      {children}
      <IconBadge
        icon={icon}
        size={iconSize}
        variant={iconVariant}
        className="text-white"
        animateIn={iconAnimateIn}
        delay={iconDelay}
      />
    </a>
  );
}
