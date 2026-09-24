import { contactSchema } from '#shared/schemas/forms'
import { formsArePublishable } from '#shared/data/legal-documents'
import { sendToN8n, verifyTurnstile } from '../utils/n8n'

export interface ContactResponse {
  ok: true
}

export default defineEventHandler(async (event): Promise<ContactResponse> => {
  /**
   * Candado del §13: ningún formulario entra en producción antes de que estén
   * publicadas la política de tratamiento y el aviso de privacidad. Se comprueba
   * también aquí, no solo en la vista: la API es la que recibe los datos.
   */
  const previewing = import.meta.dev && useRuntimeConfig().public.formsPreview === true

  if (!formsArePublishable() && !previewing) {
    throw createError({
      statusCode: 503,
      statusMessage: 'El formulario todavía no está habilitado',
    })
  }

  const body = await readValidatedBody(event, contactSchema.parse)

  // Honeypot: se responde como si todo hubiera ido bien y no se envía nada (§8.4).
  if (body.website) {
    return { ok: true }
  }

  await verifyTurnstile(event, body.captchaToken)

  await sendToN8n('contact', {
    name: body.name,
    email: body.email,
    phone: body.phone,
    subject: body.subject,
    message: body.message,
    propertyCode: body.propertyCode || null,
  }, event)

  return { ok: true }
})
