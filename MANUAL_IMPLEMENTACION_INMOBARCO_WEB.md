# Manual de implementación — inmobarco-web

**Destinatario:** Claude Code
**Proyecto:** Nuevo sitio web público de INMOBARCO INMOBILIARIA S.A.S.
**Reemplaza:** plantilla Wasi actual en inmobarco.com
**Versión del manual:** 1.0 · 17-09-2026

---

## 0. Cómo usar este documento

Este documento es la fuente de verdad del proyecto. Las decisiones marcadas como **CERRADO** no se discuten ni se reabren: impleméntalas tal cual. Las marcadas como **VERIFICAR** requieren comprobación contra la documentación o el entorno real antes de codificar, y si el resultado difiere de lo aquí escrito, se ajusta el código y se anota el cambio en `docs/DECISIONS.md`.

Convenciones del repositorio:

- Código, identificadores, nombres de archivo, ramas y mensajes de commit **en inglés**.
- Contenido visible al usuario, copy y comentarios de negocio **en español (Colombia), registro tú**.
- TypeScript estricto. Nada de `any` salvo en adaptadores de terceros con `// eslint-disable-next-line` justificado.
- Antes de dar por terminada una tarea: `pnpm lint && pnpm typecheck && pnpm build` deben pasar.

---

## 1. Resumen del proyecto y decisiones cerradas

| Tema | Decisión | Estado |
|---|---|---|
| Framework | Nuxt 4.x (última 4.5.x estable), Vue 3, TypeScript | CERRADO |
| Renderizado | SSR híbrido con `routeRules`: prerender en estáticas, SWR en listados y fichas | CERRADO |
| Fuente de inventario | API de Wasi v1 (`api.wasi.co/v1`), consumida **solo desde el servidor** | CERRADO |
| Estilos | Tailwind CSS sobre tokens CSS de marca | CERRADO |
| Paleta | Manual de marca Inmobarco: `#48BFF7`, `#1B99D3`, `#141F21`, `#D2D9E0`, `#F1FAFE` | CERRADO |
| Tipografía | `Archivo` (display, eje de ancho) + `Inter` (texto/UI), autohospedadas | CERRADO |
| Pagos | Enlace externo a Palomma. **No** se integra checkout | CERRADO |
| Área de clientes | Enlace externo a `clientes.inmobarco.com` | CERRADO |
| Formularios | Server route de Nuxt → webhook de n8n | CERRADO |
| Hosting | VPS Contabo, Easypanel + Docker Swarm + Traefik, preset `node-server` | CERRADO |
| Paquete SEO | `@nuxtjs/seo` (sitemap, robots, schema.org, og-image) | CERRADO |
| Mapa en listados | Fuera del MVP. Fase 3 | CERRADO |
| Blog | Fuera del MVP. Fase 3 con `@nuxt/content` | CERRADO |
| Multi-idioma | Fuera de alcance. No instalar i18n | CERRADO |

**Principio rector:** sencillo, funcional y con identidad propia. Ante la duda entre una función más y una página que carga rápido y se entiende, gana lo segundo.

---

## 2. Stack y dependencias

```bash
# Scaffold
pnpm dlx nuxi@latest init inmobarco-web
cd inmobarco-web
```

Dependencias a instalar (fijar versiones exactas en el `package.json` al inicializar):

| Paquete | Rol |
|---|---|
| `nuxt` (4.x) | Framework |
| `@nuxtjs/tailwindcss` | Estilos |
| `@nuxt/image` | Optimización de imágenes de Wasi vía IPX |
| `@nuxt/fonts` | Autohospedaje de Archivo e Inter |
| `@nuxtjs/seo` | sitemap, robots, schema-org, og-image, site-config |
| `@vueuse/nuxt` | Utilidades (scroll, breakpoints, `useScrollLock`) |
| `nuxt-security` | Cabeceras de seguridad y rate limiting |
| `zod` | Validación compartida cliente/servidor |
| `@nuxt/eslint` + `prettier` | Calidad |
| `@nuxt/content` | **Solo fase 3** |

No instalar librerías de UI (shadcn-vue, PrimeVue, Vuetify). Los componentes se escriben a mano sobre los tokens; es lo que garantiza que el sitio no se parezca a otro.

---

## 3. Estructura de carpetas

