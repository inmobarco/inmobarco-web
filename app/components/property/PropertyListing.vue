<script setup lang="ts">
import type { PropertyListResponse } from '#shared/types/property'
import { findPropertyType, findZone, listingCopy } from '#shared/data/taxonomy'
import type { OperationSlug } from '#shared/data/taxonomy'

const props = defineProps<{
  operation: OperationSlug
  zoneSlug?: string
  typeSlug?: string
}>()

const operation = computed(() => props.operation)
const zone = computed(() => (props.zoneSlug ? findZone(props.zoneSlug) : undefined))
const type = computed(() => (props.typeSlug ? findPropertyType(props.typeSlug) : undefined))

const copy = computed(() => listingCopy(props.operation, props.zoneSlug, props.typeSlug))

const { apiQuery, hasFilters, page } = usePropertyFilters(operation)

const query = computed(() => ({
  ...apiQuery.value,
  city: zone.value?.idCity,
  type: type.value?.idPropertyType,
}))

// La clave la deriva Nuxt de la URL y la query: con una fija, dos listados
// distintos se pisarían los datos al navegar entre ellos.
const { data, error } = await useFetch<PropertyListResponse>('/api/properties', { query })

const route = useRoute()
const site = useSiteConfig()

/** Encabezado visible: el copy propio si existe, si no uno descriptivo y neutro. */
const heading = computed(() => {
  if (copy.value) return copy.value.title
  const what = type.value?.plural ?? 'Inmuebles'
  const where = zone.value ? ` en ${zone.value.name}` : ' en el Valle de Aburrá'
  return `${what} en ${props.operation}${where}`
})

/**
 * Canónica: nunca lleva los filtros, para no indexar permutaciones (§7.2).
 * La paginación sí se conserva, porque cada página tiene resultados distintos y
 * es el camino por el que se recorre el inventario.
 */
const canonical = computed(() => {
  const path = page.value > 1 ? `${route.path}?pagina=${page.value}` : route.path
  return `${site.url}${path}`
})

const pageSuffix = computed(() => (page.value > 1 ? ` · Página ${page.value}` : ''))

/**
 * Se indexa solo si la página tiene copy propio **y** resultados que mostrar.
 * Sin copy sería contenido calcado (§9.3); sin resultados sería una página vacía.
 * `follow` en ambos casos: los enlaces del pie y los municipios vecinos sí valen.
 */
const indexable = computed(() => Boolean(copy.value) && (data.value?.total ?? 0) > 0)

useSeoMeta({
  title: () => `${copy.value?.title ?? heading.value}${pageSuffix.value}`,
  description: () => copy.value?.description ?? undefined,
  robots: () => (indexable.value ? 'index, follow' : 'noindex, follow'),
})

useHead({
  link: [{ rel: 'canonical', href: canonical }],
})

const breadcrumbs = computed(() => {
  const items = [
    { name: 'Inicio', item: '/' },
    { name: props.operation === 'venta' ? 'Venta' : 'Arriendo', item: `/${props.operation}` },
  ]
  if (zone.value) items.push({ name: zone.value.name, item: `/${props.operation}/${zone.value.slug}` })
  if (type.value) {
    items.push({
      name: type.value.plural,
      item: `/${props.operation}${zone.value ? `/${zone.value.slug}` : ''}/${type.value.slug}`,
    })
  }
  return items
})

useSchemaOrg(computed(() => [defineBreadcrumb({ itemListElement: breadcrumbs.value })]))
</script>

<template>
  <main class="mx-auto max-w-page px-4 py-10 md:px-6">
    <nav aria-label="Ruta de navegación" class="text-sm text-muted">
      <ol class="flex flex-wrap items-center gap-2">
        <li v-for="(crumb, index) in breadcrumbs" :key="crumb.item" class="flex items-center gap-2">
          <NuxtLink v-if="index < breadcrumbs.length - 1" :to="crumb.item" class="hover:text-ink">
            {{ crumb.name }}
          </NuxtLink>
          <span v-else aria-current="page">{{ crumb.name }}</span>
          <span v-if="index < breadcrumbs.length - 1" aria-hidden="true">/</span>
        </li>
      </ol>
    </nav>

    <header class="mt-6">
      <h1 class="text-2xl md:text-3xl">
        {{ heading }}
      </h1>
      <p v-if="copy" class="mt-4 max-w-[68ch] text-muted">
        {{ copy.intro }}
      </p>
    </header>

    <div class="mt-8">
      <PropertyFilters
        :operation="operation"
        :zone-slug="zoneSlug"
        :type-slug="typeSlug"
        :total="data?.total ?? 0"
      />
    </div>

    <PropertyEmptyState
      v-if="error"
      class="mt-8"
      unavailable
      :operation="operation"
      :zone-slug="zoneSlug"
    />

    <PropertyEmptyState
      v-else-if="!data?.items.length"
      class="mt-8"
      :operation="operation"
      :zone-slug="zoneSlug"
      :has-filters="hasFilters"
    />

    <template v-else>
      <ul class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <li v-for="(property, index) in data.items" :key="property.id">
          <PropertyCard :property="property" :eager="index === 0" />
        </li>
      </ul>

      <BasePagination :page="data.page" :page-count="data.pageCount" />
    </template>
  </main>
</template>
