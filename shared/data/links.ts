/**
 * Enlaces externos del sitio (manual §6.2). Están centralizados para que no se
 * repitan sueltos por los componentes: siempre se abren en pestaña nueva y con
 * aviso para lectores de pantalla.
 */
export const EXTERNAL_LINKS = {
  payments: 'https://pagos.palomma.com/inmobarco/auth/login',
  clientArea: 'https://clientes.inmobarco.com',
  whatsapp: 'https://wa.me/573023157535',
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
