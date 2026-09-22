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

## 2026-09-18 — Marca entregada por Inmobarco (§15.3, parcial)

En `public/brand/`: `isotipo.png` (la marca) y `logotipo.svg` (el lockup completo).

### 15. El isotipo es un PNG de dos tintas; el logotipo, un trazado automático

- **`isotipo.png`** (320x269, con alfa, sin margen sobrante): la marca real, en dos tintas —
  **`#48C0F8`** la curva y **`#182020`** el edificio. Es la que se usa en cabecera, pie y
  favicon. Al ser mapa de bits **no se puede recolorear**: solo sirve sobre fondo claro. Para
  fondo oscuro habrá que pedir la versión en negativo.
- **`logotipo.svg`** (1200x1200): el lockup completo, isotipo sobre "Inmobarco" y
  "Inmobiliaria" debajo. Son 43 trazados y **41 colores distintos** (`#07181E`, `#08191E`,
  `#0A1B21`… todos casi iguales): es el vectorizado automático de un mapa de bits, con el
  antialias convertido en trazados sueltos. Pesa 72 KB y sus cianes (`#22A9D1`) están
  apagados frente al isotipo bueno. Sirve como imagen suelta, no como vector de marca.

Iconos generados desde `isotipo.png`, marca sobre lienzo blanco redondeado: `favicon.ico`
(16+32+48 con PNG embebido), `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png` (180)
y `brand/icon-192.png` / `icon-512.png`. **No hay favicon en SVG**: no existe un vector limpio
del isotipo del que derivarlo. A 16 px las líneas de los edificios se empastan y la marca se
reconoce solo por la silueta y el arco cian; si molesta, hace falta una versión simplificada
del isotipo pensada para tamaños pequeños.

### 16. La paleta del manual queda confirmada (§15.5, primario e ink)

El isotipo oficial usa `#48C0F8` y `#182020`, a un paso del `#48BFF7` (primario) y `#141F21`
(ink) del §4.1. Los grises raros del apartado anterior eran ruido del vectorizado, no la
marca. Siguen sin confirmar los tonos 700–950 de la escala derivada.

## 2026-09-21 — Fase 1: taxonomía y listados

### 17. Destacados y oficinas, decididos por el cliente

- **Destacados = lo más reciente**, confirmado el 21-09-2026. `/api/properties/featured`
  devuelve los 8 publicados más nuevos. Si algún día se marcan destacados en Wasi, basta
  cambiar ese endpoint.
- **Oficinas fuera del diccionario.** El §6.1 la lista como slug de tipo, pero no hay ni una
  en el inventario: `/arriendo/oficinas` devuelve 404 en lugar de una página vacía indexable.

### 18. Solo se indexa lo que tiene copy propio y resultados

El §9.3 exige texto único escrito a mano por combinación. En vez de confiar en que alguien se
acuerde, la regla se hace cumplir sola: `listingCopy()` devuelve `null` cuando no hay texto, y
la página sale `noindex, follow`. Se indexa cuando se cumplen **las dos** condiciones:

1. la combinación tiene copy propio en `shared/data/taxonomy-copy.ts`, y
2. el listado devuelve al menos un resultado.

Así una combinación nueva no entra al índice hasta que se le escriba su párrafo, y un listado
que se queda sin inventario sale del índice solo. Hoy hay copy para 26 rutas de listado, que
son exactamente las que van al sitemap.

El copy lo escribió Claude como primer borrador. Es texto público de marca: conviene que
Inmobarco lo revise antes de que el sitio salga a producción.

### 19. La canónica conserva la paginación, no los filtros

El §7.2 pide canónica "a la ruta base sin query". Se aplica a los filtros: `?presupuesto`,
`?habitaciones`, `?banos`, `?areaMin` y `?orden` nunca aparecen en la canónica, así que las
permutaciones no se indexan. La paginación sí se conserva (`?pagina=3` es autocanónica),
porque si todas las páginas apuntaran a la primera, Google dejaría de recorrer el inventario:
es el único camino hasta las fichas que no caben en la página 1.

### 20. El caché SWR de desarrollo persiste en disco

