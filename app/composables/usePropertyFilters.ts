import { PROPERTIES_PER_PAGE } from '#shared/schemas/property-query'
import type { PropertySort } from '#shared/schemas/property-query'
import type { OperationSlug } from '#shared/data/taxonomy'

/**
 * Filtros de listado (manual §7.2).
 *
 * Operación, zona y tipo son **ruta**, porque son las combinaciones que queremos
 * indexar. El ajuste fino (precio, habitaciones, baños, área, orden, página) va en
 * query string, y la canónica de la página apunta siempre a la ruta sin query.
 */

export type SortSlug = 'recientes' | 'precio-asc' | 'precio-desc'

const SORT_TO_API: Record<SortSlug, PropertySort> = {
  'recientes': 'recent',
  'precio-asc': 'price_asc',
  'precio-desc': 'price_desc',
}

export const SORT_OPTIONS: { value: SortSlug, label: string }[] = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio-asc', label: 'Precio: de menor a mayor' },
  { value: 'precio-desc', label: 'Precio: de mayor a menor' },
]

/** Rangos de presupuesto, distintos según se arriende o se compre. */
export const BUDGET_RANGES: Record<OperationSlug, { value: string, label: string, min?: number, max?: number }[]> = {
  arriendo: [
    { value: '', label: 'Cualquier canon' },
    { value: '0-1500000', label: 'Hasta $1.500.000', max: 1_500_000 },
    { value: '1500000-2500000', label: '$1.500.000 a $2.500.000', min: 1_500_000, max: 2_500_000 },
    { value: '2500000-3500000', label: '$2.500.000 a $3.500.000', min: 2_500_000, max: 3_500_000 },
    { value: '3500000-5000000', label: '$3.500.000 a $5.000.000', min: 3_500_000, max: 5_000_000 },
    { value: '5000000-', label: 'Más de $5.000.000', min: 5_000_000 },
  ],
  venta: [
    { value: '', label: 'Cualquier precio' },
    { value: '0-300000000', label: 'Hasta $300 millones', max: 300_000_000 },
    { value: '300000000-500000000', label: '$300 a $500 millones', min: 300_000_000, max: 500_000_000 },
    { value: '500000000-800000000', label: '$500 a $800 millones', min: 500_000_000, max: 800_000_000 },
    { value: '800000000-', label: 'Más de $800 millones', min: 800_000_000 },
  ],
}

export const ROOM_OPTIONS = [
  { value: '', label: 'Cualquiera' },
  { value: '1', label: '1 o más' },
  { value: '2', label: '2 o más' },
  { value: '3', label: '3 o más' },
  { value: '4', label: '4 o más' },
]

function firstValue(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '')
  return value == null ? '' : String(value)
}

function positiveInt(value: unknown): number | undefined {
  const parsed = Number.parseInt(firstValue(value), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export function usePropertyFilters(operation: Ref<OperationSlug> | ComputedRef<OperationSlug>) {
  const route = useRoute()
  const router = useRouter()

  const budget = computed(() => {
    const raw = firstValue(route.query.presupuesto)
    return BUDGET_RANGES[operation.value].find(range => range.value === raw && raw !== '')
  })

  const sort = computed<SortSlug>(() => {
    const raw = firstValue(route.query.orden)
    return raw in SORT_TO_API ? (raw as SortSlug) : 'recientes'
  })

  const page = computed(() => positiveInt(route.query.pagina) ?? 1)
  const bedrooms = computed(() => positiveInt(route.query.habitaciones))
  const bathrooms = computed(() => positiveInt(route.query.banos))
  const minArea = computed(() => positiveInt(route.query.areaMin))

  /** ¿Hay algún ajuste fino aplicado? Decide si se ofrece "Limpiar filtros". */
  const hasFilters = computed(() =>
    Boolean(budget.value || bedrooms.value || bathrooms.value || minArea.value),
  )

  /** Lo que se le manda a `/api/properties`. */
  const apiQuery = computed(() => ({
    operation: operation.value === 'venta' ? 'sale' : 'rent',
    minPrice: budget.value?.min,
    maxPrice: budget.value?.max,
    bedrooms: bedrooms.value,
    bathrooms: bathrooms.value,
    minArea: minArea.value,
    sort: SORT_TO_API[sort.value],
    page: page.value,
    pageSize: PROPERTIES_PER_PAGE,
  }))

  /** Cambiar un filtro devuelve siempre a la página 1: la 7 de otra búsqueda no existe. */
  function apply(changes: Record<string, string | number | undefined>) {
    const query: Record<string, string> = {}
    for (const [key, value] of Object.entries(route.query)) {
      const single = firstValue(value)
      if (single) query[key] = single
    }

    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === '') query[key] = ''
      else query[key] = String(value)
    }
    // Cualquier cambio de filtro vuelve a la página 1: la 7 de otra búsqueda no existe.
    query.pagina = ''

    const cleaned = Object.fromEntries(Object.entries(query).filter(([, value]) => value !== ''))

    return router.push({ path: route.path, query: cleaned })
  }

  function clear() {
    return router.push({ path: route.path })
  }

  return { budget, sort, page, bedrooms, bathrooms, minArea, hasFilters, apiQuery, apply, clear }
}
