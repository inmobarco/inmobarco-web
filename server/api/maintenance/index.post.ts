import { z } from 'zod'
import { findMaintenanceCategory, maintenanceSchema, MAINTENANCE_CLIENT_TYPES, MAINTENANCE_DAYS, MAINTENANCE_TIME_SLOTS } from '#shared/schemas/forms'
import { formsArePublishable } from '#shared/data/legal-documents'
import { sendToN8n, verifyTurnstile } from '../../utils/n8n'

export interface MaintenanceResponse {
  ok: true
  /**
   * El radicado que asignó n8n. `null` cuando el webhook no devuelve ninguno:
   * la solicitud quedó entregada igual y el formulario lo dice así en pantalla,
   * en vez de inventarse un número que nadie podría rastrear.
   */
  ticket: string | null
}

/** Lo que se espera de vuelta del webhook `web-maintenance`. */
const webhookResponseSchema = z.object({
  ticket: z.string().trim().min(1).max(40),
}).partial()

function label<T extends { value: string, label: string }>(list: readonly T[], value: string): string {
  return list.find(item => item.value === value)?.label ?? value
}

export default defineEventHandler(async (event): Promise<MaintenanceResponse> => {
  // Mismo candado del §13 que en los demás formularios: la API es la que recibe los datos.
  const previewing = import.meta.dev && useRuntimeConfig().public.formsPreview === true

  if (!formsArePublishable() && !previewing) {
    throw createError({
      statusCode: 503,
      statusMessage: 'El formulario todavía no está habilitado',
    })
  }

  const body = await readValidatedBody(event, maintenanceSchema.parse)

  // Honeypot: se responde como si todo hubiera ido bien y no se envía nada (§8.4).
  if (body.website) {
    return { ok: true, ticket: null }
  }

  await verifyTurnstile(event, body.captchaToken)

  /**
   * A n8n le llegan los códigos y también las etiquetas legibles: quien atienda
   * el reporte no tiene que traducir `electrodomesticos` ni `mie` de cabeza.
   *
   * Los adjuntos van como referencias al objeto en R2, no como archivos. n8n
   * firma la URL de lectura cuando arma el correo.
   */
  const response = await sendToN8n('maintenance', {
    name: body.name,
    documentNumber: body.documentNumber,
    email: body.email,
    phone: body.phone,
    clientType: body.clientType,
    clientTypeLabel: label(MAINTENANCE_CLIENT_TYPES, body.clientType),

    propertyAddress: body.propertyAddress,
    tower: body.tower || null,
    unit: body.unit || null,

    category: body.category,
    categoryLabel: findMaintenanceCategory(body.category)?.label ?? body.category,
    subcategory: body.subcategory || null,
    description: body.description,

    attachments: body.attachments,
    attachmentCount: body.attachments.length,

    availableDays: body.availableDays,
    availableDaysLabels: body.availableDays.map(day => label(MAINTENANCE_DAYS, day)),
    timeSlot: body.timeSlot,
    timeSlotLabel: label(MAINTENANCE_TIME_SLOTS, body.timeSlot),
    availabilityNotes: body.availabilityNotes || null,

    entryAuthorization: true,
  }, event)

  // El webhook puede devolver cualquier cosa, incluso una cadena vacía. Si no
  // trae radicado no es un fallo: el reporte ya quedó entregado.
  const parsed = webhookResponseSchema.safeParse(response)

  return { ok: true, ticket: parsed.success ? parsed.data.ticket ?? null : null }
})
