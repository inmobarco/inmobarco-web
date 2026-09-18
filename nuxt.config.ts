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
    '/': { prerender: true },
    '/arriendo/**': { swr: 900 },
    '/venta/**': { swr: 900 },
    '/inmueble/**': { swr: 3600 },
  },

  nitro: {
    preset: 'node-server',
  },
})
