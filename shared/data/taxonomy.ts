/**
 * Diccionario de zonas y tipos (manual §6.1).
 *
 * Es la única fuente de las URL de listado: un slug que no esté aquí devuelve 404,
 * para no generar rutas indexables a partir de segmentos arbitrarios.
 *
 * Regla de indexación (§9.3): **solo se indexa lo que tiene copy propio escrito a
 * mano**. `listingCopy()` devuelve `null` para las combinaciones sin texto, y la
 * página las marca `noindex`. Así una combinación nueva no entra al índice hasta
 * que alguien le escriba su párrafo: nada de plantillas con la variable cambiada.
 */

import { BASE_COPY, COMBO_COPY, TYPE_COPY, ZONE_COPY } from './taxonomy-copy'

export type OperationSlug = 'arriendo' | 'venta'

export const OPERATION_SLUGS = {
  arriendo: 'rent',
  venta: 'sale',
} as const satisfies Record<OperationSlug, 'rent' | 'sale'>

export interface Zone {
  slug: string
  /** Como se escribe en pantalla, con tilde. */
  name: string
  idCity: number
}

export interface PropertyTypeTaxon {
  slug: string
  name: string
  plural: string
  idPropertyType: number
}

export interface ListingCopy {
  title: string
  description: string
  intro: string
}

/** Los cinco municipios donde Inmobarco tiene inventario hoy. */
export const ZONES: Zone[] = [
  { slug: 'sabaneta', name: 'Sabaneta', idCity: 698 },
  { slug: 'la-estrella', name: 'La Estrella', idCity: 416 },
  { slug: 'medellin', name: 'Medellín', idCity: 496 },
  { slug: 'itagui', name: 'Itagüí', idCity: 389 },
  { slug: 'envigado', name: 'Envigado', idCity: 291 },
]

/**
 * Tipos con inventario real. Oficinas queda fuera por ahora: el §6.1 la lista,
 * pero no hay ni una en Wasi y sería una página vacía indexable.
 */
export const PROPERTY_TYPES: PropertyTypeTaxon[] = [
  { slug: 'apartamentos', name: 'Apartamento', plural: 'Apartamentos', idPropertyType: 2 },
  { slug: 'casas', name: 'Casa', plural: 'Casas', idPropertyType: 1 },
  { slug: 'locales', name: 'Local', plural: 'Locales', idPropertyType: 3 },
  { slug: 'apartaestudios', name: 'Apartaestudio', plural: 'Apartaestudios', idPropertyType: 14 },
]

export function isOperationSlug(value: string): value is OperationSlug {
  return value === 'arriendo' || value === 'venta'
}

export function findZone(slug: string): Zone | undefined {
  return ZONES.find(zone => zone.slug === slug)
}

export function findPropertyType(slug: string): PropertyTypeTaxon | undefined {
  return PROPERTY_TYPES.find(type => type.slug === slug)
}

/**
 * Texto de la página de listado. `null` significa "sin copy propio": la ruta
 * funciona y muestra resultados, pero no se indexa.
 */
export function listingCopy(
  operation: OperationSlug,
  zoneSlug?: string,
  typeSlug?: string,
): ListingCopy | null {
  if (zoneSlug && typeSlug) return COMBO_COPY[`${operation}/${zoneSlug}/${typeSlug}`] ?? null
  if (zoneSlug) return ZONE_COPY[`${operation}/${zoneSlug}`] ?? null
  if (typeSlug) return TYPE_COPY[`${operation}/${typeSlug}`] ?? null
  return BASE_COPY[operation]
}

/** Rutas de listado con copy propio, que son las que entran al sitemap. */
export function indexableListingPaths(): string[] {
  const paths: string[] = []

  for (const operation of Object.keys(OPERATION_SLUGS) as OperationSlug[]) {
    paths.push(`/${operation}`)

    for (const type of PROPERTY_TYPES) {
      if (listingCopy(operation, undefined, type.slug)) paths.push(`/${operation}/${type.slug}`)
    }

    for (const zone of ZONES) {
      if (listingCopy(operation, zone.slug)) paths.push(`/${operation}/${zone.slug}`)

      for (const type of PROPERTY_TYPES) {
        if (listingCopy(operation, zone.slug, type.slug)) {
          paths.push(`/${operation}/${zone.slug}/${type.slug}`)
        }
      }
    }
  }

  return paths
}
