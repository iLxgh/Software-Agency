"use client";

import { useSyncExternalStore } from "react";

/** Estado abierto/cerrado del panel "About" (drawer que entra desde la derecha). */
let open = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function openAbout() {
  if (open) return;
  open = true;
  emit();
}

export function closeAbout() {
  if (!open) return;
  open = false;
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return open;
}

/** Estado reactivo del panel About. */
export function useAboutOpen() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
