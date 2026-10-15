"use client";

/**
 * Las reglas del React Compiler asumen que los valores memoizados son
 * inmutables, pero el contrato de three.js/r3f es justo el contrario: los
 * uniforms y los objetos de escena se mutan en sitio (fuera del render) para no
 * recompilar el material ni recrear la geometría en cada frame.
 */
/* eslint-disable react-hooks/immutability */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import {
  sampleImageParticles,
  type ParticleSample,
} from "@/lib/image-particles";
import { particleFragmentShader, particleVertexShader } from "./shaders";

export type ParticleCloudProps = {
  /** Ruta del PNG con fondo transparente. */
  src: string;
  /** Píxeles de imagen por partícula: 2 = denso, 6 = disperso. */
  density?: number;
  /** Alpha mínimo (0..1) para que un píxel genere partícula. */
  alphaThreshold?: number;
  /** Tope de partículas. */
  maxParticles?: number;
  /** Radio de influencia del cursor, en unidades de mundo (el logo mide 2 de alto). */
  radius?: number;
  /** Cuánto se alejan las partículas del cursor, en unidades de mundo. */
  strength?: number;
  /** Tamaño del punto en px (a DPR 1). */
  pointSize?: number;
  color?: string;
  opacity?: number;
  /** Amplitud del movimiento en reposo, en unidades de mundo. 0 lo desactiva. */
  drift?: number;
  /** Grano del campo de ruido: alto = remolinos pequeños y nerviosos. */
  noiseScale?: number;
  /** Velocidad a la que evoluciona el ruido. */
  noiseSpeed?: number;
  /**
   * Retardo del cursor: fracción de la distancia que queda SIN recorrer al
   * cabo de un segundo. 0.0001 = casi pegado al puntero, 0.05 = arrastre
   * marcado, 0.3 = muy perezoso.
   */
  follow?: number;
  /** Fracción del contenedor que ocupa el logo (0..1). */
  fit?: number;
  /** Retraso de la animación de entrada, en segundos. */
  revealDelay?: number;
};

