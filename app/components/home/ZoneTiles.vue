<script setup lang="ts">
import type { ZoneCount } from '../../../server/api/properties/counts.get'

const { data: zones } = await useFetch<ZoneCount[]>('/api/properties/counts')

const { formatNumber } = useFormatters()

/**
 * Fachadas de degradado en vez de foto, como en el mockup. Inmobarco no ha
 * entregado fotos por municipio (el manual tampoco se las encarga a ninguna fase),
 * y es mejor un marcador honesto que una foto de banco de imágenes que no es del
 * sitio que dice ser.
 */
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
          <span
            class="absolute inset-0 -z-2 bg-linear-155"
            :class="facades[index % facades.length]"
          />
          <span
            class="absolute inset-0 -z-1 bg-linear-to-t from-ink/85 via-ink/20 to-transparent"
          />
          <span class="relative">
            <strong class="block font-display text-[1.05rem] font-bold">{{ zone.name }}</strong>
            <span data-numeric class="text-[0.8125rem] text-white/80">
              {{ formatNumber(zone.total) }} {{ zone.total === 1 ? 'inmueble' : 'inmuebles' }}
            </span>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
