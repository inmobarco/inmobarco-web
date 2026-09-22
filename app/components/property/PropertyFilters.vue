<script setup lang="ts">
import { PROPERTY_TYPES, ZONES } from '#shared/data/taxonomy'
import type { OperationSlug } from '#shared/data/taxonomy'

const props = defineProps<{
  operation: OperationSlug
  zoneSlug?: string
  typeSlug?: string
  total: number
}>()

const operation = computed(() => props.operation)
const { budget, sort, bedrooms, bathrooms, minArea, hasFilters, apply, clear } = usePropertyFilters(operation)
const { formatNumber } = useFormatters()

const router = useRouter()

const AREA_OPTIONS = [
  { value: '', label: 'Cualquiera' },
  { value: '40', label: 'Desde 40 m²' },
  { value: '60', label: 'Desde 60 m²' },
  { value: '80', label: 'Desde 80 m²' },
  { value: '100', label: 'Desde 100 m²' },
]

/**
 * Operación, zona y tipo no son query: son ruta. Cambiarlos navega a la página
 * que corresponde, que es la que está indexada.
 */
function pathFor(next: { operation?: string, zone?: string | undefined, type?: string | undefined }) {
  const parts = [next.operation ?? props.operation]
  const zone = 'zone' in next ? next.zone : props.zoneSlug
  const type = 'type' in next ? next.type : props.typeSlug
  if (zone) parts.push(zone)
  if (type) parts.push(type)
  return `/${parts.join('/')}`
}

function navigate(next: Parameters<typeof pathFor>[0]) {
  return router.push(pathFor(next))
}

/** Campos que viven en la query string. */
const valueFields = computed(() => [
  {
    key: 'presupuesto',
    label: props.operation === 'venta' ? 'Precio' : 'Presupuesto',
    current: budget.value?.value ?? '',
    options: BUDGET_RANGES[props.operation].map(range => ({ value: range.value, label: range.label })),
  },
  {
    key: 'habitaciones',
    label: 'Habitaciones',
    current: bedrooms.value ? String(bedrooms.value) : '',
    options: ROOM_OPTIONS,
  },
  {
    key: 'banos',
    label: 'Baños',
    current: bathrooms.value ? String(bathrooms.value) : '',
    options: ROOM_OPTIONS,
  },
  {
    key: 'areaMin',
    label: 'Área',
    current: minArea.value ? String(minArea.value) : '',
    options: AREA_OPTIONS,
  },
  {
    key: 'orden',
    label: 'Ordenar por',
    current: sort.value,
    options: SORT_OPTIONS,
  },
])

// --- Hoja inferior de móvil: los cambios se aplican al cerrar (§7.2) ---
const sheetOpen = ref(false)
const draft = ref<Record<string, string>>({})

watch(sheetOpen, (open) => {
  if (open) {
    draft.value = Object.fromEntries(valueFields.value.map(field => [field.key, field.current]))
  }
})

async function applyDraft() {
  await apply({ ...draft.value })
  sheetOpen.value = false
}

const activeCount = computed(() =>
  [budget.value, bedrooms.value, bathrooms.value, minArea.value].filter(Boolean).length,
)
</script>

<template>
  <section aria-label="Filtros de búsqueda" class="border-b border-line pb-6">
    <!-- Operación, zona y tipo: navegación, no filtro -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <BaseSelect
        label="Operación"
        :options="[{ value: 'arriendo', label: 'En arriendo' }, { value: 'venta', label: 'En venta' }]"
        :model-value="operation"
        @update:model-value="value => navigate({ operation: value })"
      />
      <BaseSelect
        label="Zona"
        placeholder="Todo el Valle de Aburrá"
        :options="ZONES.map(zone => ({ value: zone.slug, label: zone.name }))"
        :model-value="zoneSlug ?? ''"
        @update:model-value="value => navigate({ zone: value || undefined })"
      />
      <BaseSelect
        label="Tipo de inmueble"
        placeholder="Todos los tipos"
        :options="PROPERTY_TYPES.map(type => ({ value: type.slug, label: type.plural }))"
        :model-value="typeSlug ?? ''"
        @update:model-value="value => navigate({ type: value || undefined })"
      />
    </div>

    <!-- Escritorio: cada cambio se aplica al instante -->
    <div class="mt-3 hidden gap-3 lg:grid lg:grid-cols-5">
      <BaseSelect
        v-for="field in valueFields"
        :key="field.key"
        :label="field.label"
        :options="field.options"
        :model-value="field.current"
        @update:model-value="value => apply({ [field.key]: value })"
      />
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p data-numeric class="text-sm text-muted">
        {{ formatNumber(total) }} {{ total === 1 ? 'inmueble disponible' : 'inmuebles disponibles' }}
      </p>

      <div class="flex items-center gap-3">
        <BaseButton v-if="hasFilters" variant="link" @click="clear()">
          Limpiar filtros
        </BaseButton>

        <BaseButton variant="ghost" size="sm" class="lg:hidden" @click="sheetOpen = true">
          Filtrar<template v-if="activeCount"> ({{ activeCount }})</template>
        </BaseButton>
      </div>
    </div>

    <!-- Móvil: hoja inferior, se aplica al cerrar -->
    <BaseModal v-model:open="sheetOpen" title="Filtrar resultados">
      <div class="flex flex-col gap-4">
        <BaseSelect
          v-for="field in valueFields"
          :key="field.key"
          v-model="draft[field.key]"
          :label="field.label"
          :options="field.options"
        />
      </div>

      <div class="mt-6 flex flex-col gap-3">
        <BaseButton block @click="applyDraft()">
          Ver resultados
        </BaseButton>
        <BaseButton variant="ghost" block @click="clear(); sheetOpen = false">
          Limpiar filtros
        </BaseButton>
      </div>
    </BaseModal>
  </section>
</template>
