# Decisiones y desviaciones del manual

Registro de todo lo que difiere de `MANUAL_IMPLEMENTACION_INMOBARCO_WEB.md`, con el motivo.
El manual sigue siendo la fuente de verdad; esto anota dónde la realidad obligó a ajustar.

## 2026-09-18 — Fase 0, arranque

### 1. Tailwind v4 en lugar de `@nuxtjs/tailwindcss` (§2, §4.3)

El manual describe `@nuxtjs/tailwindcss` con un `tailwind.config.ts` de sintaxis v3. En Nuxt 4
lo vigente es Tailwind v4, que se integra por el plugin de Vite `@tailwindcss/vite` y configura
el tema en CSS con `@theme`, sin archivo de configuración.

Se instaló `tailwindcss` + `@tailwindcss/vite`. Los tokens del §4.1 viven en
`app/assets/css/tokens.css` dentro de un bloque `@theme`: emite las mismas custom properties en
`:root` que el manual pide y además genera las utilidades (`bg-primary-600`, `text-ink`,
`shadow-md`, `rounded-lg`, `font-display`). Los valores no se tocaron.

Aprobado por el cliente el 18-09-2026.

### 2. Wasi sirve imágenes desde dos hosts, no uno (§9.1, §15.2 — VERIFICAR resuelto)

El manual anota `images.wasi.co`. Contra respuestas reales de la API (ver
`ficha-inmobarco/server/utils/image-url-allowlist.ts`, contrastado con 50 inmuebles):

- `image.wasi.co` sirve los campos `url` y `url_big`.
- `images.wasi.co` sirve `url_original`.

`image.domains` incluye los dos. Nota operativa heredada de ese proyecto: `image.wasi.co`
responde con `Content-Type: image` sin subtipo, algo a tener en cuenta si se vuelve a proxiar.

### 3. `nuxt-og-image` desactivado hasta fase 3 (§13)

`@nuxtjs/seo` arrastra `nuxt-og-image`, que exige un renderer nativo (`@takumi-rs/core`) y
rompe el build sin él. Las OG images automáticas son fase 3, así que el submódulo queda
desactivado (`ogImage: { enabled: false }`). Al llegar la fase 3 se instala el renderer y se
quita esa línea.

### 4. TypeScript fijado en 5.9.3

`typescript@7.0.2` es lo que instala npm por defecto hoy, pero `typescript-eslint` aún no lo
soporta y `vue-tsc` no arranca contra su API. Con TS 5.9.3, `pnpm lint` y `pnpm typecheck`
pasan limpios. Revisar cuando typescript-eslint publique soporte para TS >= 7.1.

### 5. Rate limiting de `nuxt-security` desactivado en global (§8.4)

El limitador del módulo se aplica a todas las rutas por defecto, lo que estrangularía la
navegación. Queda en `false` y se activará por ruta sobre `/api/contact`, `/api/pqrs` y
`/api/consign` cuando existan, con el límite del manual: 5 envíos por IP cada 10 minutos.

### 6. `routeRules` de prerender, incompletas a propósito (§6.3)

Solo está `'/': { prerender: true }`. Una regla de prerender sobre una ruta sin página rompe el
build, así que las de `/nosotros`, `/aliados`, `/contacto`, `/pqrs`, `/preguntas-frecuentes`,
`/propietarios` y `/legal/**` se añaden a medida que cada página exista. Las de `swr` ya están
todas.

### 7. Entorno de desarrollo: pnpm por npm, no por corepack

`corepack enable` escribe shims en `C:\Program Files\nodejs` y exige elevación. pnpm 12.4.2 se
instaló con `npm install -g pnpm`. pnpm 12 además bloquea los scripts de instalación: los
permitidos se declaran en `pnpm-workspace.yaml` bajo `allowBuilds` (no en `package.json`).

## 2026-09-18 — Capa de datos, contra la API real

Sondeada la API con las credenciales de producción (125 inmuebles en el inventario).
Lo verificado sustituye a lo supuesto en el manual.

### 8. `property/search`: nombres y semántica reales (§15.1 — VERIFICAR resuelto)

Los nombres del §5.3 son correctos salvo lo siguiente:

- **`bedrooms` y `bathrooms` filtran por mínimo, no por valor exacto.** `bedrooms=3`
  devuelve 71 inmuebles, que es justo el número de inmuebles con 3 habitaciones **o más**
  (los de exactamente 3 son 68). La UI debe decir "3 o más habitaciones", no "3".
