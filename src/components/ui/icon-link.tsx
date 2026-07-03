import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { IconBadge } from "./icon-badge";
import { cx, type IconGlyphSize, type IconGlyphVariant } from "./icon-glyph-styles";

type IconLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  icon: LucideIcon;
  iconSize?: IconGlyphSize;
  iconVariant?: IconGlyphVariant;
  children: ReactNode;
};

export function IconLink({
  icon,
  iconSize = "md",
  iconVariant = "brand",
  children,
  className,
  ...props
}: IconLinkProps) {
  return (
    <a className={cx("flex items-center gap-3 font-semibold", className)} {...props}>
      {children}
      <IconBadge icon={icon} size={iconSize} variant={iconVariant} className="text-white"/>
    </a>
  );
}
