@AGENTS.md

# Pendientes de la landing

Cosas sabidas que faltan. No son bugs: son decisiones o datos que dependen de
alguien de Bloxtek.

## Bloqueantes para publicar

- **Metadatos por defecto.** `src/app/layout.tsx` sigue con el `title` y la
  `description` de la plantilla ("Create Next App"). Falta también sitemap,
  robots y Open Graph — es el mayor retorno de SEO por el esfuerzo que cuesta.
- **El formulario de contacto no envía a ningún lado.**
  `sections/contact/form.tsx` solo pasa a la pantalla de confirmación. Falta
  decidir destino (endpoint propio, Formspree, Resend, HubSpot…) y conectarlo.

## Copy sin validar

Todo lo que redacté yo está marcado con `PENDIENTE` en los archivos de datos.
Lo más sensible:

- `sections/sectors/slides.ts` — los tres apartados de **Gobierno** (sector que
  no existía en la web actual), y el *riesgo* de **Inmobiliario** y **Fintech**.
  Cuidado con lo normativo: no se inventó ninguna norma más allá de NOM-151,
  que ya usaban.
- `sections/contact/slides.ts`, `sections/distributors/slides.ts`,
  `sections/trust/slides.ts` — eyebrows, bajadas, badges y la etiqueta de la
  cabecera de Trust ("Nuestros compromisos.").
- `sections/problem/slides.ts` — la sección entera (etiqueta, titular, los
  cuatro síntomas y el cierre). Los síntomas apuntan cada uno a algo que ya
  está en el stack (firma NOM-151, trazabilidad, expedientes, credenciales),
  pero son afirmaciones sobre el mercado: si alguno no les suena a lo que ven
  en las reuniones, sobra.
- `sections/platforms/slides.ts` — la bajada bajo el titular ("Productos
  propios que ya están en operación…"). No afirma plazos ni cifras, solo la
  diferencia entre partir de una plataforma y partir de cero.
- `sections/approach/intro.tsx` — la bajada bajo el titular ("Cada proyecto
  empieza con un diagnóstico…"). No afirma nada que el titular no diga ya, pero
  es copy mío.
- `layout/about-panel.tsx` — se reescribió con lo que publica bloxtek.com/about-2,
  pero **su web no da clientes, ni premios, ni año de fundación, ni nombres del
  equipo**. Esos bloques se sustituyeron por las plataformas propias y los
  estándares sobre los que construyen, que es lo único verificable. Si Bloxtek
  aporta clientes o cifras reales, ese es el sitio. Las bajadas de los cuatro
  compromisos las redacté yo.
- **Los cuatro compromisos de la web real son "Generamos confianza",
  "Entregamos resultados", "Somos ágiles y flexibles" y "Traducimos tech a
  negocio"**, pero los eyebrows de la sección Trust son otros (Honestidad,
  Cumplimiento, Cercanía, Lenguaje), inventados por mí antes de ver esa página.
  Alinearlos haría que la landing hable el mismo idioma que su propia web.
- `sections/approach/slides.ts` — el `deliverable` de las cuatro tarjetas.
  Sustituyó a las CTAs (la tarjeta no enlaza a nada) y está inferido de las
  descripciones: hay que confirmar que el entregable real de cada línea es ese.

## Deuda conocida

- **La landing original está en la rama `landing-original`** (commit
  `f49b96c`) y el estado previo a la limpieza en la etiqueta `pre-limpieza`.
  De ahí salen las secciones del diseño anterior —about, organizations, works,
  services, process— y la de meeting, que se borraron del árbol.
- **La tarjeta del calendario (`ui/schedule-card.tsx`) merece volver**, pero
  DENTRO de `contact`, como alternativa directa al formulario: ahí el visitante
  ya tiene contexto, y `contact/slides.ts` ya tiene los tres pasos de la
  llamada. Arriba del pliegue pedía la reunión antes de explicar nada. Está en
  `pre-limpieza` junto con `ui/calendar.tsx`, que es lo que pinta los días.
- `ui/animated-text.tsx` tiene el único error de lint del proyecto
  (`react-hooks/refs`), anterior a estos cambios.
- Los logos desvanecidos de Trust son PNG con el color quemado dentro. Se
  recolorean con máscara + degradado, pero lo suyo sería exportarlos ya en el
  tono de cada paleta.

# Trampas conocidas

El código no lleva comentarios a propósito. Esto es lo que costó horas
descubrir y lo que más fácil se vuelve a romper.

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
  simultáneas. Lo que deba ir a la vez se cuelga de una etiqueta
  (`addLabel`), no de posiciones relativas.
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

# Notas de desarrollo

- **No lances `npm run build` con el dev server vivo.** Los dos escriben en
  `.next` y el build invalida los chunks que el dev está sirviendo: CPU al
  techo y `ChunkLoadError` en el navegador. Usa `npm run build:check`, que
  escribe en `.next-check` (ver `distDir` en `next.config.ts`).
- Hay dos paletas intercambiables en `src/app/globals.css`, verde y morada. Se
  cambian comentando un bloque y descomentando el otro.
