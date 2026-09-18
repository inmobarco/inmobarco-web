import { z } from 'zod'

/** 12 por página: tres filas completas en la rejilla de 4 columnas (§4.5). */
export const PROPERTIES_PER_PAGE = 12

export const propertySortValues = ['recent', 'price_asc', 'price_desc'] as const
export type PropertySort = (typeof propertySortValues)[number]

/**
 * Filtros de listado. Se validan igual en el cliente y en el servidor (§8.1).
 * Las zonas y tipos llegan como id de Wasi; el diccionario slug -> id vive en
 * `shared/data/taxonomy.ts` y lo resuelven las páginas de listado.
 */
export const propertyQuerySchema = z.object({
  operation: z.enum(['rent', 'sale']).optional(),
  city: z.coerce.number().int().positive().optional(),
  zone: z.coerce.number().int().positive().optional(),
  type: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  /** Wasi los interpreta como mínimo, no como valor exacto (verificado). */
  bedrooms: z.coerce.number().int().min(1).max(10).optional(),
  bathrooms: z.coerce.number().int().min(1).max(10).optional(),
  minArea: z.coerce.number().int().positive().optional(),
  maxArea: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).max(200).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(PROPERTIES_PER_PAGE),
  sort: z.enum(propertySortValues).default('recent'),
})

export type PropertyQuery = z.infer<typeof propertyQuerySchema>
