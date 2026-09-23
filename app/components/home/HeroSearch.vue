<script setup lang="ts">
import { PROPERTY_TYPES, ZONES } from '#shared/data/taxonomy'
import type { OperationSlug } from '#shared/data/taxonomy'

const router = useRouter()

const operation = ref<OperationSlug>('arriendo')
const zone = ref('')
const type = ref('')
const budget = ref('')

// El presupuesto cambia de escala al pasar de arriendo a venta.
watch(operation, () => { budget.value = '' })

const budgetOptions = computed(() =>
  BUDGET_RANGES[operation.value].map(range => ({ value: range.value, label: range.label })),
)

/**
 * La búsqueda no es una query: lleva a la ruta indexada que corresponde, que es
 * la misma a la que llegaría alguien desde Google.
 */
function search() {
  const parts: string[] = [operation.value]
  if (zone.value) parts.push(zone.value)
  if (type.value) parts.push(type.value)

  return router.push({
    path: `/${parts.join('/')}`,
    query: budget.value ? { presupuesto: budget.value } : {},
  })
}
</script>

<template>
  <section class="relative overflow-hidden bg-ink">
    <!--
      Foto a sangre. Es el LCP de la home, así que va con `preload` y
      `fetchpriority="high"` (§9.4). `hero-home.jpg` es el recorte de
      `banner.jpeg` sin la banda de marca: el logo ya está en la cabecera.
    -->
    <NuxtImg
      src="/hero-home.jpg"
      alt=""
      aria-hidden="true"
      width="1600"
      height="900"
      sizes="sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw"
      preload
      fetchpriority="high"
      class="absolute inset-0 h-full w-full object-cover"
    />

    <!-- Velo: sin él, el titular blanco se pierde sobre las zonas claras de la foto -->
    <div class="absolute inset-0 bg-linear-to-r from-ink/90 via-ink/70 to-ink/40" />

    <div class="relative z-2 mx-auto max-w-page px-4 pt-16 md:px-6 md:pt-20">
      <div class="max-w-[640px]">
        <h1 class="text-[clamp(2.2rem,5.2vw,3.9rem)] text-white">
          Encuentra dónde vivir en el Valle de Aburrá
        </h1>
        <p class="mt-5 max-w-[48ch] text-lg text-white/85">
          Apartamentos, casas y locales que administramos directamente. Cada inmueble lo visita
          y verifica nuestro equipo antes de publicarlo.
        </p>
      </div>

      <div class="h-32 md:h-44" />

      <!-- Panel blanco flotando sobre el borde inferior del hero (§7.1, bloque 3) -->
      <form
        class="relative z-3 -mb-11 rounded-lg bg-white p-[18px] shadow-lg"
        @submit.prevent="search"
      >
        <div role="group" aria-label="Tipo de operación" class="mb-4 flex gap-1">
          <button
            v-for="option in (['arriendo', 'venta'] as OperationSlug[])"
            :key="option"
            type="button"
            :aria-pressed="operation === option"
            class="h-[34px] rounded-full border px-[18px] text-sm font-semibold transition-colors"
            :class="operation === option
              ? 'border-ink bg-ink text-white'
              : 'border-line bg-white text-ink hover:border-ink'"
            @click="operation = option"
          >
            {{ option === 'arriendo' ? 'Arriendo' : 'Venta' }}
          </button>
        </div>

        <div class="grid grid-cols-1 items-end gap-3 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_auto]">
          <BaseSelect
            v-model="zone"
            label="Zona"
            placeholder="Todo el Valle de Aburrá"
            :options="ZONES.map(item => ({ value: item.slug, label: item.name }))"
          />
          <BaseSelect
            v-model="type"
            label="Tipo de inmueble"
            placeholder="Todos los tipos"
            :options="PROPERTY_TYPES.map(item => ({ value: item.slug, label: item.plural }))"
          />
          <BaseSelect
            v-model="budget"
            :label="operation === 'venta' ? 'Precio' : 'Presupuesto'"
            :options="budgetOptions"
          />
          <BaseButton type="submit" size="lg">
            Buscar
          </BaseButton>
        </div>
      </form>
    </div>

    <div class="h-28" />
  </section>
</template>
