import { consignSchema } from '#shared/schemas/forms'
import { formsArePublishable } from '#shared/data/legal-documents'
import { findPropertyType, findZone } from '#shared/data/taxonomy'
import { sendToN8n, verifyTurnstile } from '../utils/n8n'

export interface ConsignResponse {
  ok: true
}

export default defineEventHandler(async (event): Promise<ConsignResponse> => {
  // Mismo candado del §13 que en contacto: la API es la que recibe los datos.
  const previewing = import.meta.dev && useRuntimeConfig().public.formsPreview === true

  if (!formsArePublishable() && !previewing) {
    throw createError({
      statusCode: 503,
      statusMessage: 'El formulario todavía no está habilitado',
    })
  }

  const body = await readValidatedBody(event, consignSchema.parse)

  // Honeypot: se responde como si todo hubiera ido bien y no se envía nada (§8.4).
  if (body.website) {
    return { ok: true }
  }

  await verifyTurnstile(event, body.captchaToken)

  /**
   * A n8n le llegan los slugs y también los nombres legibles. Sin esto, quien
   * lea el correo en Inmobarco tendría que traducir `la-estrella` de cabeza.
   */
  await sendToN8n('consign', {
    name: body.name,
    email: body.email,
    phone: body.phone,
    operation: body.operation,
    propertyType: body.propertyType,
    propertyTypeLabel: findPropertyType(body.propertyType)?.name ?? 'Otro',
    zone: body.zone,
    zoneLabel: findZone(body.zone)?.name ?? 'Otro municipio',
    expectedPrice: body.expectedPrice || null,
    message: body.message || null,
  }, event)

  return { ok: true }
})
