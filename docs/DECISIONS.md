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

## 2026-09-22 — Contenido estático y dos fallos encontrados

### 25. El eje de ancho de Archivo no se estaba aplicando (pendiente resuelto)

`@nuxt/fonts` servía Archivo con `font-stretch: 100%` fijo, así que el
`font-stretch: 110%` de los titulares (§4.4, **CERRADO**) no hacía **nada**: todos los
titulares del sitio salían en ancho normal y el gesto tipográfico de la marca no existía.

La causa: el módulo no sabe pedir el eje `wdth`. Las opciones de unifont
(`ResolveFontOptions`) solo cubren pesos, estilos, subconjuntos y formatos. No hay manera de
configurarlo.

Solución: Archivo variable autohospedada a mano en `public/fonts/`, con `@font-face` propio y
`font-stretch: 62.5% 125%`, que es el rango real de la fuente. En `nuxt.config` se le dice al
módulo que no la toque (`provider: 'none'`); Inter la sigue resolviendo él. Verificado en el
CSS del build: el `110%` cae ahora dentro del rango declarado.

### 26. El token de Wasi se escribía en los logs del servidor

Los errores de `ofetch` traen la URL completa **con su query string** dentro del mensaje, así
que `console.error(error.message)` imprimía el token en claro. Se vio al primer timeout real:

```
[wasi] fallo en property/search: [GET] "https://api.wasi.co/v1/property/search?id_company=…&wasi_token=…"
```

En producción eso va a los logs del contenedor, que en Easypanel ve cualquiera con acceso al
panel. `server/utils/wasi.ts` ahora tacha `wasi_token` e `id_company` antes de escribir nada.
El comentario que decía que el token nunca entraba al log era falso; ahora es cierto.

**Para Inmobarco:** el token quedó escrito en logs locales de desarrollo (ya borrados). No
salió de la máquina, pero si se quiere ser estricto, rotarlo en Wasi es barato.

### 27. El sitemap puede cachear una versión coja

Ese timeout dejó el sitemap con 25 URLs en vez de 144: el generador degrada a solo listados si
Wasi falla, y el módulo cachea el resultado diez minutos. Mitigado con
`searchPropertiesBulk`, una variante con 30 s de espera en vez de 10, porque nadie está
mirando esa respuesta en pantalla. Si aun así falla, el log lo grita.

### 28. Páginas de contenido con relleno declarado

Las once páginas que el header y el footer ya enlazaban existían como enlaces rotos. Ahora
existen, se prerenderizan y funcionan, pero su texto es estructura, no contenido:

- `shared/data/pages.ts` y `shared/data/legal-documents.ts` guardan el texto con un campo
  `pending`. Mientras sea `true`, la página muestra un aviso visible, sale `noindex` y **queda
  fuera del sitemap** — la exclusión se deriva del mismo dato, no de una lista a mano.
- Las cinco páginas legales llevan solo la estructura que cada documento debe tener. Son
  documentos con efecto jurídico: el texto lo pone Inmobarco o su abogado.
- Cuando llegue el contenido real basta reemplazar el texto y poner `pending: false`. No hay
  que tocar código.

`/legal/**` en `routeRules` no basta para prerenderizar una ruta dinámica: las rutas concretas
se derivan del diccionario en `nitro.prerender.routes`.

### 29. Página de error propia y OG por defecto

- `app/error.vue` cubre 404 y 5xx con la marca y salidas útiles. Antes se veía la pantalla por
  defecto de Nuxt, en inglés y con su logo.
- `public/og-default.png` se compone del logotipo oficial, sin renderizar texto: al compartir
  cualquier enlace ya aparece imagen. Las OG por página siguen siendo fase 3.
- Se eliminó `/test-inventario`, que era andamio de la fase 0.

### 30. Primer contenido real de Inmobarco (22-09-2026)

Entregados y publicados: **Sobre nosotros** (quiénes somos, misión, visión y seis valores) y la
**política de tratamiento de datos**, transcrita de `inmobarco.com/main-contenido-cat-6.htm`,
que es la versión vigente. Las tres páginas —`/nosotros`, `/contacto` y
`/legal/tratamiento-de-datos`— pasaron a `pending: false` y con eso entraron solas al índice y
al sitemap, sin tocar código. El horario de atención de `/contacto` sale de esa misma política,
que es la fuente oficial.

Del texto de Nosotros solo se corrigió puntuación (un «profe sionales» partido y los dos puntos
que separan cada valor de su explicación). La política no se tocó: es un documento con efecto
jurídico y cualquier cambio de fondo lo decide Inmobarco.

**Discrepancias detectadas, sin resolver:**

