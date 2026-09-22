<script setup lang="ts">
import { whatsappLink } from '#shared/data/links'
import { ZONES } from '#shared/data/taxonomy'
import type { OperationSlug } from '#shared/data/taxonomy'

const props = withDefaults(defineProps<{
  /** `true` cuando Wasi falló, `false` cuando simplemente no hay resultados (§5.5). */
  unavailable?: boolean
  operation?: OperationSlug
  /** Municipio actual, para sugerir los demás. */
  zoneSlug?: string
  hasFilters?: boolean
}>(), {
  unavailable: false,
  operation: 'arriendo',
  zoneSlug: undefined,
  hasFilters: false,
})

const nearbyZones = computed(() => ZONES.filter(zone => zone.slug !== props.zoneSlug).slice(0, 4))
</script>

<template>
  <div class="rounded-lg border border-line bg-surface p-8 text-center">
    <template v-if="unavailable">
      <h2 class="text-xl">
        No pudimos cargar el inventario en este momento
      </h2>
      <p class="mx-auto mt-3 max-w-[52ch] text-muted">
        Es un problema nuestro, no tuyo. Escríbenos y te decimos de una vez qué hay disponible.
      </p>
    </template>

    <template v-else>
      <h2 class="text-xl">
        No hay inmuebles con esos criterios
      </h2>
      <p class="mx-auto mt-3 max-w-[52ch] text-muted">
        {{ hasFilters
          ? 'Prueba a soltar algún filtro, o mira lo disponible en municipios vecinos.'
          : 'Por ahora no tenemos nada publicado aquí. Mira los municipios vecinos o escríbenos y te avisamos cuando entre algo.' }}
      </p>
    </template>

    <div class="mt-6 flex flex-wrap justify-center gap-3">
      <BaseButton v-if="hasFilters && !unavailable" :to="`/${operation}`" variant="ghost">
        Limpiar filtros
      </BaseButton>
      <BaseButton :href="whatsappLink()">
        Escribir por WhatsApp
      </BaseButton>
    </div>

    <div v-if="!unavailable" class="mt-8 border-t border-line pt-6">
      <p class="text-sm font-semibold">
        Mira también en
      </p>
      <ul class="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
        <li v-for="zone in nearbyZones" :key="zone.slug">
          <NuxtLink
            :to="`/${operation}/${zone.slug}`"
            class="font-semibold text-primary-700 underline decoration-primary-200 decoration-2 underline-offset-4 hover:decoration-primary-700"
          >
            {{ zone.name }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
