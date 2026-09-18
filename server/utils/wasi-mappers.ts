import type { Property, PropertyImage, PropertyOperation } from '#shared/types/property'
import { propertySlug } from '#shared/utils/slug'
import type { WasiFeature, WasiImage, WasiProperty } from './wasi-types'

/** Wasi manda los números como string ("2300000", "63"). */
function num(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : 0
}

/** Y los booleanos también ("true" / "false"). */
function bool(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1'
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Las observaciones llegan casi siempre como texto plano, pero Wasi permite HTML
 * en ese campo, así que se limpia antes de que llegue a un componente.
 */
function plainText(value: unknown): string {
  return text(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Wasi devuelve fechas sin zona ("2026-09-18 08:57:20") en hora de Colombia.
 * Sin el desfase explícito, el servidor las interpretaría como UTC y cada ficha
 * se mostraría cinco horas movida.
 */
function toIsoDate(value: unknown): string {
  const raw = text(value)
  if (!raw) return ''
  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})/.exec(raw)
  if (!match) return ''
  return `${match[1]}T${match[2]}-05:00`
}

function toOperation(raw: WasiProperty): PropertyOperation {
  const rent = bool(raw.for_rent)
  const sale = bool(raw.for_sale)
  if (rent && sale) return 'both'
  return sale ? 'sale' : 'rent'
}

/**
 * Las galerías vienen como objetos con las imágenes bajo claves numéricas, junto
 * a un `id` que hay que saltarse. Se usa `url_big` porque es el original servible;
 * el recorte por tamaño lo hace `@nuxt/image` con IPX.
 */
function toImages(raw: WasiProperty, title: string): PropertyImage[] {
  const collected: { position: number, url: string, description: string }[] = []

  for (const gallery of raw.galleries ?? []) {
    for (const [key, value] of Object.entries(gallery)) {
      if (!/^\d+$/.test(key)) continue
      const image = value as WasiImage
      const url = text(image?.url_big) || text(image?.url)
      if (!url) continue
      collected.push({
        position: num(image.position),
        url,
        description: text(image.description),
      })
    }
  }

  collected.sort((a, b) => a.position - b.position)

  // En los listados se pide `short=true`, que no trae galerías: queda la portada.
  if (!collected.length) {
    const cover = text(raw.main_image?.url_big) || text(raw.main_image?.url)
    if (cover) collected.push({ position: 0, url: cover, description: '' })
  }

  return collected.map((image, index) => ({
    url: image.url,
    alt: image.description || `${title} — foto ${index + 1} de ${collected.length}`,
  }))
}

function toFeatures(raw: WasiProperty): string[] {
  const list = [...(raw.features?.internal ?? []), ...(raw.features?.external ?? [])]
  const names = list.map((feature: WasiFeature) => text(feature.nombre) || text(feature.name))
  return [...new Set(names.filter(Boolean))]
}

function toCoords(raw: WasiProperty): { lat: number, lng: number } | undefined {
  let lat = num(raw.latitude)
  let lng = num(raw.longitude)

  if (!lat || !lng) {
    const [mapLat, mapLng] = text(raw.map).split(',')
    lat = num(mapLat)
    lng = num(mapLng)
  }

  if (!lat || !lng) return undefined
  return { lat, lng }
}

/**
 * WasiProperty -> Property. Único punto donde se toca la forma cruda de Wasi
 * (manual §5.4): ningún componente recibe nunca el objeto original.
 */
export function toProperty(raw: WasiProperty): Property {
  const id = String(raw.id_property)
  const title = text(raw.title) || 'Inmueble'
  const operation = toOperation(raw)
  const city = text(raw.city_label)
  const zone = text(raw.zone_label)
  const propertyType = propertyTypeFromTitle(title)
  const rent = num(raw.rent_price)
  const sale = num(raw.sale_price)

  return {
    id,
    slug: propertySlug({ propertyType, operation, city, zone }),
    title,
    operation,
    propertyType,
    city,
    zone,
    address: text(raw.address) || undefined,
    price: {
      rent: rent > 0 ? rent : undefined,
      sale: sale > 0 ? sale : undefined,
      currency: 'COP',
      // Wasi no registra la cuota de administración: `maintenance_fee` viene en 0
      // en todo el inventario. No se afirma que esté incluida sin dato que lo respalde.
      adminIncluded: false,
    },
    specs: {
      bedrooms: num(raw.bedrooms),
      bathrooms: num(raw.bathrooms),
      garages: num(raw.garages),
      areaM2: num(raw.area) || num(raw.built_area),
      stratum: num(raw.stratum) || undefined,
    },
    description: plainText(raw.observations),
    features: toFeatures(raw),
    images: toImages(raw, title),
    coords: toCoords(raw),
    code: id,
    updatedAt: toIsoDate(raw.updated_at) || toIsoDate(raw.created_at),
  }
}

/**
 * Wasi no devuelve el nombre del tipo en `property/search`, solo `id_property_type`.
 * El título sí empieza siempre por él ("Apartamento en Camino Verde, Envigado"),
 * pero eso es frágil: `withPropertyTypes` lo corrige con el catálogo real.
 */
function propertyTypeFromTitle(title: string): string {
  return text(title.split(' en ')[0]) || 'Inmueble'
}

/** Sustituye el tipo adivinado por el del catálogo de Wasi (`property-type/all`). */
export function withPropertyType(property: Property, raw: WasiProperty, catalog: Map<number, string>): Property {
  const name = catalog.get(num(raw.id_property_type))
  if (!name || name === property.propertyType) return property

  const operation = property.operation
  return {
    ...property,
    propertyType: name,
    slug: propertySlug({ propertyType: name, operation, city: property.city, zone: property.zone }),
  }
}
