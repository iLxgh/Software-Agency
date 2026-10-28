"use client";

import { useEffect } from "react";
import { playTap, playClick, ensureAmbient } from "@/lib/sound";

const HOVER_SELECTOR = "a[href], button, [role='button'], [data-sound]";

const CLICK_SELECTOR = "a[href], button, [role='button']";

export function SoundHover() {
  useEffect(() => {
    let current: Element | null = null;

    const onOver = (e: PointerEvent) => {
      const el =
        (e.target as Element | null)?.closest?.(HOVER_SELECTOR) ?? null;
      if (!el || el === current) return;

      if (el instanceof HTMLButtonElement && el.disabled) return;
      current = el;
      playTap();
    };

    const onOut = (e: PointerEvent) => {
      if (!current) return;
      const to = e.relatedTarget as Node | null;

      if (!to || !current.contains(to)) current = null;
    };

    const onDown = (e: PointerEvent) => {
      const el =
        (e.target as Element | null)?.closest?.(CLICK_SELECTOR) ?? null;
      if (!el) return;
      if (el instanceof HTMLButtonElement && el.disabled) return;
      playClick();
    };

    const startAmbient = () => ensureAmbient();
    window.addEventListener("pointerdown", startAmbient, { once: true });
    window.addEventListener("keydown", startAmbient, { once: true });

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("pointerdown", startAmbient);
      window.removeEventListener("keydown", startAmbient);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return null;
}
