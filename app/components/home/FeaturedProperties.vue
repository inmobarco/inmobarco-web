<script setup lang="ts">
import type { Property } from '#shared/types/property'

/**
 * "Destacados" son los publicados más recientemente: el inventario de Wasi no
 * marca ninguno como destacado (decisión del 21-09-2026, ver docs/DECISIONS.md).
 */
const { data: properties } = await useFetch<Property[]>('/api/properties/featured')
</script>

<template>
  <section v-if="properties?.length" class="bg-surface">
    <div class="mx-auto max-w-page px-4 py-16 md:px-6 md:py-24">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="max-w-[52ch]">
          <h2 class="text-2xl md:text-3xl">
            Lo último que entró
          </h2>
          <p class="mt-3 text-lg text-muted">
            Los inmuebles que acabamos de publicar, antes de que se muevan.
          </p>
        </div>
      </div>

      <ul class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <li v-for="property in properties.slice(0, 8)" :key="property.id">
          <PropertyCard :property="property" />
        </li>
      </ul>

      <div class="mt-11 flex justify-center">
        <BaseButton to="/arriendo" variant="ghost" size="lg">
          Ver todos los inmuebles disponibles
        </BaseButton>
      </div>
    </div>
  </section>
</template>