```
inmobarco-web/
├─ app/
│  ├─ app.vue
│  ├─ assets/css/
│  │  ├─ tokens.css            # custom properties de marca
│  │  └─ main.css              # @tailwind + base
│  ├─ components/
│  │  ├─ ui/                   # BaseButton, BaseInput, BaseSelect, BaseBadge, BaseModal
│  │  ├─ layout/               # TheTopBar, TheHeader, TheFooter, MobileMenu, WhatsAppFab
│  │  ├─ property/             # PropertyCard, PropertyGrid, PropertyFilters, PropertyGallery,
│  │  │                        # PropertySpecs, PropertyContactPanel, PropertyEmptyState
│  │  ├─ home/                 # HeroSearch, ZoneTiles, FeaturedProperties, DualPath,
│  │  │                        # ValueProps, OwnerSteps, PartnerLogos, ClosingCta
│  │  └─ form/                 # ContactForm, PqrsForm, ConsignForm, DataConsentCheckbox
│  ├─ composables/
│  │  ├─ useProperties.ts
│  │  ├─ useProperty.ts
│  │  ├─ usePropertyFilters.ts
│  │  └─ useFormatters.ts      # COP, área, slug
│  ├─ layouts/default.vue
│  ├─ pages/                   # ver §6
│  └─ utils/
├─ server/
│  ├─ api/
│  │  ├─ properties.get.ts
│  │  ├─ properties/[id].get.ts
│  │  ├─ properties/featured.get.ts
│  │  ├─ filters.get.ts
│  │  ├─ contact.post.ts
│  │  ├─ pqrs.post.ts
│  │  └─ consign.post.ts
│  └─ utils/
│     ├─ wasi.ts               # cliente + caché
│     ├─ wasi-mappers.ts       # WasiProperty -> Property
│     └─ n8n.ts
├─ shared/
│  ├─ types/property.ts
│  └─ schemas/forms.ts         # zod, usado por cliente y servidor
├─ public/
├─ docs/DECISIONS.md
├─ Dockerfile
└─ nuxt.config.ts
```

---

## 4. Tokens de marca

### 4.1 `app/assets/css/tokens.css`

```css
:root {
  /* Marca oficial Inmobarco */
  --color-primary: #48BFF7;
  --color-secondary: #1B99D3;
  --color-ink: #141F21;
  --color-line: #D2D9E0;
  --color-surface: #F1FAFE;

  /* Escala primaria */
  --color-primary-50:  #ECF9FE;
  --color-primary-100: #D3F0FD;
  --color-primary-200: #A9E2FB;
  --color-primary-300: #7BD1F9;
  --color-primary-400: #48BFF7;
  --color-primary-500: #23A9EE;
  --color-primary-600: #1B99D3;
  --color-primary-700: #1878AC;
  --color-primary-800: #17607A;
  --color-primary-900: #143F50;
  --color-primary-950: #141F21;

  /* Neutros */
  --color-neutral-0:   #FFFFFF;
  --color-neutral-50:  #F1FAFE;
  --color-neutral-100: #E7EDF1;
  --color-neutral-200: #D2D9E0;
  --color-neutral-400: #9AA6AE;
  --color-neutral-600: #5A6670;
  --color-neutral-800: #263238;
  --color-neutral-900: #141F21;

  /* Semánticos */
  --color-success: #1F9D6B; --color-success-bg: #E6F6EF;
  --color-warning: #E0A100; --color-warning-bg: #FBF3DC;
  --color-error:   #D64545; --color-error-bg:   #FBE9E9;
  --color-info:    #1B99D3; --color-info-bg:    #E7F4FB;

  /* Radios */
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;

  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(20,31,33,.06);
  --shadow-md: 0 4px 12px rgba(20,31,33,.08);
  --shadow-lg: 0 12px 32px rgba(20,31,33,.12);
}
```

### 4.2 Regla de contraste **CERRADO**

`#48BFF7` es un azul claro. **El texto sobre el primario siempre es `--color-ink`, nunca blanco.** El botón primario es azul con texto casi negro; es una firma visual de la marca y además cumple AA. Blanco sobre azul solo se permite sobre `--color-primary-700` o más oscuro.

### 4.3 `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss'

