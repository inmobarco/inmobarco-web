import tailwindcss from '@tailwindcss/vite'

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
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/test-inventario'],
  },

  fonts: {
    defaults: {
      subsets: ['latin', 'latin-ext'],
      styles: ['normal'],
    },
    families: [
      { name: 'Archivo', provider: 'google', weights: ['400 700'] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
    ],
  },

  // Rate limiting se activa por ruta en los endpoints de formularios (§8.4),
  // no global: estrangularía la navegación.
  security: {
    rateLimiter: false,
  },

  // TODO: añadir `prerender: true` en /nosotros, /aliados, /contacto, /pqrs,
  // /preguntas-frecuentes, /propietarios y /legal/** a medida que existan las páginas
  // (§6.3). Una regla de prerender sobre una ruta inexistente rompe el build.
  routeRules: {
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
  },
})