- **`id_location` no sirve.** Viene en 0 en los 125 inmuebles y usarlo como filtro devuelve
  cero resultados. La zona real de Wasi es **`id_zone`** (`zone_label` es el barrio). El
  diccionario del §6.1 mapea entonces slug → `id_city` / `id_zone`.
- **`take` está tope 100.** Pedir 200 devuelve 100. La paginación no puede superarlo.
- **`order_by` acepta nombres de campo de Wasi.** `order_by=price` se ignora en silencio;
  lo que ordena es `rent_price`, `sale_price`, `created_at`, con `order=asc|desc`.
- Los parámetros desconocidos se ignoran sin error, así que un filtro mal escrito no falla:
  devuelve el inventario entero. Conviene no fiarse de que "no dio error".
- Wasi devuelve **todo como string**, incluidos números y booleanos (`"true"`, `"2300000"`).
- Fechas sin zona horaria (`"2026-09-18 08:57:20"`), en hora de Colombia: el mapper les
  añade `-05:00` para que no se desplacen cinco horas.

### 9. Los destacados de la home no existen en Wasi (§7.1, bloque 5)

`property/highlighted` devuelve **total = 0** y el campo `featured` vale 0 en los 125
inmuebles; `featured=true` como filtro se ignora. Hasta que Inmobarco marque destacados
desde Wasi, `/api/properties/featured` devuelve **los 8 publicados más recientemente**.
Decisión de producto pendiente: marcarlos en Wasi, curar una lista de ids a mano, o dejar
"lo más nuevo" como criterio permanente.

### 10. `location/city` y `location/location` no existen

Los endpoints de localización del §5.3 responden 404. El único catálogo disponible es
`property-type/all` (33 tipos). Las ciudades y zonas se derivan del inventario y se fijan a
mano en `shared/data/taxonomy.ts`, que es lo que el §6.1 pide de todos modos. El inventario
actual: Sabaneta 60, La Estrella 33, Medellín 15, Itagüí 11, Envigado 6. Tipos en uso:
Apartamento (2), Casa (1), Local (3), Apartaestudio (14). **No hay oficinas**, pese a que el
§6.1 las lista como slug de tipo: publicar `/arriendo/oficinas` sería una página vacía.

### 11. La cuota de administración no está en Wasi

`maintenance_fee` viene en 0 en los 125 inmuebles, así que `price.adminIncluded` se mapea a
`false` y ninguna tarjeta afirma que la administración esté incluida. Si el dato importa
comercialmente, hay que capturarlo en Wasi primero.

### 12. Blanco sobre `#1B99D3` no pasa AA — el mockup sí lo usa

El `.btn--secondary` del mockup pinta blanco sobre `var(--secondary)` = `#1B99D3`, que da
**3.21:1** y no cumple AA para texto normal. La regla del §4.2 es CERRADO, así que
`BaseButton` variante `secondary` usa `--color-primary-700` (`#1878AC`, **4.86:1**). La
variante `primary` mantiene ink sobre `#48BFF7`: **8.07:1**.

### 13. Importaciones a `shared/` por el alias `#shared`

Las rutas relativas (`../../../shared/...`) funcionan en desarrollo pero rompen el build de
Rollup, que resuelve desde otro directorio. Todo el código usa `#shared/...`, el alias que
Nuxt 4 ya provee para cliente y servidor.

### 14. Componentes sin prefijo de carpeta

`components: [{ path: '~/components', pathPrefix: false }]`, para que el componente de
`components/ui/BaseButton.vue` se use como `<BaseButton>` y no `<UiBaseButton>`, que es como
los nombra el manual.

## Pendientes de verificar

- **Destacados de la home** — decisión de producto pendiente (ver punto 9).
- **Slug de tipo `oficinas`** en el §6.1 — sin inventario que lo respalde (ver punto 10).
- **Eje de ancho de Archivo.** El mockup carga la fuente variable con los ejes `wdth,wght`
  (`100..125, 400..700`) porque el `font-stretch: 110%` del §4.4 depende de ello. Falta
  comprobar que `@nuxt/fonts` autohospede la variable con el eje `wdth` y no una estática; si no,
  habrá que declarar el `@font-face` a mano sobre el archivo woff2.
- **§15.3, §15.4, §15.5** — pendientes de Inmobarco (logo SVG, matrículas de arrendador, cifras
  reales, URL de Palomma en producción, tonos 700–950 contra el manual de marca).