- **Teléfonos.** La política publicada da `302 598 9760` y `304 525 8750`. El manual (§7.5), el
  footer, la barra superior y el enlace de WhatsApp usan `+57 302 315 7535`. Son tres números
  distintos y ahora conviven en el mismo sitio.
- **Dirección.** La política dice «Poblado CRA 42 # 05-145 Edificio We Work»; el manual dice
  «Carrera 42 N.° 5 Sur – 145, Oficina 11-109». Parece el mismo edificio con distinta notación,
  pero el footer y la política no dicen lo mismo.
- **Fecha de la política.** La página publicada no la trae, así que `updatedAt` queda vacío y la
  ficha del documento no muestra «Actualizada el…». Un documento legal sin fecha de vigencia es
  un flanco débil.

Recordatorio del §13: con la política publicada ya no basta. **El aviso de privacidad sigue
pendiente, así que los formularios todavía no pueden salir a producción.**

### 31. Dos canales de contacto, no uno (22-09-2026)

Inmobarco confirmó que atiende por dos vías distintas y que **no deben mezclarse**:

| | Teléfono | Correo |
|---|---|---|
| **Comercial** — arriendo, venta, visitas, consignación | +57 304 525 8750 | comercial@inmobarco.com |
| **Administrativo y legal** — PQRS, habeas data, trámites | +57 302 315 7535 | administrativo@inmobarco.com |

`shared/data/legal.ts` los separa en `CONTACT.commercial` y `CONTACT.legal`. El comercial es el
que ve el visitante —barra superior, pie, fichas, CTA de la home y de propietarios—, porque es
para lo que existe la página. El administrativo aparece solo en PQRS y en los documentos legales.

También se corrigieron **dirección** (Carrera 47B #17B Sur – 25, Local 102, Edificio Fuente
Azul, Santa María de los Ángeles) y **horario** (lunes a viernes 8:00–16:00, sábados 8:00–12:00).
Ambos viven en un solo sitio y el pie, la página de contacto y la política los leen de ahí, así
que no pueden volver a decir cosas distintas. La dirección del §7.5 del manual estaba
desactualizada.

**El WhatsApp pasa al número comercial** (`wa.me/573045258750`), confirmado por Inmobarco: quien
escribe desde el sitio pregunta por arriendos y ventas. Esto **desvía del §6.2**, que fija
`wa.me/573023157535` como CERRADO. Hay que avisar a quien mantenga Barquito: el flujo que
identifica el inmueble por el código del mensaje (§14) tiene que escuchar en la línea comercial,
no en la administrativa.

**La política publicada en inmobarco.com queda obsoleta a propósito.** Tiene otros teléfonos, la
dirección vieja y horario hasta las 5. Inmobarco confirmó que los datos buenos son los de aquí y
que el documento viejo se ignora: este sitio lo reemplaza.

La política quedó fechada el **15 de enero de 2026** y `DATA_POLICY_VERSION` pasó de `2026-09` a
`2026-01`, que es la versión real a la que el usuario da su consentimiento (§8.2).

Detalle que costó un rato: `new Date('2026-01-15')` es medianoche **UTC**, así que formateado en
hora de Colombia mostraba el 14 de enero. Se formatea en UTC, que es la fecha que el dato
representa.

## 2026-09-23 — Ajustes de interfaz pedidos por Inmobarco

### 32. Foto real en el hero, en vez de la ilustración

`banner.jpeg` sustituye al SVG del valle, que se eliminó. La foto traía **el logo
incrustado** en una banda diagonal a la izquierda, justo donde va el titular y a cuarenta
píxeles del logo de la cabecera, así que se recortó esa banda: `public/hero-home.jpg` es
`banner.jpeg` desde el píxel 540 en adelante. El original se conserva intacto.

**Resolución justa:** el recorte queda en 1060 × 900 px. IPX no amplía más allá del original,
así que en pantallas grandes el hero se sirve desde 1060 px de ancho y se ve blando. Conviene
una foto sin la banda de marca y de al menos 2000 px de ancho.

Detalle de `@nuxt/image`: `sizes="100vw"` a secas genera un srcset absurdo (`s_1x1`, `s_2x2`).
Hay que usar el formato por breakpoint (`sm:100vw md:100vw …`), que es el que ya usaban las
tarjetas de inmueble.

### 33. PQRS en la barra de utilidades, no como CTA de cabecera

Inmobarco pidió que PQRS fuera visible y dejó el sitio a criterio propio, sugiriendo
reemplazar con él el botón «Consigna tu inmueble». Se puso en la **barra superior**, junto a
pagar arriendo y al área de clientes, y también en el menú móvil.