export function ParticleCloud({
  src,
  density = 3,
  alphaThreshold = 0.35,
  maxParticles = 12000,
  radius = 0.45,
  strength = 0.32,
  pointSize = 2.4,
  color = "#171717",
  opacity = 1,
  drift = 0.022,
  noiseScale = 0.85,
  noiseSpeed = 0.13,
  follow = 0.04,
  fit = 0.82,
  revealDelay = 0.6,
}: ParticleCloudProps) {
  const { camera, gl, size } = useThree();
  const [sample, setSample] = useState<ParticleSample | null>(null);

  // Uniforms creados una sola vez: el material nunca se recompila. Los cambios
  // de props se sincronizan más abajo, escribiendo sobre `.value`.
  const uniforms = useMemo(
    () => ({
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uRadius: { value: radius },
      uStrength: { value: 0 }, // 0 hasta que el cursor entra
      uTime: { value: 0 },
      uDrift: { value: drift },
      uNoiseScale: { value: noiseScale },
      uNoiseSpeed: { value: noiseSpeed },
      uSize: { value: pointSize },
      uPixelRatio: { value: 1 },
      uReveal: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
      }),
    [uniforms],
  );

  useEffect(() => () => material.dispose(), [material]);

  // --- Muestreo del PNG -----------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    sampleImageParticles(src, { density, alphaThreshold, maxParticles })
      .then((result) => {
        if (!cancelled) setSample(result);
      })
      .catch((error) => {
        console.error("[ParticleCloud] no se pudo muestrear la imagen:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [src, density, alphaThreshold, maxParticles]);

  const geometry = useMemo(() => {
    if (!sample) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(sample.positions, 3),
    );
    geo.setAttribute("aSeed", new THREE.BufferAttribute(sample.seeds, 1));
    return geo;
  }, [sample]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  // --- Props reactivas ------------------------------------------------------
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    uniforms.uRadius.value = radius;
    uniforms.uDrift.value = reduce ? 0 : drift;
    uniforms.uNoiseScale.value = noiseScale;
    uniforms.uNoiseSpeed.value = noiseSpeed;
    uniforms.uSize.value = pointSize;
    uniforms.uOpacity.value = opacity;
    uniforms.uColor.value.set(color);
  }, [
    uniforms,
    radius,
    drift,
    noiseScale,
    noiseSpeed,
    pointSize,
    opacity,
    color,
  ]);

  useEffect(() => {
    uniforms.uPixelRatio.value = gl.getPixelRatio();
  }, [uniforms, gl, size]);

  // Encaja el logo en el contenedor: 2 unidades de alto por 2*aspect de ancho.
  useEffect(() => {
    if (!sample || !(camera instanceof THREE.OrthographicCamera)) return;
    camera.zoom =
      Math.min(size.height / 2, size.width / (2 * sample.aspect)) * fit;
    camera.updateProjectionMatrix();
  }, [camera, size, sample, fit]);

  // Entrada: las partículas colapsan desde fuera hasta formar el logo.
  useEffect(() => {
    if (!sample) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      uniforms.uReveal.value = 1;
      return;
    }
    uniforms.uReveal.value = 0;
    const tween = gsap.to(uniforms.uReveal, {
      value: 1,
      duration: 2,
      delay: revealDelay,
      ease: "power3.out",
    });
    return () => {
      tween.kill();
    };
  }, [sample, uniforms, revealDelay]);

  // --- Cursor ---------------------------------------------------------------
  const pointerTarget = useRef(new THREE.Vector3());
  const hovering = useRef(false);
  // La fuerza objetivo se lee dentro de los listeners, no en el render.
  const strengthRef = useRef(strength);
  useEffect(() => {
    strengthRef.current = strength;
  }, [strength]);

  useEffect(() => {
    const el = gl.domElement;
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    // Plano invisible en z = 0, donde viven las partículas.
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const onMove = (event: PointerEvent) => {
      if (reduce) return;
      const rect = el.getBoundingClientRect();

      // El canvas no recibe eventos (pointer-events: none), así que escuchamos
      // en window y comprobamos a mano si el cursor cae dentro de su caja.
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) {
        if (hovering.current) onLeave();
        return;
      }

      ndc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(plane, hit)) return;
      pointerTarget.current.copy(hit);

      if (!hovering.current) {
        hovering.current = true;
        // Primer contacto: sitúa el cursor de golpe para que la nube no se
        // arrastre desde el centro, y sube la fuerza con una rampa corta.
        uniforms.uMouse.value.copy(hit);
        gsap.to(uniforms.uStrength, {
          value: strengthRef.current,
          duration: 1.1,
          ease: "power2.out",
          overwrite: true,
        });
      }
    };

    const onLeave = () => {
      hovering.current = false;
      // Retorno elástico: el overshoot por debajo de 0 invierte la fuerza un
      // instante, así las partículas se pasan de largo y rebotan a su sitio.
      // Amplitud baja (0.5) = un solo rebote suave en vez de temblar.
      gsap.to(uniforms.uStrength, {
        value: 0,
        duration: 2.4,
        ease: "elastic.out(0.5, 0.55)",
        overwrite: true,
      });
    };

    const onWindowLeave = () => {
      if (hovering.current) onLeave();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    // El cursor sale de la ventana entera: no llega ningún pointermove más.
    document.addEventListener("pointerleave", onWindowLeave);
    window.addEventListener("pointercancel", onWindowLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onWindowLeave);
      window.removeEventListener("pointercancel", onWindowLeave);
    };
  }, [gl, camera, uniforms]);

  const followRef = useRef(follow);
  useEffect(() => {
    followRef.current = follow;
  }, [follow]);

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    // El cursor del shader persigue al puntero real con retardo: de ahí sale la
    // sensación líquida del arrastre. El exponente hace el damping
    // independiente del framerate (mismo resultado a 60 y a 144 Hz).
    const k = 1 - Math.pow(followRef.current, Math.min(delta, 0.1));
    uniforms.uMouse.value.lerp(pointerTarget.current, k);
  });

  if (!geometry) return null;

  return (
    // frustumCulled off: el desplazamiento vive en el shader, así que la caja
    // que three calcula no representa dónde acaban las partículas.
    <points geometry={geometry} material={material} frustumCulled={false} />
  );
}