export default <Config>{
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: 'var(--color-primary-50)',   100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)', 300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)', 500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)', 700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)', 900: 'var(--color-primary-900)',
        },
        ink: 'var(--color-ink)',
        line: 'var(--color-line)',
        surface: 'var(--color-surface)',
        muted: 'var(--color-neutral-600)',
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { sm: '8px', md: '12px', lg: '16px' },
      boxShadow: {
        sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)',
      },
      maxWidth: { container: '1200px' },
    },
  },
}
```

### 4.4 Tipografía **CERRADO**

- **Display (`font-display`): Archivo.** Variable, se usa con el eje de ancho ligeramente expandido (`font-stretch: 110%`), peso 700, `letter-spacing: -0.02em`. Es el gesto tipográfico propio del sitio: titulares anchos y macizos, con aire arquitectónico.
- **Texto y UI (`font-sans`): Inter.** Pesos 400/500/600. Todo lo que sea precio, especificación, tabla o formulario va en Inter con `font-variant-numeric: tabular-nums`.

Escala (ratio 1.25): `12 · 14 · 16 · 20 · 25 · 31 · 39 · 49 · 61`.
Interlineado: 1.5 en cuerpo, 1.1 en titulares. Longitud de línea máxima 72 caracteres (`max-w-[68ch]`).

Prohibido en el diseño: etiquetas en versalitas/mayúsculas sostenidas sobre cada título, acentuar una sola palabra del titular en otro color, y flechas `→` pegadas al texto de los botones.

### 4.5 Espaciado y grid

Base 4px: `4 8 12 16 24 32 48 64 96`. Contenedor 1200px con padding lateral 24px (16px en móvil). Grid de listados: 1 / 2 / 3 / 4 columnas en `base / md / lg / xl`.

---

## 5. Capa de datos Wasi

### 5.1 Regla de oro **CERRADO**

`id_company` y `wasi_token` viven en `runtimeConfig` (privado) y **jamás** llegan al navegador. El cliente únicamente habla con `/api/*` de nuestro propio Nitro. Cualquier PR que exponga el token en el bundle se rechaza.

### 5.2 Cliente `server/utils/wasi.ts`

```ts
const WASI_BASE = 'https://api.wasi.co/v1'

interface WasiQuery { [key: string]: string | number | boolean | undefined }

async function callWasi<T>(path: string, query: WasiQuery = {}): Promise<T> {
  const config = useRuntimeConfig()
  return await $fetch<T>(`${WASI_BASE}/${path}`, {
    method: 'GET',
    query: {
      id_company: config.wasi.idCompany,
      wasi_token: config.wasi.token,
      ...query,
    },
    timeout: 10_000,
    retry: 1,
  })
}

/** Respuestas cacheadas: Wasi no debe recibir una llamada por visita. */
export const searchProperties = defineCachedFunction(
  async (query: WasiQuery) => callWasi<WasiSearchResponse>('property/search', query),
  { maxAge: 900, name: 'wasi-search', getKey: (q) => JSON.stringify(q) },
)

export const getProperty = defineCachedFunction(
  async (id: string) => callWasi<WasiProperty>(`property/get/${id}`),
  { maxAge: 3600, name: 'wasi-property', getKey: (id) => id },
)

export const getFeatured = defineCachedFunction(
  async () => callWasi<WasiSearchResponse>('property/highlighted', { take: 8 }),
  { maxAge: 900, name: 'wasi-featured', getKey: () => 'featured' },
)
```

### 5.3 Endpoints a usar **VERIFICAR**

Contrastar nombres exactos de parámetros contra `https://api.wasi.co/docs` antes de codificar los filtros.

| Uso | Endpoint | Parámetros previstos |
|---|---|---|
| Listado + filtros | `property/search` | `id_property_type`, `id_city`, `id_location`, `for_rent`, `for_sale`, `min_price`, `max_price`, `bedrooms`, `bathrooms`, `min_area`, `max_area`, `skip`, `take`, `order_by`, `short` |
| Ficha | `property/get/{id}` | — |
| Destacados home | `property/highlighted` | `take` |
| Tipos de inmueble | `property-type/all` | — |
| Ciudades / zonas | `location/city`, `location/location` | — |
| Rangos de sliders | `property/price-range`, `property/area-range` | — |

Usar `short=true` en listados (no se necesitan galerías completas ni características) y respuesta completa solo en la ficha.

### 5.4 Normalización **CERRADO**

Nunca se pasa el objeto crudo de Wasi a los componentes. Todo se mapea en `server/utils/wasi-mappers.ts` al tipo propio:

```ts
// shared/types/property.ts
export interface Property {
  id: string
  slug: string                 // "apartamento-en-arriendo-envigado"
  title: string
  operation: 'rent' | 'sale' | 'both'
  propertyType: string
  city: string
  zone: string
  address?: string
  price: { rent?: number; sale?: number; currency: 'COP'; adminIncluded: boolean }
  specs: { bedrooms: number; bathrooms: number; garages: number; areaM2: number; stratum?: number }
  description: string
  features: string[]
  images: { url: string; alt: string; width?: number; height?: number }[]
  coords?: { lat: number; lng: number }
  code: string                 // id_property visible al usuario
  updatedAt: string
}
```

La URL canónica de la ficha es `/inmueble/[slug]-[id]`. El `id` al final es la fuente de verdad; el slug es decorativo y si no coincide se hace redirect 301 al slug correcto.

### 5.5 Manejo de fallos **CERRADO**

Si Wasi responde error o timeout:
- En listados: renderizar el estado vacío con el mensaje "No pudimos cargar el inventario en este momento" + CTA de WhatsApp. Nunca una pantalla en blanco ni un stack trace.
- En ficha: `createError({ statusCode: 404 })` si el inmueble no existe; 503 con página amable si la API falla.
- Registrar en consola del servidor con prefijo `[wasi]`.

---

## 6. Rutas y `routeRules`

### 6.1 Mapa de rutas

```
/                                   Home
/arriendo                           Listado arriendo
/venta                              Listado venta
/arriendo/[tipo]                    apartamentos | casas | locales | oficinas
/venta/[tipo]
/arriendo/[zona]                    envigado | sabaneta | medellin | itagui | ...
/arriendo/[zona]/[tipo]             combinada, indexable
/inmueble/[slug]-[id]               Ficha
/propietarios                       Landing + consigna tu inmueble
/nosotros
/aliados
/contacto
/pqrs
/preguntas-frecuentes
/legal/tratamiento-de-datos
/legal/aviso-de-privacidad
/legal/terminos-y-condiciones
/legal/politica-de-cookies
/legal/habeas-data
/blog  y  /blog/[slug]              Fase 3
```

Zonas y tipos se resuelven contra un diccionario estático en `shared/data/taxonomy.ts` que mapea slug → `id_city` / `id_location` / `id_property_type` de Wasi. **Si el slug no existe en el diccionario, 404.** No se aceptan segmentos arbitrarios: evita generar infinitas URLs indexables basura.

### 6.2 Enlaces externos **CERRADO**

```ts
export const EXTERNAL_LINKS = {
  payments: 'https://pagos.palomma.com/inmobarco/auth/login',
  clientArea: 'https://clientes.inmobarco.com',
  whatsapp: 'https://wa.me/573023157535',
} as const
```

Siempre con `target="_blank" rel="noopener noreferrer"` y un `<span class="sr-only">(abre en una nueva pestaña)</span>`.

### 6.3 `routeRules`

```ts
routeRules: {
  '/':                     { prerender: true },
  '/nosotros':             { prerender: true },
  '/aliados':              { prerender: true },
  '/contacto':             { prerender: true },
  '/pqrs':                 { prerender: true },
  '/preguntas-frecuentes': { prerender: true },
  '/propietarios':         { prerender: true },
  '/legal/**':             { prerender: true },
  '/arriendo/**':          { swr: 900 },
  '/venta/**':             { swr: 900 },
  '/inmueble/**':          { swr: 3600 },
}
```

Se usa **SWR y no ISR** porque el despliegue es self-host con `node-server`. Si algún día se migra a Vercel, solo se cambian estas líneas.

---

## 7. Especificación por página

### 7.1 Home

Orden de bloques, no negociable:

