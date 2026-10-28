@AGENTS.md

# Pendientes de la landing

Cosas sabidas que faltan. No son bugs: son decisiones o datos que dependen de
alguien de Bloxtek.

## Bloqueantes para publicar

- **Metadatos por defecto.** `src/app/layout.tsx` sigue con el `title` y la
  `description` de la plantilla ("Create Next App"). Falta también sitemap,
  robots y Open Graph — es el mayor retorno de SEO por el esfuerzo que cuesta.
- **El panel de Nosotros tiene credenciales falsas.**
  `layout/about-panel.tsx` viene de la plantilla y sigue con SUS datos, no los
  de Bloxtek: lista como clientes a Vinamilk, Moc Chau Creamery, OH
  Architecture, Supersolid y la University of Sydney, y como premios Awwwards
  SOTD (x5), FWA SOTD (x5) y CSSDA SOTD (x5). Son empresas y galardones reales
  de otra agencia. Publicarlo es atribuirse clientes y premios ajenos, así que
  esto no es "copy sin validar": o se sustituye por datos reales o el panel no
  sale. El texto de presentación también está en inglés, a diferencia del resto
  de la web.
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

# Notas de desarrollo

- **No lances `npm run build` con el dev server vivo.** Los dos escriben en
  `.next` y el build invalida los chunks que el dev está sirviendo: CPU al
  techo y `ChunkLoadError` en el navegador. Usa `npm run build:check`, que
  escribe en `.next-check` (ver `distDir` en `next.config.ts`).
- Hay dos paletas intercambiables en `src/app/globals.css`, verde y morada. Se
  cambian comentando un bloque y descomentando el otro.
