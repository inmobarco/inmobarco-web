import { z } from 'zod'
import { ALL_UPLOAD_TYPES, MAINTENANCE_UPLOAD, uploadKindFor } from '#shared/schemas/forms'
import { formsArePublishable } from '#shared/data/legal-documents'
import { verifyTurnstile } from '../../utils/n8n'
import { buildObjectKey, presignUpload, r2Settings, UPLOAD_EXPIRES_IN_SECONDS } from '../../utils/r2'

export interface UploadUrlResponse {
  /** Clave del objeto en el bucket. Es lo que el formulario adjunta al envío. */
  key: string
  /** URL firmada de un solo uso. El navegador hace `PUT` contra ella con el archivo tal cual. */
  url: string
  expiresIn: number
}

const requestSchema = z.object({
  contentType: z.string().refine(value => ALL_UPLOAD_TYPES.includes(value), 'Formato no admitido'),
  size: z.number().int().positive(),
  captchaToken: z.string().optional(),
})

export default defineEventHandler(async (event): Promise<UploadUrlResponse> => {
  const previewing = import.meta.dev && useRuntimeConfig().public.formsPreview === true

  if (!formsArePublishable() && !previewing) {
    throw createError({ statusCode: 503, statusMessage: 'El formulario todavía no está habilitado' })
  }

  /**
   * Si no hay bucket configurado se dice aquí y no después de que el usuario
   * eligió el archivo y esperó la subida. El formulario lo interpreta y sigue
   * adelante sin adjuntos en vez de romperse.
   */
  if (!r2Settings()) {
    throw createError({ statusCode: 503, statusMessage: 'Los adjuntos todavía no están habilitados' })
  }

  const body = await readValidatedBody(event, requestSchema.parse)

  /**
   * Un endpoint que firma subidas es almacenamiento gratis para cualquiera que
   * lo encuentre. Lo que lo sujeta: el límite de peticiones por IP del
   * `routeRules`, Turnstile en cuanto existan las claves, el tamaño y el tipo
   * dentro de la propia firma, y la caducidad de cinco minutos.
   */
  await verifyTurnstile(event, body.captchaToken)

  const kind = uploadKindFor(body.contentType)
  if (!kind) {
    throw createError({ statusCode: 400, statusMessage: 'Formato no admitido' })
  }

  if (body.size > MAINTENANCE_UPLOAD[kind].maxBytes) {
    throw createError({ statusCode: 413, statusMessage: 'El archivo supera el tamaño permitido' })
  }

  const key = buildObjectKey(body.contentType)
  const url = await presignUpload(key, body.contentType, body.size)

  return { key, url, expiresIn: UPLOAD_EXPIRES_IN_SECONDS }
})
