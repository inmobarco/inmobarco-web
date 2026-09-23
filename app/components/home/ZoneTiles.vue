<script setup lang="ts">
import type { ZoneCount } from '../../../server/api/properties/counts.get'

/**
 * Se sigue consultando el conteo, pero ya no se muestra: sirve para no enlazar a
 * un municipio que hoy está sin inventario, que sería mandar a un listado vacío.
 */
const { data: zones } = await useFetch<ZoneCount[]>('/api/properties/counts')

/**
 * Imágenes de `app/assets/images/zonas/`, resueltas al construir. Basta con dejar
 * el archivo con el nombre del slug del municipio: aparece solo, sin tocar código.
 * El que no tenga foto cae al degradado de marca.
 */
const files = import.meta.glob<string>(
  '../../assets/images/zonas/*.{jpg,jpeg,png,webp}',
  { eager: true, import: 'default', query: '?url' },
)

const zoneImages = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [
    path.split('/').pop()!.replace(/\.[^.]+$/, ''),
    url,
  ]),
)

const facades = [
  'from-primary-200 to-primary-500',
  'from-primary-300 to-primary-700',
  'from-primary-200 to-primary-800',
  'from-primary-100 to-primary',
  'from-surface to-primary-300',
  'from-primary-100 to-secondary',
]
</script>

<template>
  <section v-if="zones?.length" class="mx-auto max-w-page px-4 py-16 md:px-6 md:py-24">
    <div class="max-w-[52ch]">
      <h2 class="text-2xl md:text-3xl">
        Busca por zona
      </h2>
      <p class="mt-3 text-lg text-muted">
        Trabajamos el sur del valle y las zonas con mejor demanda de arriendo en Medellín.
      </p>
    </div>

    <ul class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <li v-for="(zone, index) in zones" :key="zone.slug">
        <NuxtLink
          :to="`/arriendo/${zone.slug}`"
          class="relative isolate flex aspect-3/4 items-end overflow-hidden rounded-lg p-4 text-white"
        >
          <img
            v-if="zoneImages[zone.slug]"
            :src="zoneImages[zone.slug]"
            alt=""
            aria-hidden="true"
            loading="lazy"
            class="absolute inset-0 -z-2 h-full w-full object-cover"
          >
          <span
            v-else
            class="absolute inset-0 -z-2 bg-linear-155"
            :class="facades[index % facades.length]"
          />

          <span class="absolute inset-0 -z-1 bg-linear-to-t from-ink/85 via-ink/25 to-transparent" />

          <strong class="relative font-display text-[1.05rem] font-bold">
            {{ zone.name }}
          </strong>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
