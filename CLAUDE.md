# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado actual del repositorio

El repositorio todavía **no contiene código**. Solo hay dos artefactos de diseño:

- `MANUAL_IMPLEMENTACION_INMOBARCO_WEB.md` — **fuente de verdad del proyecto**. Léelo antes de cualquier tarea no trivial. Sus decisiones marcadas **CERRADO** no se discuten ni se reabren; las marcadas **VERIFICAR** deben comprobarse contra la documentación real (API de Wasi, manual de marca, Inmobarco) antes de codificar, anotando cualquier desviación en `docs/DECISIONS.md`.
- `inmobarco-home-mockup.html` — mockup HTML estático de la home, en un solo archivo con tokens CSS y todas las secciones en el orden definitivo. Es la referencia visual al portar la home a componentes Nuxt: la paleta, el gesto tipográfico (Archivo `font-stretch:110%`), el hero con SVG del valle y el panel de búsqueda flotante ya están resueltos ahí.

El scaffold aún no se ha ejecutado: `pnpm dlx nuxi@latest init inmobarco-web`.

## Comandos

Gestor de paquetes: **pnpm** (no npm ni yarn).

```bash
pnpm dev                  # servidor de desarrollo
pnpm build                # build de producción (preset node-server)
pnpm preview
pnpm lint                 # @nuxt/eslint
pnpm typecheck            # nuxt typecheck
```

Antes de dar por terminada cualquier tarea: `pnpm lint && pnpm typecheck && pnpm build` deben pasar.

Verificación de seguridad obligatoria tras el build (el token de Wasi nunca puede llegar al bundle):

```bash
grep -r "wasi_token\|$NUXT_WASI_TOKEN" .output/public   # no debe devolver nada
```

## Arquitectura

Nuxt 4 + Vue 3 + TypeScript estricto, SSR híbrido, self-host en Docker (`node-server`).

**Flujo de datos del inventario** — es la restricción estructural del proyecto:

```
Componente → /api/* (Nitro) → server/utils/wasi.ts (defineCachedFunction)
           → api.wasi.co/v1 → server/utils/wasi-mappers.ts → tipo Property propio
```

- `id_company` y `wasi_token` viven solo en `runtimeConfig` privado. **Nunca se llama a Wasi desde el cliente.**
- Nunca se pasa el objeto crudo de Wasi a los componentes: todo se normaliza al tipo `Property` de `shared/types/property.ts` en los mappers.
- Las llamadas a Wasi se cachean con `defineCachedFunction` (búsquedas 900 s, ficha 3600 s). El caché es en memoria del proceso; con más de una réplica en Swarm hay que configurar el storage de Nitro contra Redis antes de escalar.
- Fallos de Wasi: listados → estado vacío con CTA de WhatsApp; ficha → 404 si no existe, 503 amable si la API falla. Nunca pantalla en blanco. Logs con prefijo `[wasi]`.

**Rutas y taxonomía.** Las URL de listado son `/{arriendo|venta}/[zona]/[tipo]`, resueltas contra un diccionario estático en `shared/data/taxonomy.ts` que mapea slug → `id_city` / `id_location` / `id_property_type`. Un slug ausente del diccionario devuelve 404: no se generan URL indexables a partir de segmentos arbitrarios. La ficha es `/inmueble/[slug]-[id]`, donde el `id` final es la fuente de verdad y un slug que no coincide hace redirect 301.

`routeRules`: prerender en páginas estáticas y legales, `swr: 900` en listados, `swr: 3600` en fichas. Se usa SWR y no ISR por ser self-host.

**Formularios.** `Cliente (zod) → POST /api/{contact|pqrs|consign} → zod en servidor → webhook n8n`. El sitio no envía correos ni conoce destinatarios; n8n enruta. Los esquemas zod son compartidos en `shared/schemas/forms.ts`. Cada envío lleva evidencia de consentimiento (Ley 1581 de 2012): `policyVersion`, `acceptedAt`, IP y user-agent. Antispam: honeypot + Turnstile + rate limiting de `nuxt-security`.

**Enlaces externos** (Palomma, área de clientes, WhatsApp) centralizados en una constante `EXTERNAL_LINKS`, siempre con `target="_blank" rel="noopener noreferrer"` y un `<span class="sr-only">(abre en una nueva pestaña)</span>`.

## Convenciones

- Código, identificadores, nombres de archivo, ramas y commits **en inglés**. Contenido visible, copy y comentarios de negocio **en español (Colombia), registro tú**.
- TypeScript estricto. Nada de `any` salvo adaptadores de terceros con `// eslint-disable-next-line` justificado.
- **Regla de contraste CERRADO:** el texto sobre el primario `#48BFF7` siempre es `--color-ink`, nunca blanco. Blanco solo sobre `--color-primary-700` o más oscuro.
- Tipografía: `font-display` = Archivo (titulares, peso 700, `font-stretch:110%`, `letter-spacing:-.02em`); `font-sans` = Inter (texto, UI, precios y tablas con `tabular-nums`).
- Los componentes se escriben a mano sobre los tokens CSS. No se instalan librerías de UI de terceros (shadcn-vue, PrimeVue, Vuetify).
- Accesibilidad como definición de terminado: contraste AA, `:focus-visible` con `outline: 3px solid var(--color-secondary)`, navegación completa por teclado con trampa de foco en modales y lightbox, `prefers-reduced-motion`, un solo `<h1>` por página, responsive desde 360 px.
- Motion: solo transiciones en respuesta a la acción del usuario. Nada de animaciones de entrada al hacer scroll.

## Prohibiciones explícitas

- No consumir Wasi desde el cliente.
- No instalar librerías de componentes de terceros.
- No usar scroll infinito en listados (paginación numerada, por SEO).
- No integrar pasarela de pagos: Palomma es un enlace externo.
- No publicar formularios sin las páginas legales y el checkbox de autorización (sin marcar por defecto).
- No inventar cifras de trayectoria, testimonios ni nombres de aliados en contenido de producción.
- No instalar i18n: multi-idioma está fuera de alcance.
- Mapa en listados y blog (`@nuxt/content`) son fase 3, fuera del MVP.

## Variables de entorno

Definidas en `.env` (ignorado en git) con `.env.example` en el repo:
`NUXT_WASI_ID_COMPANY`, `NUXT_WASI_TOKEN`, `NUXT_N8N_WEBHOOK_URL`, `NUXT_TURNSTILE_SECRET_KEY`, `NUXT_PUBLIC_TURNSTILE_SITE_KEY`, `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_GTAG_ID`.

## Analítica

GA4 vía `nuxt-gtag` con Consent Mode v2. Nombres de evento exactos: `search_submit`, `property_view`, `whatsapp_click`, `pay_rent_click`, `client_area_click`, `contact_submit`, `pqrs_submit`, `consign_submit`, `filter_apply`.
