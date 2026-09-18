import type {
  WasiProperty,
  WasiPropertyType,
  WasiPropertyTypeResponse,
  WasiSearchResponse,
} from './wasi-types'
import { wasiRows } from './wasi-types'

const WASI_BASE = 'https://api.wasi.co/v1'

/** Wasi corta cualquier `take` mayor que esto. Verificado: pedir 200 devuelve 100. */
export const WASI_MAX_TAKE = 100

export type WasiQuery = Record<string, string | number | boolean | undefined>

/**
 * Única puerta de salida hacia Wasi. Las credenciales salen de `runtimeConfig`
 * privado y no existen fuera del proceso de Nitro (manual §5.1).
 */
async function callWasi<T>(path: string, query: WasiQuery = {}): Promise<T> {
  const config = useRuntimeConfig()
  const { idCompany, token } = config.wasi

  if (!idCompany || !token) {
    console.error('[wasi] faltan NUXT_WASI_ID_COMPANY o NUXT_WASI_TOKEN')
    throw createError({ statusCode: 503, statusMessage: 'Wasi no está configurado' })
  }

  const params: WasiQuery = { id_company: idCompany, wasi_token: token }
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params[key] = value
  }

  try {
    return await $fetch<T>(`${WASI_BASE}/${path}`, {
      method: 'GET',
      query: params,
      headers: { Accept: 'application/json' },
      timeout: 10_000,
      retry: 1,
    })
  }
  catch (error) {
    // El token nunca entra en el log: solo la ruta y el motivo.
    console.error(`[wasi] fallo en ${path}:`, error instanceof Error ? error.message : error)
    throw createError({ statusCode: 503, statusMessage: 'Wasi no respondió' })
  }
}

/** Clave de caché estable: el orden de las propiedades del objeto no debe importar. */
function cacheKey(query: WasiQuery): string {
  return Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&') || 'all'
}

/**
 * Respuestas cacheadas: Wasi no recibe una llamada por visita (manual §5.2).
 * El caché es en memoria del proceso; con más de una réplica hay que apuntar
 * el storage de Nitro a Redis antes de escalar (§12).
 */
export const searchProperties = defineCachedFunction(
  async (query: WasiQuery): Promise<WasiSearchResponse> =>
    callWasi<WasiSearchResponse>('property/search', query),
  { maxAge: 900, name: 'wasi-search', getKey: cacheKey },
)

export const getProperty = defineCachedFunction(
  async (id: string): Promise<WasiProperty> =>
    callWasi<WasiProperty>(`property/get/${encodeURIComponent(id)}`),
  { maxAge: 3600, name: 'wasi-property', getKey: (id: string) => id },
)

export const getPropertyTypes = defineCachedFunction(
  async (): Promise<WasiPropertyTypeResponse> =>
    callWasi<WasiPropertyTypeResponse>('property-type/all'),
  { maxAge: 86_400, name: 'wasi-property-types', getKey: () => 'all' },
)

/** Catálogo `id_property_type -> nombre`, para no depender del título del inmueble. */
export async function propertyTypeCatalog(): Promise<Map<number, string>> {
  const catalog = new Map<number, string>()
  try {
    const response = await getPropertyTypes()
    for (const type of wasiRows<WasiPropertyType>(response)) {
      const name = type.name || type.nombre
      if (type.id_property_type && name) catalog.set(Number(type.id_property_type), name)
    }
  }
  catch {
    // El catálogo es un lujo: si falla, el mapper cae al tipo deducido del título.
    console.error('[wasi] no se pudo cargar property-type/all')
  }
  return catalog
}
