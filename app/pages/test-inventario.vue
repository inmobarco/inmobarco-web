<script setup lang="ts">
import type { PropertyListResponse } from '#shared/types/property'

/**
 * Página de prueba de la fase 0: comprueba que el inventario real llega desde Wasi
 * a través de Nitro. Se retira al portar los listados de verdad.
 */
const { formatPrice, formatArea, formatNumber } = useFormatters()

const { data, error } = await useFetch<PropertyListResponse>('/api/properties', {
  query: { pageSize: 12 },
})

useSeoMeta({ title: 'Prueba de inventario', robots: 'noindex, nofollow' })
</script>

<template>
  <main class="mx-auto max-w-page px-4 py-16 md:px-6">
    <h1 class="text-2xl md:text-3xl">
      Prueba de inventario
    </h1>

    <p v-if="data" class="mt-2 text-muted">
      {{ formatNumber(data.total) }} inmuebles en Wasi · mostrando {{ data.items.length }}
    </p>

    <!-- Fallo de Wasi: estado vacío con salida por WhatsApp, nunca pantalla en blanco (§5.5). -->
    <div v-if="error" class="mt-8 rounded-lg border border-line bg-surface p-6">
      <h2 class="text-lg">
        No pudimos cargar el inventario en este momento
      </h2>
      <p class="mt-2 text-muted">
        Escríbenos y te ayudamos a encontrar lo que buscas.
      </p>
      <a
        href="https://wa.me/573023157535"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 font-medium text-ink"
      >
        Escribir por WhatsApp
        <span class="sr-only">(abre en una nueva pestaña)</span>
      </a>
    </div>

    <ul v-else class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <li
        v-for="property in data?.items"
        :key="property.id"
        class="overflow-hidden rounded-lg border border-line bg-white shadow-sm"
      >
        <NuxtImg
          v-if="property.images[0]"
          :src="property.images[0].url"
          :alt="property.images[0].alt"
          width="400"
          height="300"
          loading="lazy"
          class="h-48 w-full object-cover"
        />
        <div class="p-4">
          <p class="text-sm text-muted">
            {{ property.propertyType }} · {{ property.zone || property.city }}
          </p>
          <h2 class="mt-1 text-lg">
            {{ property.title }}
          </h2>
          <p data-numeric class="mt-2 text-lg font-semibold">
            {{ formatPrice(property.price.rent ?? property.price.sale) }}
            <span v-if="property.price.rent" class="text-sm font-normal text-muted">/ mes</span>
          </p>
          <p data-numeric class="mt-2 text-sm text-muted">
            {{ property.specs.bedrooms }} hab · {{ property.specs.bathrooms }} baños ·
            {{ formatArea(property.specs.areaM2) }}
          </p>
          <p class="mt-3 text-xs text-muted">
            Código {{ property.code }} · <code>{{ property.slug }}</code>
          </p>
        </div>
      </li>
    </ul>
  </main>
</template>