No se reemplazó el CTA de la cabecera: esa barra agrupa accesos de **servicio**, mientras que
«Consigna tu inmueble» es el botón de conversión hacia `/propietarios`, que el §7.4 llama la
página de conversión más importante del negocio. Son dos cosas distintas y quitar la segunda
para meter la primera cambiaría el embudo de captación de propietarios. Si Inmobarco lo quiere
igualmente, es una línea.

### 34. Mosaicos de zona: sin contadores y con foto propia

Se retiró el número de inmuebles de cada municipio. El endpoint `/api/properties/counts` se
mantiene, pero ya solo sirve para **no** enlazar a un municipio que hoy esté sin inventario.

Las fotos van en `app/assets/images/zonas/`, con el nombre del slug del municipio
(`sabaneta.jpg`, `la-estrella.jpg`…). Se resuelven al construir con `import.meta.glob`, así que
basta dejar el archivo: aparece solo, sin tocar código, y el municipio que no tenga foto cae al
degradado de marca. Las instrucciones están en `LEEME.md` dentro de esa carpeta.

### 35. Fuera el correo de mantenimiento

`mantenimiento@inmobarco.com` desaparece de la interfaz por decisión de Inmobarco: las
novedades entran por PQRS, que deja constancia. Se eliminó también de `CONTACT`, no solo de las
vistas. En la página de contacto, donde estaba el correo ahora hay un enlace a PQRS.

## 2026-09-24 — Formulario de contacto (cierra la fase 1)

### 36. Los formularios se desbloquean solos, no a mano

El §13 exige que ningún formulario salga a producción antes de publicar la política de
tratamiento **y** el aviso de privacidad. En lugar de dejarlo escrito en una lista de tareas,
`formsArePublishable()` lo comprueba contra los propios documentos: mientras alguno siga
`pending`, la página de contacto muestra los canales directos en vez del formulario y
`/api/contact` responde 503. El día que llegue el aviso de privacidad, ponerle `pending: false`
abre el formulario sin tocar nada más.

Se comprueba en los dos lados a propósito. La vista decide qué pintar; la API es la que recibe
los datos, y es la que no puede aceptarlos.

### 37. Webhooks de n8n por tipo de formulario

`NUXT_N8N_WEBHOOK_URL` es la base (`…/webhook/`) y cada formulario cuelga de ella:
`web-contact`, y más adelante `web-pqrs` y `web-consign`. La evidencia de consentimiento del
§8.2 —`policyVersion`, `acceptedAt`, IP y user-agent— la arma el servidor y viaja con cada
envío: quien tiene que poder probar la autorización es Inmobarco, no el navegador.

Verificado contra un receptor local, **sin tocar el n8n de producción**: carga útil correcta,
cinco variantes inválidas rechazadas con 400 y ninguna entregada, y el limitador cortando al
sexto intento (§8.4).

### 38. El honeypot no puede validarse con el esquema

Primera versión: el campo trampa era `z.string().max(0)`, así que un bot que lo rellenara
recibía un **400 diciéndole exactamente qué campo lo delató**. Con eso, basta dejarlo vacío la
próxima vez y la trampa deja de servir para siempre.

Ahora el esquema lo acepta con cualquier valor y decide el servidor: con el campo relleno
responde `{ ok: true }` con un radicado creíble y no entrega nada. Comprobado: el receptor no
registró el envío.

### 39. Turnstile queda cableado pero inactivo

No hay claves en `.env`, así que `verifyTurnstile` se salta la verificación y **avisa por
consola en cada envío**. No es un agujero silencioso: el formulario tampoco se publica sin las
páginas legales, y las dos cosas llegan juntas. Al poner `NUXT_TURNSTILE_SECRET_KEY` se activa
sin tocar código.

## 2026-09-25 — Radicados y borradores legales

### 40. Contacto sin número de radicado

El formulario de contacto ya no devuelve un código: confirma con «Tu mensaje fue enviado» y
listo. Un radicado ahí no aportaba nada y el que se generaba era aleatorio, no consecutivo.

**El sitio no puede generar consecutivos** y conviene que quede escrito: no tiene dónde guardar
un contador —el caché de Nitro es memoria del proceso y se reinicia con el contenedor—, con más
de una réplica dos procesos darían el mismo número, y un consecutivo público deja ver el volumen
de solicitudes que recibe la empresa. Cuando llegue PQRS, **el consecutivo lo asigna n8n**, que
sí tiene estado, y el sitio muestra el que le devuelva. Decisión de Inmobarco del 25-09-2026.

### 41. Tres estados para los documentos legales, no dos

