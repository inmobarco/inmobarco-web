<script setup lang="ts">
const props = defineProps<{
  page: number
  pageCount: number
}>()

const route = useRoute()

/** La página 1 no lleva `?pagina=1`: así la URL canónica no tiene duplicado. */
function hrefFor(page: number) {
  const query = { ...route.query }
  if (page <= 1) delete query.pagina
  else query.pagina = String(page)
  return { path: route.path, query }
}

/**
 * Ventana de páginas: primera, última, la actual y sus vecinas. El `null` es el
 * hueco que se pinta como puntos suspensivos.
 */
const items = computed<(number | null)[]>(() => {
  const { page, pageCount } = props
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)

  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1])
  const sorted = [...pages].filter(p => p >= 1 && p <= pageCount).sort((a, b) => a - b)

  const withGaps: (number | null)[] = []
  let previous = 0
  for (const current of sorted) {
    if (previous && current - previous > 1) withGaps.push(null)
    withGaps.push(current)
    previous = current
  }
  return withGaps
})
</script>

<template>
  <!--
    Paginación numerada con enlaces reales, no scroll infinito: es lo que permite
    que Google recorra el inventario entero (§7.2).
  -->
  <nav v-if="pageCount > 1" class="mt-12 flex justify-center" aria-label="Paginación de resultados">
    <ul class="flex flex-wrap items-center gap-1.5">
      <li>
        <NuxtLink
          v-if="page > 1"
          :to="hrefFor(page - 1)"
          rel="prev"
          class="inline-flex h-10 items-center rounded-sm border border-line px-4 text-sm font-medium hover:border-ink"
        >
          Anterior
        </NuxtLink>
        <span
          v-else
          class="inline-flex h-10 items-center rounded-sm border border-line px-4 text-sm font-medium text-neutral-400"
        >Anterior</span>
      </li>

      <li v-for="(item, index) in items" :key="item ?? `hueco-${index}`">
        <span v-if="item === null" class="inline-flex h-10 w-6 items-center justify-center text-muted">…</span>
        <NuxtLink
          v-else-if="item !== page"
          :to="hrefFor(item)"
          data-numeric
          class="inline-flex h-10 min-w-10 items-center justify-center rounded-sm border border-line px-3 text-sm font-medium hover:border-ink"
        >
          {{ item }}
        </NuxtLink>
        <span
          v-else
          data-numeric
          aria-current="page"
          class="inline-flex h-10 min-w-10 items-center justify-center rounded-sm border border-ink bg-ink px-3 text-sm font-semibold text-white"
        >
          {{ item }}
        </span>
      </li>

      <li>
        <NuxtLink
          v-if="page < pageCount"
          :to="hrefFor(page + 1)"
          rel="next"
          class="inline-flex h-10 items-center rounded-sm border border-line px-4 text-sm font-medium hover:border-ink"
        >
          Siguiente
        </NuxtLink>
        <span
          v-else
          class="inline-flex h-10 items-center rounded-sm border border-line px-4 text-sm font-medium text-neutral-400"
        >Siguiente</span>
      </li>
    </ul>
  </nav>
</template>
