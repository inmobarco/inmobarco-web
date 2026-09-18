import type { Property } from '#shared/types/property'
import type { WasiProperty } from '../../utils/wasi-types'
import { getProperty, propertyTypeCatalog } from '../../utils/wasi'
import { toProperty, withPropertyType } from '../../utils/wasi-mappers'

export default defineEventHandler(async (event): Promise<Property> => {
  const id = getRouterParam(event, 'id')

  if (!id || !/^\d+$/.test(id)) {
    throw createError({ statusCode: 404, statusMessage: 'Inmueble no encontrado' })
  }

  const raw = await getProperty(id) as WasiProperty

  // Wasi responde 200 con `status: 'error'` cuando el inmueble no existe.
  if (!raw?.id_property || raw.status === 'error') {
    throw createError({ statusCode: 404, statusMessage: 'Inmueble no encontrado' })
  }

  const catalog = await propertyTypeCatalog()
  return withPropertyType(toProperty(raw), raw, catalog)
})