`pending` / `draft` / `published`. El intermedio existe porque un borrador redactado por Claude
**no es** un documento aprobado, y tratarlo como tal sería justo el riesgo que el §13 evita.

Solo `published` indexa la página, la mete en el sitemap y cuenta para abrir los formularios.
Un `draft` se ve, se navega y se puede revisar, con un aviso azul bien visible encima.

### 42. Cuatro borradores redactados

A petición de Inmobarco se redactaron el **aviso de privacidad**, los **términos y condiciones**,
la **política de cookies** y el **habeas data**, los cuatro en estado `draft`.

Criterios con los que se escribieron:

- El **aviso de privacidad** no inventa nada: cada afirmación sale de la política de tratamiento
  ya vigente. Cubre el contenido mínimo del artículo 15 del Decreto 1377 de 2013.
- Los **términos** describen el funcionamiento real del sitio: inventario tomado de Wasi y
  sujeto a cambio, precios que no incluyen administración, y pagos y área de clientes operados
  por terceros fuera de este sitio.
- La **política de cookies** dice la verdad comprobada: **hoy el sitio no instala ni una cookie
  ni usa almacenamiento del navegador**. Describe por separado lo que se activará más adelante.
  Hay que actualizarla el día que entre la analítica.
- El **habeas data** cita los plazos de los artículos 14 y 15 de la Ley 1581 de 2012 como lo que
  son: plazos legales, no compromisos propios. Si Inmobarco quiere prometer menos, hay que
  decirlo de forma explícita.

**Aprobados por Inmobarco el 24-09-2026** y pasados a `published`. Con eso las cinco páginas
legales entraron al índice y al sitemap, y **los formularios quedaron abiertos**: el candado del
§13 se levantó solo, sin tocar código, que era justo lo que se buscaba al construirlo así.

Lo que ese gesto deja pendiente:

- **Turnstile sigue sin claves.** El antispam en producción es hoy honeypot + límite de cinco
  envíos por IP cada diez minutos. Es razonable, pero no es lo que pide el §8.4. El servidor lo
  avisa en cada envío: `[turnstile] sin clave configurada: el envío pasó sin verificar`.
- **La política de cookies deja de ser cierta** el día que se encienda GA4 o Turnstile, porque
  hoy afirma que el sitio no instala ninguna cookie. Hay que actualizarla **antes** de activar
  cualquiera de los dos, no después.

## 2026-09-25 — Formulario de consignación

### 43. El formulario es el protagonista de `/propietarios`

El §7.4 llama a esa página «la de conversión más importante del negocio» y pide un solo CTA
visible por pantalla. Antes tenía únicamente un botón de WhatsApp; ahora el CTA **es** entregar
el inmueble, y el teléfono queda al final como salida para quien prefiere hablar antes de dejar
datos.

El canon esperado se pidió **opcional** a propósito. Muchos propietarios no lo tienen claro
—por eso piden el avalúo— y exigirlo en el campo espanta justo a quien más interesa. Si
Inmobarco prefiere que sea obligatorio, es un cambio de una línea.

A n8n le llegan los slugs y también los nombres legibles (`zoneLabel`, `propertyTypeLabel`):
quien lea el correo no tendría por qué traducir `la-estrella` de cabeza.

### 44. Dos pendientes del manual, cerrados

- **§15.4, URL de Palomma:** confirmada por Inmobarco el 25-09-2026. Es la que ya estaba en
  `EXTERNAL_LINKS`, así que no hubo cambio.
- **Barquito:** funciona también en el 304 525 8750, así que el cambio de WhatsApp del punto 31
  no requiere reapuntar nada. Deja de ser un riesgo abierto.

## Pendientes de verificar

- **Destacados de la home** — decisión de producto pendiente (ver punto 9).
- **Slug de tipo `oficinas`** en el §6.1 — sin inventario que lo respalde (ver punto 10).
- **Lockup horizontal del logo.** El archivo entregado apila marca y palabra en un lienzo
  cuadrado, que a 74 px de alto de cabecera no sirve. Hoy la cabecera compone isotipo oficial +
  "inmobarco" escrito en Archivo, que **no** es la tipografía del logotipo oficial. Hace falta
  el lockup horizontal en vector limpio, o autorización para componerlo.
- **Imágenes estáticas sin fase asignada** — el manual no encarga a ninguna fase producir las
  fotos de las tiles de zona (§7.1, bloque 4) ni los logos de aliados (bloque 9). El mockup las
  resuelve con degradados CSS y texto.
- **§15.4, §15.5** — pendientes de Inmobarco (matrículas de arrendador, cifras reales, URL de
  Palomma en producción, tonos 700–950 contra el manual de marca).
