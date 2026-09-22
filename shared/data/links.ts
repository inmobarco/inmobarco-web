/**
 * Enlaces externos del sitio (manual §6.2). Están centralizados para que no se
 * repitan sueltos por los componentes: siempre se abren en pestaña nueva y con
 * aviso para lectores de pantalla.
 */
/**
 * WhatsApp va al **número comercial** (`CONTACT.commercial`), confirmado por
 * Inmobarco el 22-09-2026: quien escribe desde el sitio pregunta por arriendos y
 * ventas, no por trámites.
 *
 * Esto desvía del §6.2, que fija `wa.me/573023157535` como CERRADO. Hay que
 * avisar a quien mantenga Barquito (Evolution API + n8n): el flujo que identifica
 * el inmueble por el código del mensaje (§14) tiene que escuchar en esta línea.
 */
export const EXTERNAL_LINKS = {
  payments: 'https://pagos.palomma.com/inmobarco/auth/login',
  clientArea: 'https://clientes.inmobarco.com',
  whatsapp: 'https://wa.me/573045258750',
} as const

/**
 * WhatsApp con mensaje prellenado. Cuando lleva el código del inmueble, el
 * ecosistema Barquito (Evolution API + n8n) sabe de qué propiedad se habla (§14).
 */
export function whatsappLink(code?: string): string {
  const message = code
    ? `Hola, me interesa el inmueble ${code}`
    : 'Hola, quiero información sobre sus inmuebles'
  return `${EXTERNAL_LINKS.whatsapp}?text=${encodeURIComponent(message)}`
}
