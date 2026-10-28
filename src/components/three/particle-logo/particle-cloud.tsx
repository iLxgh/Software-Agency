/* eslint-disable react-hooks/immutability */
"use client";

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
  src: string;

  density?: number;

  alphaThreshold?: number;

  maxParticles?: number;

  radius?: number;

  strength?: number;

  pointSize?: number;
  color?: string;
  opacity?: number;

  drift?: number;

  noiseScale?: number;

  noiseSpeed?: number;

  follow?: number;

  fit?: number;

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

  const uniforms = useMemo(
    () => ({
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uRadius: { value: radius },
      uStrength: { value: 0 },
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

  useEffect(() => {
    if (!sample || !(camera instanceof THREE.OrthographicCamera)) return;
    camera.zoom =
      Math.min(size.height / 2, size.width / (2 * sample.aspect)) * fit;
    camera.updateProjectionMatrix();
  }, [camera, size, sample, fit]);

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

  const pointerTarget = useRef(new THREE.Vector3());
  const hovering = useRef(false);

  const strengthRef = useRef(strength);
  useEffect(() => {
    strengthRef.current = strength;
  }, [strength]);

  useEffect(() => {
    const el = gl.domElement;
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const onMove = (event: PointerEvent) => {
      if (reduce) return;
      const rect = el.getBoundingClientRect();

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

    const k = 1 - Math.pow(followRef.current, Math.min(delta, 0.1));
    uniforms.uMouse.value.lerp(pointerTarget.current, k);
  });

  if (!geometry) return null;

  return (
    <points geometry={geometry} material={material} frustumCulled={false} />
  );
}
