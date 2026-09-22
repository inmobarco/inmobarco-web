import { ZONES } from '#shared/data/taxonomy'
import { searchProperties } from '../../utils/wasi'

export interface ZoneCount {
  slug: string
  name: string
  total: number
}

/**
 * Cuántos inmuebles en arriendo hay por municipio, para los mosaicos de la home
 * (§7.1, bloque 4). Se pide `take=1` de cada ciudad: lo único que interesa es el
 * `total`, y las respuestas quedan cacheadas como cualquier otra búsqueda.
 */
export default defineEventHandler(async (): Promise<ZoneCount[]> => {
  const counts = await Promise.all(ZONES.map(async (zone) => {
    try {
      const response = await searchProperties({
        take: 1,
        short: 'true',
        for_rent: 'true',
        id_city: zone.idCity,
      })
      return { slug: zone.slug, name: zone.name, total: Number(response.total ?? 0) }
    }
    catch {
      // Un contador de menos no justifica tumbar la home.
      return { slug: zone.slug, name: zone.name, total: 0 }
    }
  }))

  return counts.filter(zone => zone.total > 0).sort((a, b) => b.total - a.total)
})
