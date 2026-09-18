/**
 * Forma cruda de las respuestas de Wasi v1.
 *
 * Wasi devuelve casi todo como string, incluidos números y booleanos, y envuelve
 * las colecciones en un objeto con claves numéricas ("0", "1", …) junto a `total`
 * y `status`. Estos tipos describen eso tal cual; normalizarlo es trabajo de
 * `wasi-mappers.ts`.
 */

export interface WasiImage {
  id: number
  url: string
  url_big: string
  url_original: string
  filename?: string
  description?: string
  position: number | string
}

/** Una galería: `id` más las imágenes bajo claves numéricas. */
export type WasiGallery = Record<string, WasiImage | string | number>

export interface WasiFeature {
  id: number
  nombre: string
  name: string
}

export interface WasiProperty {
  id_property: string | number
  title: string
  observations?: string
  reference?: string
  for_rent: string
  for_sale: string
  rent_price: string | number
  sale_price: string | number
  rent_price_label?: string
  sale_price_label?: string
  maintenance_fee?: string | number
  id_property_type: string | number
  id_city: string | number
  city_label: string
  id_zone: string | number
  zone_label: string
  id_location: string | number
  location_label?: string
  region_label?: string
  address?: string
  bedrooms: string | number
  bathrooms: string | number
  garages: string | number
  area: string | number
  built_area?: string | number
  stratum?: string | number
  latitude?: string | number
  longitude?: string | number
  map?: string
  created_at?: string
  updated_at?: string
  main_image?: { url?: string, url_big?: string, url_original?: string }
  galleries?: WasiGallery[]
  features?: { internal?: WasiFeature[], external?: WasiFeature[] }
  status?: string
}

/** Colección de Wasi: filas bajo claves numéricas + metadatos. */
export type WasiCollection<T> = Record<string, T | string | number | undefined> & {
  total?: string | number
  status?: string
}

export type WasiSearchResponse = WasiCollection<WasiProperty>

export interface WasiPropertyType {
  id_property_type: number
  name: string
  nombre: string
}

export type WasiPropertyTypeResponse = WasiCollection<WasiPropertyType>

/** Extrae las filas de una colección de Wasi descartando `total` y `status`. */
export function wasiRows<T>(collection: WasiCollection<T>): T[] {
  return Object.entries(collection)
    .filter(([key]) => /^\d+$/.test(key))
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, value]) => value as T)
}
