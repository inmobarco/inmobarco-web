import type { Property } from '#shared/types/property'
import type { WasiProperty } from '../../utils/wasi-types'
import { wasiRows } from '../../utils/wasi-types'
import { propertyTypeCatalog, searchProperties } from '../../utils/wasi'
import { toProperty, withPropertyType } from '../../utils/wasi-mappers'

/**
 * Destacados de la home (§7.1, bloque 5).
 *
 * Wasi tiene el concepto, pero el inventario de Inmobarco no lo usa: `featured`
 * vale 0 en los 125 inmuebles y `property/highlighted` devuelve total = 0. Hasta
 * que se marquen desde Wasi, "destacados" son los publicados más recientemente,
 * que es lo que un visitante espera ver arriba de todo.
 */
export default defineEventHandler(async (): Promise<Property[]> => {
  const response = await searchProperties({
    take: 8,
    short: 'true',
    order_by: 'created_at',
    order: 'desc',
  })

  const catalog = await propertyTypeCatalog()
  return wasiRows<WasiProperty>(response)
    .map(raw => withPropertyType(toProperty(raw), raw, catalog))
})
