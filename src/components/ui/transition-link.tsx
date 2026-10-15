"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { usePageTransition } from "@/components/providers/page-transition";

type TransitionLinkProps = ComponentProps<typeof Link> & { href: string };

/**
 * Sustituto de `next/link` para los enlaces internos que deben pasar por la
 * cortina.
 *
 * Se mantiene como `<a>` real (hereda de next/link) para no perder el menú
 * contextual, "abrir en pestaña nueva" ni el prefetch. Solo se intercepta el
 * clic simple e interno: el resto se deja al navegador.
 */
export function TransitionLink({
  href,
  onClick,
  ...props
}: TransitionLinkProps) {
  const { navigate } = usePageTransition();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    // Clic con modificador o con un botón que no sea el principal: es una
    // intención distinta (pestaña nueva, ventana, pegar…). No se toca.
    if (
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      props.target === "_blank"
    ) {
      return;
    }

    // Solo rutas internas. Externas, anclas, mailto y tel se dejan pasar.
    if (!href.startsWith("/") || href.startsWith("//")) return;

    e.preventDefault();
    navigate(href);
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
