<script setup lang="ts">
import type { Property, PropertyListResponse } from '#shared/types/property'
import { parsePropertyParam, propertyPath } from '#shared/utils/slug'
import { whatsappLink } from '#shared/data/links'

const route = useRoute()
const site = useSiteConfig()
const { formatArea, formatPrice } = useFormatters()

/** La URL es /inmueble/[slug]-[id]. Mandan los dígitos del final (§5.4). */
const parsed = parsePropertyParam(String(route.params.slug))
if (!parsed) {
  throw createError({ statusCode: 404, statusMessage: 'Inmueble no encontrado', fatal: true })
}

const { data: property, error } = await useFetch<Property>(`/api/properties/${parsed.id}`)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode === 404 ? 404 : 503,
    statusMessage: error.value.statusCode === 404
      ? 'Este inmueble ya no está disponible'
      : 'No pudimos cargar el inmueble',
    fatal: true,
  })
}

// Slug decorativo que no coincide: 301 al canónico, no dos URL con lo mismo.
if (property.value && parsed.slug !== property.value.slug) {
  await navigateTo(propertyPath(property.value), { redirectCode: 301, replace: true })
}

const item = computed(() => property.value!)

const operationLabel = computed(() => {
  const labels = { rent: 'En arriendo', sale: 'En venta', both: 'En arriendo o venta' }
  return labels[item.value.operation]
})

const keyFacts = computed(() => {
  const { specs } = item.value
  return [
    { label: specs.bedrooms === 1 ? 'Habitación' : 'Habitaciones', value: specs.bedrooms || '—' },
    { label: specs.bathrooms === 1 ? 'Baño' : 'Baños', value: specs.bathrooms || '—' },
    { label: specs.garages === 1 ? 'Parqueadero' : 'Parqueaderos', value: specs.garages || '—' },
    { label: 'Área', value: formatArea(specs.areaM2) },
    ...(specs.stratum ? [{ label: 'Estrato', value: specs.stratum }] : []),
  ]
})

const canonical = computed(() => `${site.url}${propertyPath(item.value)}`)

useSeoMeta({
  title: () => item.value.title,
  description: () => item.value.description.slice(0, 155) || undefined,
  ogTitle: () => item.value.title,
  ogImage: () => item.value.images[0]?.url,
  ogType: 'website',
})

useHead({ link: [{ rel: 'canonical', href: canonical }] })

const breadcrumbs = computed(() => {
  const operation = item.value.operation === 'sale' ? 'venta' : 'arriendo'
  return [
    { name: 'Inicio', item: '/' },
    { name: operation === 'venta' ? 'Venta' : 'Arriendo', item: `/${operation}` },
    { name: item.value.title, item: propertyPath(item.value) },
  ]
})

useSchemaOrg(computed(() => [
  defineBreadcrumb({ itemListElement: breadcrumbs.value }),
  {
    '@type': 'RealEstateListing',
    'name': item.value.title,
    'description': item.value.description,
    'url': canonical.value,
    'image': item.value.images.slice(0, 8).map(image => image.url),
    'datePosted': item.value.updatedAt,
    'offers': {
      '@type': 'Offer',
      'price': item.value.price.rent ?? item.value.price.sale ?? undefined,
      'priceCurrency': 'COP',
      'availability': 'https://schema.org/InStock',
    },
    'about': {
      '@type': item.value.propertyType === 'Casa' ? 'House' : 'Apartment',
      'numberOfRooms': item.value.specs.bedrooms,
      'numberOfBathroomsTotal': item.value.specs.bathrooms,
      'floorSize': {
        '@type': 'QuantitativeValue',
        'value': item.value.specs.areaM2,
        'unitCode': 'MTK',
      },
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': item.value.city,
        'addressRegion': 'Antioquia',
        'addressCountry': 'CO',
      },
    },
  },
]))

/** Relacionados: mismo municipio y mismo tipo, sin repetir el que se está viendo. */
const { data: related } = await useFetch<PropertyListResponse>('/api/properties', {
  query: computed(() => ({
    operation: item.value.operation === 'sale' ? 'sale' : 'rent',
    pageSize: 8,
  })),
})