1. **Top bar** (ink): teléfono, correo, y a la derecha *Pagar arriendo* y *Área de clientes*.
2. **Header** sticky: logo, nav (Arriendo · Venta · Zonas · Propietarios · Nosotros · Contacto), botón primario *Consigna tu inmueble*. Al hacer scroll reduce altura y aparece `shadow-sm`.
3. **Hero**: imagen/ilustración del valle a sangre, titular a la izquierda, y **panel de búsqueda blanco flotando sobre el borde inferior oscuro**. Campos: operación (arriendo/venta), zona, tipo, presupuesto, botón *Buscar*.
4. **Zonas**: tiles verticales con foto por municipio/barrio + contador de inmuebles.
5. **Inmuebles destacados**: grid de 6–8 `PropertyCard` desde `property/highlighted`.
6. **Doble camino**: dos paneles — *Estoy buscando dónde vivir* → `/arriendo`; *Tengo un inmueble* → `/propietarios`.
7. **Propuesta de valor**: 4 puntos (respaldo jurídico, pago puntual del canon, mantenimiento con equipo propio, inventarios y acompañamiento).
8. **Cómo administramos tu inmueble**: 3 pasos numerados. Es el único lugar donde se permite numeración, porque sí es una secuencia.
9. **Aliados**: fila de logos.
10. **Cierre**: bloque ink con CTA de WhatsApp y teléfono.
11. **Footer** (§7.5).

### 7.2 Listado

- Filtros en este orden: operación → zona → tipo → precio → habitaciones → baños → área → más.
- Contador de resultados en vivo junto al título.
- En móvil los filtros van en un **bottom sheet** con botón fijo *Filtrar*; se aplican al cerrar.
- **Paginación numerada, no scroll infinito** (SEO e indexación). Mapea a `skip`/`take`.
- URL: la combinación zona/tipo es ruta; los ajustes finos van en query string (`?precioMin=&precioMax=&habitaciones=`) con `<link rel="canonical">` apuntando a la ruta base sin query.
- Estado vacío: texto claro, botón *Limpiar filtros* y sugerencia de zonas cercanas.

### 7.3 Ficha de inmueble

Galería (foto grande + miniaturas + lightbox) → encabezado (título, zona, precio grande, badges) → fila de datos clave con iconos → descripción → características → mapa (fase 3) → **panel lateral sticky** con *Agendar visita*, WhatsApp, teléfono y código del inmueble → relacionados por zona y tipo.

### 7.4 Propietarios / PQRS / Contacto

Ver §8. La landing de propietarios es la página de conversión más importante del negocio: un solo CTA visible por pantalla.

### 7.5 Footer

Cuatro columnas — Inmobarco (descripción + redes) · Explora (arriendo, venta, zonas, propietarios) · Compañía (nosotros, aliados, blog, contacto, PQRS, FAQ) · Contacto y accesos (*Pagar arriendo*, *Área de clientes*).

Datos legales obligatorios en la barra inferior:

```
INMOBARCO INMOBILIARIA S.A.S. · NIT 901.559.457-0
Carrera 42 N.° 5 Sur – 145, Oficina 11-109, Medellín, Antioquia
+57 302 315 7535 · administrativo@inmobarco.com · mantenimiento@inmobarco.com
```

Más enlaces a las cinco páginas legales y espacio reservado para las **matrículas de arrendador por municipio** (pendiente de entregar por Inmobarco; dejar el componente listo y alimentado desde `shared/data/legal.ts`).

---

## 8. Formularios

### 8.1 Arquitectura **CERRADO**

`Formulario (cliente, validación zod) → POST /api/{contact|pqrs|consign} → validación zod en servidor → webhook n8n → n8n enruta correo, CRM y WhatsApp.`

El sitio no envía correos por su cuenta ni conoce destinatarios. Toda la lógica de enrutamiento vive en n8n.

```ts
// server/api/contact.post.ts
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, contactSchema.parse)
  if (body.website) return { ok: true }            // honeypot: descarta en silencio
  await verifyTurnstile(event, body.captchaToken)
  await sendToN8n('contact', body, event)
  return { ok: true, ticket: generateTicket('CT') }
})
```

### 8.2 Autorización de datos **CERRADO**

Todo formulario incluye un checkbox **sin marcar por defecto**, obligatorio para habilitar el envío:

> Autorizo el tratamiento de mis datos personales conforme a la **Política de Tratamiento de Datos** de Inmobarco Inmobiliaria S.A.S.

La Ley 1581 de 2012 exige consentimiento previo, expreso e informado. Por eso, junto al payload se envía siempre a n8n la evidencia de la autorización:

```ts
consent: {
  accepted: true,
  policyVersion: '2026-09',     // de shared/data/legal.ts
  acceptedAt: new Date().toISOString(),
  ip: getRequestIP(event, { xForwardedFor: true }),
  userAgent: getRequestHeader(event, 'user-agent'),
}
```

### 8.3 Campos

