import type { PropertyListResponse } from '#shared/types/property'
import { propertyQuerySchema } from '#shared/schemas/property-query'
import type { PropertyQuery } from '#shared/schemas/property-query'
import type { WasiProperty } from '../utils/wasi-types'
import { wasiRows } from '../utils/wasi-types'
import type { WasiQuery } from '../utils/wasi'
import { propertyTypeCatalog, searchProperties, WASI_MAX_TAKE } from '../utils/wasi'
import { toProperty, withPropertyType } from '../utils/wasi-mappers'

/** Traduce nuestros filtros a los parámetros reales de `property/search`. */
function toWasiQuery(query: PropertyQuery): WasiQuery {
  const pageSize = Math.min(query.pageSize, WASI_MAX_TAKE)
  const forSale = query.operation === 'sale'

  // `order_by` acepta nombres de campo de Wasi; "price" a secas se ignora en silencio.
  const priceField = forSale ? 'sale_price' : 'rent_price'
  const order: Record<string, WasiQuery> = {
    recent: { order_by: 'created_at', order: 'desc' },
    price_asc: { order_by: priceField, order: 'asc' },
    price_desc: { order_by: priceField, order: 'desc' },
  }

  return {
    take: pageSize,
    skip: (query.page - 1) * pageSize,
    // Los listados no necesitan galerías ni características completas (§5.3).
    short: 'true',
    for_rent: query.operation === 'rent' ? 'true' : undefined,
    for_sale: forSale ? 'true' : undefined,
    id_city: query.city,
    // El inventario no usa `id_location` (viene en 0 en todos los inmuebles):
    // la zona real de Wasi es `id_zone`.
    id_zone: query.zone,
    id_property_type: query.type,
    min_price: query.minPrice,
    max_price: query.maxPrice,
    bedrooms: query.bedrooms,
    bathrooms: query.bathrooms,
    min_area: query.minArea,
    max_area: query.maxArea,
    ...order[query.sort],
  }
}

export default defineEventHandler(async (event): Promise<PropertyListResponse> => {
  const query = await getValidatedQuery(event, propertyQuerySchema.parse)
  const response = await searchProperties(toWasiQuery(query))

  const catalog = await propertyTypeCatalog()
  const items = wasiRows<WasiProperty>(response)
    .map(raw => withPropertyType(toProperty(raw), raw, catalog))

  const total = Number(response.total ?? 0)
  const pageSize = Math.min(query.pageSize, WASI_MAX_TAKE)

  return {
    items,
    total,
    page: query.page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  }
})
