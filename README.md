# Bloxtek — Landing

Sitio de [Bloxtek](https://bloxtek.com), consultora de blockchain y desarrollo
a medida. Sustituye a la landing anterior en WordPress.

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
GSAP 3 con ScrollTrigger y SplitText · Lenis · React Three Fiber.

## Arrancar

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script                | Para qué                                            |
| --------------------- | --------------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo                              |
| `npm run build`       | Build de producción                                 |
| `npm run build:check` | Build de **verificación**, escribe en `.next-check` |
| `npm run lint`        | ESLint                                              |

**No lances `npm run build` con el servidor de desarrollo vivo.** Los dos
escriben en `.next`, y el build invalida los chunks que el dev está sirviendo:
CPU al techo y `ChunkLoadError` en el navegador. Para comprobar que compila,
usa `build:check`, que escribe aparte (ver `distDir` en `next.config.ts`).

## Estructura

```
src/
  app/                 rutas: / y /sectores
  components/
    sections/          una carpeta por sección; los textos van en slides.ts
    layout/            navbar, footer, panel de Nosotros
    providers/         scroll suave, sonido, transición entre rutas, carga
    ui/                piezas compartidas
    three/             logo de partículas del hero (WebGL)
  lib/                 hooks de animación, rutas de assets, scroll, sonido
```

Los textos viven en los `slides.ts` de cada sección, no en el JSX. Para
cambiar copy no hace falta tocar componentes.

### Recorrido de la home

Hero → el problema → cuatro formas de trabajo → infraestructura →
plataformas → confianza → distribuidores → contacto.

## Pendientes

### Bloqueantes para publicar

- **Metadatos por defecto.** `src/app/layout.tsx` sigue con el `title` y la
  `description` de la plantilla. Falta también sitemap, robots y Open Graph.
- **El formulario de contacto no envía a ningún lado.**
  `sections/contact/form.tsx` solo pasa a la pantalla de confirmación. Falta
  decidir destino (endpoint propio, Formspree, Resend, HubSpot…) y conectarlo.

### Copy sin validar

Marcado con `PENDIENTE` en los archivos de datos. Lo más sensible:

- `sections/sectors/slides.ts` — los tres apartados de **Gobierno**, y el
  _riesgo_ de **Inmobiliario** y **Fintech**. Cuidado con lo normativo: no se
  inventó ninguna norma más allá de NOM-151.
- `sections/problem/slides.ts` — la sección entera. Son afirmaciones sobre el
  mercado: si alguna no encaja con lo que se ve en las reuniones, sobra.
- `sections/platforms/slides.ts`, `sections/approach/slides.ts`,
  `sections/trust/slides.ts`, `sections/contact/slides.ts`,
  `sections/distributors/slides.ts` — bajadas, badges y etiquetas.
- `layout/about-panel.tsx` — se escribió con lo que publica bloxtek.com, pero
  esa web **no da clientes, ni premios, ni año de fundación, ni equipo**. Esos
  bloques se sustituyeron por las plataformas propias y los estándares, que es
  lo único verificable. Si hay clientes o cifras reales, ese es el sitio.

### Inconsistencia con la web actual

Los cuatro compromisos que publica bloxtek.com son "Generamos confianza",
"Entregamos resultados", "Somos ágiles y flexibles" y "Traducimos tech a
negocio". Los de la sección Trust son otros (Honestidad, Cumplimiento,
Cercanía, Lenguaje). Alinearlos haría que la landing hable el mismo idioma que
el resto de la marca.

## Trampas conocidas

Lo que más fácil se vuelve a romper al tocar las animaciones.

- **GSAP absorbe los transforms de CSS.** En cuanto anima el `transform` de un
  elemento, se traga sus propiedades `rotate`/`translate`/`scale` y las pone a
  `none`. No se suman: si GSAP anima el transform, la posición de reposo
  también la tiene que poner GSAP (ver `LAYOUT` en `approach/cards.tsx`).
- **En Tailwind v4, `scale-*`, `rotate-*` y `translate-*` generan propiedades
  sueltas**, no `transform`. Así que `transition-transform` NO anima un
  `hover:scale-*`: va `transition-[scale]`. Se comprueba buscando la clase en
  el CSS de `.next-check` tras un `build:check`.
- **Tailwind no genera clases interpoladas.** `` `md:${EASE}` `` no produce
  nada; las clases van como literales completos.
- **`fromTo` aplica sus valores de partida AL CREARSE**, no cuando le llega el
  turno (`immediateRender` va a `true` por defecto, también dentro de un
  timeline y aunque esté colocado al final). Si antes hiciste un `set` para
  esconder algo, el `from` lo pisa: hace falta `immediateRender: false`.
- **Las posiciones `"<"` de un timeline apuntan a la animación ANTERIOR.** Al
  añadir tweens, esa referencia se desplaza sola y rompe cosas que creías
  simultáneas. Lo que deba ir a la vez se cuelga de una etiqueta (`addLabel`).
- **`ScrollTrigger.refresh()` dentro del tick de GSAP se aplaza, no se
  ejecuta.** Si se llama desde el `onComplete` de un tween hay que sacarlo con
  un `requestAnimationFrame`.
- **`lockScroll()` deja el documento sin altura de scroll** (`overflow: hidden`
  en el `<html>`). Todo lo que se monte mientras tanto calcula sus
  ScrollTrigger contra un documento sin recorrido, y hay que remedir al
  desbloquear. Pasa en cada navegación y en la pantalla de carga.
- **Un Lenis parado ignora `scrollTo`**: necesita `force: true`. Sin eso, el
  salto al inicio tras navegar no ocurre y la página nueva se destapa a la
  altura de scroll de la anterior.
- **Con `box-sizing: border-box`, un div de ancho 0 no mide 0**: mide lo que
  suman sus bordes, y el `border-radius` se recorta sobre ESE ancho real.

## Paletas

Hay dos intercambiables en `src/app/globals.css`, verde y morada. Se cambian
comentando un bloque y descomentando el otro.
