import type { AnchorHTMLAttributes, ReactNode, Ref } from "react";
import type { LucideIcon } from "lucide-react";
import { IconBadge } from "./icon-badge";
import {
  cx,
  type IconGlyphSize,
  type IconGlyphVariant,
} from "./icon-glyph-styles";

type IconLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  icon: LucideIcon;
  iconSize?: IconGlyphSize;
  iconVariant?: IconGlyphVariant;

  iconAnimateIn?: boolean;

  iconDelay?: number;
  children: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
};

export function IconLink({
  icon,
  iconSize = "md",
  iconVariant = "brand",
  iconAnimateIn = false,
  iconDelay = 0,
  children,
  className,
  ref,
  ...props
}: IconLinkProps) {
  return (
    <a
      ref={ref}
      className={cx("flex items-center gap-3 font-semibold", className)}
      {...props}
    >
      {children}
      <IconBadge
        icon={icon}
        size={iconSize}
        variant={iconVariant}

        animateIn={iconAnimateIn}
        delay={iconDelay}
      />
    </a>
  );
}
