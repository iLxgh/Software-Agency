"use client";

import { useSyncExternalStore } from "react";

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

export function useAboutOpen() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
