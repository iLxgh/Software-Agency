/**
 * Shaders de la nube de partículas.
 *
 * Todo el movimiento vive en la GPU: el vertex shader recibe la posición del
 * cursor como uniform y desplaza cada partícula respecto de su posición
 * original (el atributo `position`, que nunca se modifica en CPU).
 */

/**
 * Simplex noise 3D (Ashima Arts / Stefan Gustavson, dominio público).
 * Lo usamos con (x, y, tiempo) para que la nube fluya en vez de oscilar:
 * partículas vecinas leen valores parecidos, así el movimiento se ve como una
 * corriente y no como ruido independiente por punto.
 */
const simplexNoise = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

export const particleVertexShader = /* glsl */ `
  uniform vec3  uMouse;       // cursor en espacio de mundo (z = 0)
  uniform float uRadius;      // radio de influencia, en unidades de mundo
  uniform float uStrength;    // fuerza de repulsión (la anima GSAP)
  uniform float uTime;
  uniform float uDrift;       // amplitud del movimiento en reposo
  uniform float uNoiseScale;  // "grano" del ruido: alto = remolinos pequeños
  uniform float uNoiseSpeed;  // velocidad de evolución del campo
  uniform float uSize;        // tamaño base del punto, en px
  uniform float uPixelRatio;
  uniform float uReveal;      // 0 = disperso (entrada), 1 = logo formado

  attribute float aSeed;      // 0..1 por partícula

  varying float vFade;        // opacidad individual durante la entrada

  ${simplexNoise}

  void main() {
    vec3 base = position;

    // Entrada: todas las partículas colapsan a la vez desde fuera.
    float local = uReveal;
    vFade = local;

    // Distancia desde la que llegan: más de ~0.6 y se salen del canvas.
    vec2 outward = normalize(base.xy + vec2(0.0001)) * (1.0 - local);
    base.xy += outward * (0.22 + aSeed * 0.3);

    // Reposo: campo de ruido en (x, y, tiempo). Dos lecturas desplazadas dan
    // las dos componentes del desplazamiento; las vecinas se mueven juntas.
    vec3 np = vec3(position.xy * uNoiseScale, uTime * uNoiseSpeed);
    vec2 flow = vec2(snoise(np), snoise(np + vec3(37.1, 19.7, 5.3)));

    // Una segunda octava más lenta y amplia: añade el vaivén de fondo.
    vec3 nq = vec3(position.xy * uNoiseScale * 0.45, uTime * uNoiseSpeed * 0.55);
    flow += 0.5 * vec2(snoise(nq + vec3(11.3, 4.7, 0.0)), snoise(nq + vec3(0.0, 91.2, 3.1)));

    base.xy += flow * uDrift * local;

    // Repulsión: vector cursor -> partícula, con falloff suave hasta uRadius.
    vec2 toParticle = base.xy - uMouse.xy;
    float dist = length(toParticle);
    float falloff = 1.0 - smoothstep(0.0, uRadius, dist);
    // Doble suavizado: sin esto la campana tiene punta y el empuje justo bajo
    // el cursor se siente brusco.
    falloff = falloff * falloff * (3.0 - 2.0 * falloff);

    // Cada partícula responde con su propia intensidad: el borde de la nube
    // se deshilacha en vez de moverse como una placa rígida.
    float personal = 0.75 + aSeed * 0.5;
    float push = falloff * uStrength * personal * local;

    vec2 dir = dist > 0.0001 ? toParticle / dist : vec2(0.0, 1.0);
    vec3 pos = base;
    pos.xy += dir * push;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    // Cámara ortográfica: el tamaño no depende de la distancia, solo del DPR.
    gl_PointSize = uSize * uPixelRatio;
  }
`;

export const particleFragmentShader = /* glsl */ `
  uniform vec3  uColor;
  uniform float uOpacity;

  varying float vFade;

  void main() {
    // Punto circular con borde suave: sin esto se ven cuadrados duros.
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.25, d);
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(uColor, alpha * uOpacity * vFade);

    // Convierte de espacio lineal a sRGB: sin esto los colores salen oscuros.
    #include <colorspace_fragment>
  }
`;