- **Contacto:** nombre, correo, teléfono, asunto, mensaje, inmueble de interés (opcional, autocompletado desde la ficha).
- **PQRS:** tipo (Petición / Queja / Reclamo / Sugerencia / Felicitación), nombre, tipo y número de documento, correo, teléfono, descripción, adjunto opcional (máx. 5 MB, pdf/jpg/png). **Devuelve número de radicado en pantalla** y por correo.
- **Consigna tu inmueble:** nombre, teléfono, correo, tipo de inmueble, zona, canon esperado, mensaje.

### 8.4 Antispam **CERRADO**

Honeypot + Cloudflare Turnstile + rate limiting de `nuxt-security` (máx. 5 envíos por IP cada 10 minutos).

---

## 9. SEO, datos estructurados e imágenes

### 9.1 Configuración

```ts
// nuxt.config.ts (extracto)
site: {
  url: 'https://inmobarco.com',
  name: 'Inmobarco Inmobiliaria',
  description: 'Arrendamiento y administración de inmuebles en el Valle de Aburrá.',
  defaultLocale: 'es-CO',
},
image: {
  domains: ['images.wasi.co'],       // VERIFICAR el dominio real de las imágenes
  format: ['avif', 'webp'],
  screens: { sm: 640, md: 768, lg: 1024, xl: 1280 },
},
```

### 9.2 Datos estructurados

- Global: `Organization` + `RealEstateAgent` (nombre, NIT, dirección, teléfono, geo, redes).
- Ficha: `RealEstateListing` con `Apartment`/`House` anidado (precio, operación, habitaciones, baños, área, fotos).
- Listados y ficha: `BreadcrumbList`.

Nota para expectativas: Google ya no muestra resultados enriquecidos de FAQ (retirados en mayo de 2026) ni garantiza los de propiedades. El marcado se mantiene por semántica y búsqueda con IA, no por promesa de rich snippet.

### 9.3 SEO local

Cada combinación zona/tipo tiene `title`, `description` y un párrafo introductorio **único** escrito a mano en `shared/data/taxonomy.ts`. Nada de texto autogenerado por plantilla con la variable cambiada: eso es contenido duplicado.

### 9.4 Rendimiento — objetivo de salida

| Métrica | Objetivo |
|---|---|
| LCP móvil (home y ficha) | < 2.5 s |
| CLS | < 0.1 |
| INP | < 200 ms |
| JS inicial | < 120 KB gzip |
| Lighthouse Performance móvil | ≥ 90 |

Reglas: primera imagen del hero con `preload` y `fetchpriority="high"`; todas las demás `loading="lazy"` con `width`/`height` declarados; `<NuxtLink>` con prefetch; fuentes autohospedadas con `font-display: swap`.

---

## 10. Accesibilidad y calidad — definición de terminado

Ninguna tarea se cierra sin esto:

- Contraste AA en todo texto (recordar la regla del §4.2).
- `:focus-visible` visible en todos los interactivos: `outline: 3px solid var(--color-secondary); outline-offset: 2px`.
- Navegación completa por teclado, incluidos filtros, bottom sheet y lightbox (con trampa de foco y cierre con `Esc`).
- `prefers-reduced-motion: reduce` desactiva transiciones y animaciones.
- Todas las imágenes con `alt` descriptivo; las decorativas con `alt=""`.
- Jerarquía de encabezados correcta: un solo `<h1>` por página.
- Responsive real desde 360 px.

Sobre motion: se permiten transiciones de respuesta a la acción del usuario (abrir, expandir, confirmar). **No** se usan animaciones de entrada al hacer scroll en cada sección; abaratan el diseño y lo hacen parecer plantilla.

---

## 11. Variables de entorno

```bash
# .env
NUXT_WASI_ID_COMPANY=
NUXT_WASI_TOKEN=
NUXT_N8N_WEBHOOK_URL=
NUXT_TURNSTILE_SECRET_KEY=
NUXT_PUBLIC_TURNSTILE_SITE_KEY=
NUXT_PUBLIC_SITE_URL=https://inmobarco.com
NUXT_PUBLIC_GTAG_ID=
```

```ts
runtimeConfig: {
  wasi: { idCompany: '', token: '' },
  n8nWebhookUrl: '',
  turnstileSecretKey: '',
  public: { siteUrl: '', turnstileSiteKey: '', gtagId: '' },
},
```

