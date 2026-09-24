import type { H3Event } from 'h3'
import { DATA_POLICY_VERSION } from '#shared/data/legal'

/**
 * Salida hacia n8n (manual §8.1).
 *
 * El sitio no envía correos ni sabe a quién le toca cada solicitud: empaqueta el
 * formulario con la evidencia de consentimiento y lo suelta en el webhook. Todo
 * el enrutamiento —correo, CRM, WhatsApp— vive en n8n.
 */

export type N8nFormKind = 'contact' | 'pqrs' | 'consign'

/** Cada formulario tiene su webhook: `…/webhook/web-contact`, `web-pqrs`, `web-consign`. */
function webhookUrl(kind: N8nFormKind): string {
  const base = useRuntimeConfig().n8nWebhookUrl
  if (!base) throw createError({ statusCode: 503, statusMessage: 'n8n no está configurado' })
  return `${base.replace(/\/+$/, '')}/web-${kind}`
}

/**
 * Evidencia de la autorización (§8.2). La Ley 1581 de 2012 exige consentimiento
 * previo, expreso e informado, y quien tiene que poder probarlo es Inmobarco:
 * por eso viaja con cada envío, no se queda solo en el navegador.
 */
function consentEvidence(event: H3Event) {
  return {
    accepted: true,
    policyVersion: DATA_POLICY_VERSION,
    acceptedAt: new Date().toISOString(),
    ip: getRequestIP(event, { xForwardedFor: true }) ?? null,
    userAgent: getRequestHeader(event, 'user-agent') ?? null,
  }
}

/**
 * Nota sobre radicados: el sitio **no** los genera. No tiene dónde guardar un
 * consecutivo —el caché de Nitro es memoria del proceso y se reinicia con el
 * contenedor—, y con más de una réplica dos procesos darían el mismo número.
 * Cuando llegue PQRS, el consecutivo lo asigna n8n, que sí tiene estado, y el
 * sitio muestra el que le devuelva.
 */

export async function sendToN8n(
  kind: N8nFormKind,
  payload: Record<string, unknown>,
  event: H3Event,
): Promise<void> {
  const url = webhookUrl(kind)

  try {
    await $fetch(url, {
      method: 'POST',
      body: {
        kind,
        submittedAt: new Date().toISOString(),
        data: payload,
        consent: consentEvidence(event),
      },
      timeout: 10_000,
      retry: 1,
    })
  }
  catch (error) {
    // Sin el mensaje crudo: si el webhook lleva token en la URL, no acaba en el log.
    console.error(`[n8n] no se pudo entregar el formulario ${kind}`,
      error instanceof Error ? error.name : 'error desconocido')
    throw createError({
      statusCode: 502,
      statusMessage: 'No pudimos enviar tu mensaje en este momento',
    })
  }
}

/**
 * Cloudflare Turnstile (§8.4).
 *
 * Mientras no haya `NUXT_TURNSTILE_SECRET_KEY` configurada, la verificación se
 * salta y **se avisa por consola en cada envío**. No es un descuido silencioso:
 * el formulario tampoco se publica sin las páginas legales, así que las dos
 * cosas llegan juntas.
 */
export async function verifyTurnstile(event: H3Event, token?: string): Promise<void> {
  const secret = useRuntimeConfig().turnstileSecretKey
  if (!secret) {
    console.warn('[turnstile] sin clave configurada: el envío pasó sin verificar')
    return
  }

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Falta la verificación antispam' })
  }

  const result = await $fetch<{ success: boolean }>(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: {
        secret,
        response: token,
        remoteip: getRequestIP(event, { xForwardedFor: true }),
      },
      timeout: 10_000,
    },
  ).catch(() => ({ success: false }))

  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: 'No pudimos verificar que eres una persona' })
  }
}
