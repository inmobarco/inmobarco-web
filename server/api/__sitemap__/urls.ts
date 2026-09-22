import { indexableListingPaths } from '#shared/data/taxonomy'
import { propertyPath } from '#shared/utils/slug'
import type { WasiProperty } from '../../utils/wasi-types'
import { wasiRows } from '../../utils/wasi-types'
import { propertyTypeCatalog, searchPropertiesBulk, WASI_MAX_TAKE } from '../../utils/wasi'
import { toProperty, withPropertyType } from '../../utils/wasi-mappers'

interface SitemapUrl {
  loc: string
  lastmod?: string
  priority?: number
  changefreq?: 'daily' | 'weekly' | 'monthly'
}

/**
 * Fuente dinámica del sitemap (§9.1).
 *
 * Solo entran los listados con copy propio —los mismos que se marcan `index`—
 * y las fichas que existen ahora mismo en Wasi. Si la API falla, se devuelven
 * los listados: un sitemap corto es mejor que un 500.
 */
export default defineEventHandler(async (): Promise<SitemapUrl[]> => {
  const urls: SitemapUrl[] = indexableListingPaths().map(loc => ({
    loc,
    changefreq: 'daily',
    priority: loc.split('/').length === 2 ? 0.9 : 0.7,
  }))

  try {
    const catalog = await propertyTypeCatalog()

    for (let skip = 0; skip < 1000; skip += WASI_MAX_TAKE) {
      const response = await searchPropertiesBulk({ take: WASI_MAX_TAKE, skip, short: 'true' })
      const rows = wasiRows<WasiProperty>(response)

      for (const raw of rows) {
        const property = withPropertyType(toProperty(raw), raw, catalog)
        urls.push({
          loc: propertyPath(property),
          lastmod: property.updatedAt || undefined,
          changefreq: 'weekly',
          priority: 0.6,
        })
      }

      if (rows.length < WASI_MAX_TAKE) break
    }
  }
  catch {
    // Se avisa fuerte: el módulo de sitemap cachea la respuesta diez minutos, así
    // que un fallo aquí deja fuera del índice todas las fichas durante ese rato.
    console.error('[wasi] ATENCIÓN: el sitemap se generó SIN las fichas de inmueble')
  }

  return urls
})
