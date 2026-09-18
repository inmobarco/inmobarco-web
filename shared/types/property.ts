/**
 * Modelo propio de inmueble (manual §5.4).
 *
 * Los componentes nunca ven la respuesta cruda de Wasi: todo pasa por los mappers
 * de `server/utils/wasi-mappers.ts` y llega normalizado a esta forma.
 */
export interface PropertyImage {
  url: string
  alt: string
  width?: number
  height?: number
}

export interface PropertyPrice {
  rent?: number
  sale?: number
  currency: 'COP'
  adminIncluded: boolean
}

export interface PropertySpecs {
  bedrooms: number
  bathrooms: number
  garages: number
  areaM2: number
  stratum?: number
}

export type PropertyOperation = 'rent' | 'sale' | 'both'

export interface Property {
  id: string
  /** Ej. "apartamento-en-arriendo-envigado". Decorativo: el id manda. */
  slug: string
  title: string
  operation: PropertyOperation
  propertyType: string
  city: string
  zone: string
  address?: string
  price: PropertyPrice
  specs: PropertySpecs
  description: string
  features: string[]
  images: PropertyImage[]
  coords?: { lat: number, lng: number }
  /** `id_property`, el código que el usuario ve y cita por WhatsApp. */
  code: string
  updatedAt: string
}

/** Lo que devuelve `/api/properties`: página de resultados más su contexto. */
export interface PropertyListResponse {
  items: Property[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}