Con `routeRules` de `swr`, Nitro guarda las respuestas en `.nuxt/cache` y **sobreviven al
reinicio del servidor de desarrollo**. Un cambio en una página bajo `/arriendo/**` o
`/venta/**` puede parecer que no se aplica cuando en realidad se está sirviendo HTML viejo.
Para verificar de verdad: `rm -rf .nuxt/cache node_modules/.cache/nuxt/.nuxt/cache`.

### 21. El inventario se mueve

Entre el 18 y el 21 de septiembre de 2026 pasó de 125 a 119 inmuebles. Cualquier cifra que se
escriba a mano en el copy envejece: por eso los textos no citan números de inventario.

## 2026-09-21 — Fase 1: home

### 22. La home va con SWR, no con prerender (§6.3)

El §6.3 la lista como `prerender: true`, pero la home del §7.1 muestra inventario vivo: los
destacados y el contador de inmuebles por municipio. Congelarla en el build la dejaría
desactualizada hasta el siguiente despliegue y obligaría a tener las credenciales de Wasi en
tiempo de build, dentro de la imagen de Docker. Queda en `swr: 900`, como los listados.

### 23. Del mockup no se publica todo

Dos bloques del mockup traen contenido que el §16 no deja publicar tal cual:

- **Aliados.** AFFI, Palomma, Seguros Bolívar, Metrocuadrado, Fincaraíz y Lonja de Medellín son
  relleno de maqueta. `shared/data/partners.ts` está vacío y la sección no se pinta hasta que
  Inmobarco confirme quiénes son y entregue los logos.
- **Propuesta de valor.** El mockup promete cosas concretas —consignar dentro de los cinco días
  hábiles siguientes al corte, estado de cuenta en un portal del propietario, póliza de
  arrendamiento, firma electrónica, fotografía profesional— que no están en el manual y que
  nadie ha confirmado. Son compromisos comerciales, así que el texto publicado describe los
  cuatro pilares del §7.1 sin inventar plazos ni herramientas. **Si esas promesas son ciertas,
  conviene decirlo: venden mucho más que la versión genérica.**

Tampoco se publicaron los contadores fijos de los mosaicos de zona ("48 inmuebles"): salen de
`/api/properties/counts`, que los pide a Wasi. Y el hero ya no ofrece oficinas.

### 24. Las fachadas de degradado siguen en producción

Los mosaicos de zona usan los degradados CSS del mockup en lugar de foto por municipio. El
§7.1 pide foto, pero nadie las ha entregado y ninguna fase se hace cargo de producirlas. Es
preferible un marcador honesto a una foto de banco de imágenes que no es del sitio que dice ser.

## Pendientes de verificar

- **Destacados de la home** — decisión de producto pendiente (ver punto 9).
- **Slug de tipo `oficinas`** en el §6.1 — sin inventario que lo respalde (ver punto 10).
- **Eje de ancho de Archivo.** El mockup carga la fuente variable con los ejes `wdth,wght`
  (`100..125, 400..700`) porque el `font-stretch: 110%` del §4.4 depende de ello. Falta
  comprobar que `@nuxt/fonts` autohospede la variable con el eje `wdth` y no una estática; si no,
  habrá que declarar el `@font-face` a mano sobre el archivo woff2.
- **Lockup horizontal del logo.** El archivo entregado apila marca y palabra en un lienzo
  cuadrado, que a 74 px de alto de cabecera no sirve. Hoy la cabecera compone isotipo oficial +
  "inmobarco" escrito en Archivo, que **no** es la tipografía del logotipo oficial. Hace falta
  el lockup horizontal en vector limpio, o autorización para componerlo.
- **Imágenes estáticas sin fase asignada** — el manual no encarga a ninguna fase producir las
  fotos de las tiles de zona (§7.1, bloque 4) ni los logos de aliados (bloque 9). El mockup las
  resuelve con degradados CSS y texto.
- **§15.4, §15.5** — pendientes de Inmobarco (matrículas de arrendador, cifras reales, URL de
  Palomma en producción, tonos 700–950 contra el manual de marca).
