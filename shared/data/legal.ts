/** Datos de la empresa y páginas legales (manual §7.5, §8.2). */

export const COMPANY = {
  legalName: 'INMOBARCO INMOBILIARIA S.A.S.',
  nit: '901.559.457-0',
  address: 'Carrera 42 N.° 5 Sur – 145, Oficina 11-109',
  city: 'Medellín, Antioquia',
  phone: '+57 302 315 7535',
  phoneHref: 'tel:+573023157535',
  email: 'administrativo@inmobarco.com',
  maintenanceEmail: 'mantenimiento@inmobarco.com',
} as const

/**
 * Versión de la política de tratamiento de datos que se envía como evidencia de
 * consentimiento con cada formulario (§8.2). Se sube al cambiar el texto legal.
 */
export const DATA_POLICY_VERSION = '2026-09'

export const LEGAL_PAGES = [
  { label: 'Política de tratamiento de datos', to: '/legal/tratamiento-de-datos' },
  { label: 'Aviso de privacidad', to: '/legal/aviso-de-privacidad' },
  { label: 'Términos y condiciones', to: '/legal/terminos-y-condiciones' },
  { label: 'Política de cookies', to: '/legal/politica-de-cookies' },
  { label: 'Habeas Data', to: '/legal/habeas-data' },
] as const

/**
 * Matrículas de arrendador por municipio.
 *
 * Pendientes de que Inmobarco las entregue (§15.3). Se deja vacío a propósito:
 * el footer no pinta la línea mientras no haya números reales, porque inventarlos
 * en un dato registral no es una opción.
 */
export const RENTAL_REGISTRATIONS: { city: string, number: string }[] = []
