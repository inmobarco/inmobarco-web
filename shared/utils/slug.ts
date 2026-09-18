import type { PropertyOperation } from '../types/property'

/** Quita tildes, signos y espacios: "Camino Verde, Envigado" -> "camino-verde-envigado". */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Slug canónico de una ficha: "apartamento-en-arriendo-envigado" (manual §5.4).
 * Es decorativo — manda el id del final de la URL —, pero se mantiene estable
 * para que el 301 de slug incorrecto apunte siempre al mismo sitio.
 */
export function propertySlug(input: {
  propertyType: string
  operation: PropertyOperation
  city: string
  zone?: string
}): string {
  const operation = input.operation === 'sale' ? 'venta' : 'arriendo'
  const place = [input.zone, input.city].filter(Boolean).join(' ')
  return slugify(`${input.propertyType} en ${operation} ${place}`)
}

/**
 * Lee `/inmueble/[slug]-[id]`. El id son los dígitos finales; todo lo anterior
 * es el slug. Devuelve `null` si el parámetro no termina en un id numérico.
 */
export function parsePropertyParam(param: string): { slug: string, id: string } | null {
  const match = /^(.*?)-?(\d+)$/.exec(param)
  if (!match) return null
  const [, slug = '', id = ''] = match
  if (!id) return null
  return { slug, id }
}

/** URL canónica de la ficha. */
export function propertyPath(property: { slug: string, id: string }): string {
  return `/inmueble/${property.slug}-${property.id}`
}
