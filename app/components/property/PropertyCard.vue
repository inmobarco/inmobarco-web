<script setup lang="ts">
import type { Property } from '#shared/types/property'
import { propertyPath } from '#shared/utils/slug'

const props = withDefaults(defineProps<{
  property: Property
  /** La primera tarjeta visible carga sin `lazy`, para no castigar el LCP (§9.4). */
  eager?: boolean
}>(), { eager: false })

const { formatPrice, formatArea } = useFormatters()

const price = computed(() => {
  const { rent, sale } = props.property.price
  if (rent) return { value: formatPrice(rent), suffix: 'al mes' }
  if (sale) return { value: formatPrice(sale), suffix: '' }
  return { value: 'Precio a consultar', suffix: '' }
})

const operationLabel = computed(() => {
  const labels = { rent: 'Arriendo', sale: 'Venta', both: 'Arriendo o venta' }
  return labels[props.property.operation]
})

const cover = computed(() => props.property.images[0])
</script>

<template>
  <article
    class="group flex flex-col overflow-hidden rounded-lg border border-line bg-white transition-colors hover:border-ink"
  >
    <NuxtLink :to="propertyPath(property)" class="flex flex-1 flex-col">
      <div class="relative aspect-4/3 overflow-hidden bg-surface">
        <NuxtImg
          v-if="cover"
          :src="cover.url"
          :alt="cover.alt"
          width="480"
          height="360"
          sizes="sm:100vw md:50vw lg:33vw xl:25vw"
          :loading="eager ? 'eager' : 'lazy'"
          :fetchpriority="eager ? 'high' : undefined"
          class="h-full w-full object-cover"
        />
        <span
          v-else
          class="flex h-full w-full items-center justify-center text-sm text-muted"
        >Sin foto disponible</span>

        <span
          class="absolute top-3 left-3 inline-flex h-[26px] items-center rounded-full bg-white px-2.5 text-xs font-semibold text-ink shadow-sm"
        >
          {{ operationLabel }}
        </span>
      </div>

      <div class="flex flex-1 flex-col gap-2.5 p-[18px]">
        <p data-numeric class="font-display text-[1.45rem] font-bold tracking-[-0.02em]">
          {{ price.value }}
          <small v-if="price.suffix" class="font-sans text-[0.8125rem] font-medium tracking-normal text-muted">
            {{ price.suffix }}
          </small>
        </p>

        <h3 class="font-sans text-base leading-snug font-semibold tracking-normal">
          {{ property.title }}
        </h3>

        <p class="text-sm text-muted">
          {{ property.zone ? `${property.zone}, ${property.city}` : property.city }}
        </p>

        <ul data-numeric class="mt-auto flex gap-4 border-t border-neutral-100 pt-3.5 text-[0.8125rem] text-muted">
          <li v-if="property.specs.bedrooms" class="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-none text-secondary" aria-hidden="true">
              <path d="M3 18v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 18h18M3 18v2M21 18v2M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
            </svg>
            {{ property.specs.bedrooms }}
            <span class="sr-only">habitaciones</span>
          </li>
          <li v-if="property.specs.bathrooms" class="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-none text-secondary" aria-hidden="true">
              <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM7 12V6a2 2 0 0 1 4 0" />
            </svg>
            {{ property.specs.bathrooms }}
            <span class="sr-only">baños</span>
          </li>
          <li v-if="property.specs.areaM2" class="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-none text-secondary" aria-hidden="true">
              <path d="M4 4h16v16H4zM4 9h5M15 4v5M15 15h5M9 15v5" />
            </svg>
            {{ formatArea(property.specs.areaM2) }}
          </li>
        </ul>
      </div>
    </NuxtLink>

    <p class="flex items-center justify-between border-t border-neutral-100 bg-surface px-[18px] py-3 text-xs text-muted">
      <span data-numeric>Código {{ property.code }}</span>
      <span v-if="property.specs.stratum" data-numeric>Estrato {{ property.specs.stratum }}</span>
    </p>
  </article>
</template>
