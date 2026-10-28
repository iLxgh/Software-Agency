"use client";

import type Lenis from "lenis";

const NAV_OFFSET = -96;

let lenisInstance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  lenisInstance = l;
}

let lockCount = 0;

export function lockScroll() {
  if (typeof document === "undefined") return;
  lockCount++;
  if (lockCount > 1) return;

  lenisInstance?.stop();
  const sbw = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = "hidden";
  if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
}

export function unlockScroll() {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  document.documentElement.style.overflow = "";
  document.body.style.paddingRight = "";
  lenisInstance?.start();
}

export function scrollToSection(hash: string) {
  if (typeof window === "undefined") return;

  if (window.location.pathname !== "/") {
    window.location.href = `/${hash}`;
    return;
  }
  scrollToTarget(hash);
}

export function scrollToTarget(target: string | HTMLElement) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset: NAV_OFFSET, duration: 1.2 });
    return;
  }

  const el =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : target;
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET;
  window.scrollTo({ top: y, behavior: "smooth" });
}

export function jumpToTop() {
  if (typeof window === "undefined") return;
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: true, force: true });
    return;
  }
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

export function scrollToTop() {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { duration: 1.2 });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}
