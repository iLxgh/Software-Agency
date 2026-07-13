"use client";

import { useSyncExternalStore } from "react";
import { media } from "@/lib/assets";

/** Taps de HOVER: se intercalan al azar para no ser repetitivos. */
const HOVER_FILES = ["tap-2.mp3", "tap-3.mp3", "tap-4.mp3", "tap-5.mp3"];
/** Tap de CLICK. */
const CLICK_FILE = "main-tap.mp3";
/** Ambiente de fondo (loop, muy bajito). */
const AMBIENT_FILE = "Space.mp3";
const STORAGE_KEY = "bloxtek:sound-enabled";

let hoverSounds: HTMLAudioElement[] = [];
let clickSound: HTMLAudioElement | null = null;
let ambient: HTMLAudioElement | null = null;
let lastIndex = -1;
let enabled = true;
let initialized = false;
const listeners = new Set<() => void>();

function load(file: string) {
  const audio = new Audio(`${media.audio}/${file}`);
  audio.preload = "auto";
  audio.volume = 0.5;
  return audio;
}

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) enabled = stored === "true";
  } catch {
    // localStorage no disponible: se queda con el default.
  }
  hoverSounds = HOVER_FILES.map(load);
  clickSound = load(CLICK_FILE);
  ambient = load(AMBIENT_FILE);
  ambient.loop = true;
  ambient.volume = 0.12; // muy bajito, de fondo
}

/**
 * Arranca/pausa el ambiente según el estado. Debe llamarse tras un gesto del
 * usuario (los navegadores bloquean el autoplay sin interacción).
 */
export function ensureAmbient() {
  init();
  if (!ambient) return;
  if (enabled) {
    if (ambient.paused) void ambient.play().catch(() => {});
  } else if (!ambient.paused) {
    ambient.pause();
  }
}

function play(audio: HTMLAudioElement | null) {
  if (!audio) return;
  try {
    audio.currentTime = 0;
    // El navegador puede bloquear el play antes del primer gesto: se ignora.
    void audio.play().catch(() => {});
  } catch {
    // no-op
  }
}

/** Hover: reproduce un tap al azar (evitando repetir el inmediato anterior). */
export function playTap() {
  init();
  if (!enabled || hoverSounds.length === 0) return;

  let i = Math.floor(Math.random() * hoverSounds.length);
  if (i === lastIndex) i = (i + 1) % hoverSounds.length;
  lastIndex = i;

  play(hoverSounds[i]);
}

/** Click: reproduce el main-tap. */
export function playClick() {
  init();
  if (!enabled) return;
  play(clickSound);
}

function emit() {
  listeners.forEach((l) => l());
}

export function setSoundEnabled(value: boolean) {
  init();
  enabled = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // no-op
  }
  ensureAmbient();
  emit();
}

export function toggleSound() {
  setSoundEnabled(!enabled);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  init();
  return enabled;
}

/** Estado on/off reactivo del sonido (para la bocina de la navbar). */
export function useSoundEnabled() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
