import tailwindcss from '@tailwindcss/vite'
import { LEGAL_DOCUMENTS } from './shared/data/legal-documents'
import { CONTENT_PAGES, FAQ } from './shared/data/pages'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxtjs/seo',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    'nuxt-security',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'es-CO' },
      link: [
        // El isotipo oficial es un PNG de dos tintas, así que no hay favicon en SVG:
        // se sirven mapas de bits en cada tamaño y el .ico como respaldo antiguo.
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  // Sin prefijo de carpeta: el componente de `components/ui/BaseButton.vue` se usa
  // como `<BaseButton>`, no como `<UiBaseButton>`.
  components: [{ path: '~/components', pathPrefix: false }],

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
  },

  // Credenciales de Wasi y n8n: privadas, nunca llegan al cliente (manual §5.1).
  runtimeConfig: {
    wasi: {
      idCompany: '',
      token: '',
    },
    n8nWebhookUrl: '',
    turnstileSecretKey: '',
    public: {
      siteUrl: '',
      turnstileSiteKey: '',
      gtagId: '',
      /**
       * Abre los formularios en desarrollo para poder revisarlos antes de que
       * exista el texto legal. **Solo funciona en `pnpm dev`**: en el build de
       * producción la condición se compila a falso, así que no hay forma de
       * saltarse el candado del §13 en el servidor real.
       *
       * Booleano, no cadena: Nuxt convierte solo el `"true"` de la variable de
       * entorno al tipo del valor por defecto.
       */
      formsPreview: false,
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://inmobarco.com',
    name: 'Inmobarco Inmobiliaria',
    description: 'Arrendamiento y administración de inmuebles en el Valle de Aburrá.',
    defaultLocale: 'es-CO',
  },

  // Wasi sirve imágenes desde dos hosts distintos: `url`/`url_big` en image.wasi.co
  // y `url_original` en images.wasi.co (verificado contra respuestas reales).
  image: {
    domains: ['image.wasi.co', 'images.wasi.co'],
    format: ['avif', 'webp'],
    screens: { sm: 640, md: 768, lg: 1024, xl: 1280 },
  },

  // OG images automáticas son fase 3 (§13). El módulo exige un renderer nativo
  // (@takumi-rs/core) que no vale la pena arrastrar hasta entonces.
  ogImage: {
    enabled: false,
  },

  // Las URL las arma el servidor a partir del diccionario y del inventario vivo.
  // Las páginas con contenido pendiente salen `noindex`, así que tampoco entran
  // al sitemap: pedirle a Google que rastree lo que no debe indexar es ruido.
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: [
      ...CONTENT_PAGES.filter(page => page.content.pending).map(page => page.path),
      ...(FAQ.page.pending ? ['/preguntas-frecuentes'] : []),
      ...LEGAL_DOCUMENTS.filter(document => document.status !== 'published').map(document => `/legal/${document.slug}`),
    ],
  },

  fonts: {
    defaults: {
      subsets: ['latin', 'latin-ext'],
      styles: ['normal'],
    },
    families: [
      // Archivo se declara a mano en app/assets/css/main.css, con el eje de ancho
      // que este módulo no sabe pedir. Aquí solo se le dice que no la toque.
      { name: 'Archivo', provider: 'none' },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
    ],
  },

  // Rate limiting se activa por ruta en los endpoints de formularios (§8.4),
  // no global: estrangularía la navegación.
  security: {
    rateLimiter: false,
  },

  routeRules: {
    // Antispam del §8.4: máximo 5 envíos por IP cada 10 minutos. Solo sobre los
    // endpoints de formulario; en global estrangularía la navegación.
    '/api/contact': {
      security: {
        rateLimiter: { tokensPerInterval: 5, interval: 600_000 },
      },
    },
    '/api/consign': {
      security: {
        rateLimiter: { tokensPerInterval: 5, interval: 600_000 },
      },
    },

    // Páginas de contenido: se generan en el build y se sirven como estáticas (§6.3).
    '/nosotros': { prerender: true },
    '/aliados': { prerender: true },
    '/contacto': { prerender: true },
    '/pqrs': { prerender: true },
    '/preguntas-frecuentes': { prerender: true },
    '/propietarios': { prerender: true },
    '/legal/**': { prerender: true },

    // El §6.3 pide prerender en la home, pero desde que muestra destacados y
    // contadores por municipio trae inventario vivo: congelarla en el build la
    // dejaría desactualizada hasta el siguiente despliegue, y obligaría a tener
    // las credenciales de Wasi en tiempo de build. Va con SWR como los listados.
    '/': { swr: 900 },
    '/arriendo/**': { swr: 900 },
    '/venta/**': { swr: 900 },
    '/inmueble/**': { swr: 3600 },
  },

  nitro: {
    preset: 'node-server',

    prerender: {
      // `/legal/**` en routeRules no basta: el prerenderizador necesita rutas
      // concretas, y estas salen de una ruta dinámica. Se derivan del mismo
      // diccionario que las pinta, para que no se puedan desincronizar.
      routes: LEGAL_DOCUMENTS.map(document => `/legal/${document.slug}`),
    },
  },
})