Incluir `.env.example` en el repo. `.env` va en `.gitignore`.

---

## 12. Despliegue

Preset `node-server`, contenedor Docker, publicado en el VPS de Contabo con Easypanel (Docker Swarm) y Traefik resolviendo TLS y enrutamiento.

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

Notas operativas:

- Exponer el puerto 3000 y dejar que Traefik haga el proxy. **No** levantar nginx en el host: en este VPS nginx y Traefik ya han chocado en el puerto 80; si aparece, `systemctl mask nginx`.
- El caché de `defineCachedFunction` es en memoria del proceso. Con una sola réplica es suficiente. Si se escala a varias réplicas en Swarm, configurar el storage de Nitro contra Redis antes de subir el número de réplicas.
- Salud: exponer `/api/health` que responda 200 sin tocar Wasi.

---

## 13. Fases y criterios de aceptación

### Fase 0 — Setup y sistema de diseño (1–1.5 semanas)

Entregable: repo inicializado, tokens, tipografías, componentes base (`BaseButton` con 5 variantes y 3 tamaños, `BaseInput`, `BaseSelect`, `BaseBadge`), layout con header/top bar/footer, proxy Nitro a Wasi funcionando.

**Aceptación:** una página de prueba lista 12 inmuebles reales traídos de Wasi; el bundle del cliente no contiene el token (verificar con `grep` sobre `.output/public`); `pnpm build` limpio.

### Fase 1 — MVP (3–4 semanas)

Home, listados con filtros y paginación, ficha, contacto, SEO base (sitemap, robots, meta, schema), imágenes optimizadas, enlaces a Palomma y área de clientes.

**Aceptación:** LCP móvil < 2.5 s en home y ficha; todas las fichas con schema válido en el Rich Results Test; formulario de contacto llegando a n8n con la evidencia de consentimiento; 404 correcto en slugs inexistentes.

### Fase 2 — Institucional y legal (1.5–2 semanas)

PQRS con radicado, Nosotros, Aliados, Propietarios, cinco páginas legales, FAQ, banner de cookies con Consent Mode v2.

**Aceptación:** ningún formulario en producción antes de que estén publicadas la política de tratamiento y el aviso de privacidad.

### Fase 3 — Contenidos y optimización (2–3 semanas)

Blog con `@nuxt/content`, OG images automáticas, mapa en listados, testimonios, analítica completa, auditoría de Core Web Vitals.

---

## 14. Analítica

GA4 vía `nuxt-gtag`, respetando Consent Mode v2. Eventos con estos nombres exactos:

`search_submit` · `property_view` · `whatsapp_click` · `pay_rent_click` · `client_area_click` · `contact_submit` · `pqrs_submit` · `consign_submit` · `filter_apply`

El botón de WhatsApp lleva mensaje prellenado con el código del inmueble, para que el ecosistema "Barquito" (Evolution API + n8n) pueda identificar la propiedad y responder en contexto:

```
https://wa.me/573023157535?text=Hola,%20me%20interesa%20el%20inmueble%20{{code}}
```

---

## 15. Puntos a verificar antes de codificar

1. **VERIFICAR** nombres exactos de parámetros de `property/search` en la documentación de Wasi; ajustar `usePropertyFilters` si difieren.
2. **VERIFICAR** el dominio real desde el que Wasi sirve las imágenes y añadirlo a `image.domains`.
3. **VERIFICAR** con Inmobarco: logo en SVG, matrículas de arrendador por municipio, cifras reales de trayectoria (no reutilizar cifras de otras inmobiliarias vistas en benchmarking), y la versión vigente de la política de tratamiento de datos.
4. **VERIFICAR** el URL definitivo de Palomma en producción antes del lanzamiento.
5. **VERIFICAR** los tonos 700–950 de la escala primaria contra el manual de marca; los del §4.1 son derivaciones y deben confirmarse con diseño.

## 16. Qué no hacer

- No consumir Wasi desde el cliente.
- No instalar librerías de componentes de terceros.
- No usar scroll infinito en listados.
- No generar rutas indexables a partir de segmentos arbitrarios.
- No integrar la pasarela de pagos: Palomma es un enlace externo.
- No publicar formularios sin las páginas legales y el checkbox de autorización.
- No inventar cifras de trayectoria, testimonios ni nombres de aliados en el contenido de producción.