const relatedItems = computed(() =>
  (related.value?.items ?? [])
    .filter(other => other.id !== item.value.id && other.city === item.value.city)
    .slice(0, 4),
)
</script>

<template>
  <main class="mx-auto max-w-page px-4 py-8 md:px-6">
    <nav aria-label="Ruta de navegación" class="text-sm text-muted">
      <ol class="flex flex-wrap items-center gap-2">
        <li v-for="(crumb, index) in breadcrumbs" :key="crumb.item" class="flex items-center gap-2">
          <NuxtLink v-if="index < breadcrumbs.length - 1" :to="crumb.item" class="hover:text-ink">
            {{ crumb.name }}
          </NuxtLink>
          <span v-else class="truncate" aria-current="page">{{ crumb.name }}</span>
          <span v-if="index < breadcrumbs.length - 1" aria-hidden="true">/</span>
        </li>
      </ol>
    </nav>

    <div class="mt-6 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <div>
        <PropertyGallery :images="item.images" :title="item.title" />

        <header class="mt-8">
          <div class="flex flex-wrap items-center gap-2">
            <BaseBadge tone="primary">
              {{ operationLabel }}
            </BaseBadge>
            <BaseBadge>{{ item.propertyType }}</BaseBadge>
          </div>

          <h1 class="mt-3 text-2xl md:text-3xl">
            {{ item.title }}
          </h1>
          <p class="mt-2 text-muted">
            {{ item.zone ? `${item.zone}, ${item.city}` : item.city }}
            <template v-if="item.address"> · {{ item.address }}</template>
          </p>

          <p data-numeric class="mt-4 font-display text-[2rem] font-bold tracking-[-0.02em] lg:hidden">
            {{ formatPrice(item.price.rent ?? item.price.sale) }}
          </p>
        </header>

        <dl data-numeric class="mt-8 grid grid-cols-2 gap-4 rounded-lg border border-line p-6 sm:grid-cols-3 lg:grid-cols-5">
          <div v-for="fact in keyFacts" :key="fact.label">
            <dt class="text-xs font-semibold text-muted">
              {{ fact.label }}
            </dt>
            <dd class="mt-1 text-lg font-semibold">
              {{ fact.value }}
            </dd>
          </div>
        </dl>

        <section v-if="item.description" class="mt-10">
          <h2 class="text-xl">
            Sobre este inmueble
          </h2>
          <div class="mt-4 max-w-[68ch] space-y-4 text-muted">
            <p v-for="(paragraph, index) in item.description.split('\n\n')" :key="index">
              {{ paragraph }}
            </p>
          </div>
        </section>

        <section v-if="item.features.length" class="mt-10">
          <h2 class="text-xl">
            Características
          </h2>
          <ul class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="feature in item.features" :key="feature" class="flex items-center gap-2 text-muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="flex-none text-secondary" aria-hidden="true">
                <path d="M4 12l5 5 11-11" />
              </svg>
              {{ feature }}
            </li>
          </ul>
        </section>
      </div>

      <PropertyContactPanel :property="item" />
    </div>

    <section v-if="relatedItems.length" class="mt-16">
      <h2 class="text-xl">
        Otros inmuebles en {{ item.city }}
      </h2>
      <ul class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <li v-for="other in relatedItems" :key="other.id">
          <PropertyCard :property="other" />
        </li>
      </ul>
    </section>

    <p class="mt-16 rounded-lg bg-surface p-6 text-center text-muted">
      ¿Quieres verlo en persona?
      <a
        :href="whatsappLink(item.code)"
        target="_blank"
        rel="noopener noreferrer"
        class="font-semibold text-primary-700 underline decoration-primary-200 decoration-2 underline-offset-4 hover:decoration-primary-700"
      >
        Escríbenos por WhatsApp
        <span class="sr-only">(abre en una nueva pestaña)</span>
      </a>
      y coordinamos la visita.
    </p>
  </main>
</template>
