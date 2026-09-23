/** Datos de la empresa y páginas legales (manual §7.5, §8.2). */

export const COMPANY = {
  legalName: 'INMOBARCO INMOBILIARIA S.A.S.',
  nit: '901.559.457-0',
  address: 'Carrera 47B #17B Sur – 25, Local 102',
  addressDetail: 'Edificio Fuente Azul, Santa María de los Ángeles',
  city: 'Medellín, Antioquia',
  country: 'Colombia',
} as const

/** Una sola línea con la dirección completa, para schema.org y para el pie. */
export const FULL_ADDRESS = `${COMPANY.address}, ${COMPANY.addressDetail}, ${COMPANY.city}, ${COMPANY.country}`

export const OPENING_HOURS = {
  text: 'Lunes a viernes de 8:00 a. m. a 4:00 p. m. · Sábados de 8:00 a. m. a 12:00 m.',
  /** Formato de schema.org, por si se añade `openingHoursSpecification`. */
  schema: ['Mo-Fr 08:00-16:00', 'Sa 08:00-12:00'],
} as const

/**
 * Inmobarco atiende por dos canales distintos y **no hay que mezclarlos**:
 *
 * - `commercial` es el del negocio: arriendo, venta, visitas, consignación. Es el
 *   que ve el visitante en la cabecera, el pie, las fichas y los CTA, porque es
 *   para lo que existe esta página.
 * - `legal` es el administrativo: PQRS, habeas data, ejercicio de derechos sobre
 *   datos personales. Solo aparece en las páginas legales y en los trámites.
 *
 * El correo de mantenimiento se retiró de la interfaz por decisión de Inmobarco
 * (23-09-2026): las novedades entran por PQRS, que sí deja constancia.
 */
export const CONTACT = {
  commercial: {
    label: 'Comercial',
    phone: '+57 304 525 8750',
    phoneHref: 'tel:+573045258750',
    email: 'comercial@inmobarco.com',
  },
  legal: {
    label: 'Administrativo y legal',
    phone: '+57 302 315 7535',
    phoneHref: 'tel:+573023157535',
    email: 'administrativo@inmobarco.com',
  },
} as const

/**
 * Versión de la política de tratamiento de datos que se envía como evidencia de
 * consentimiento con cada formulario (§8.2). Coincide con la fecha del documento
 * vigente: sube cuando cambie el texto legal.
 */
export const DATA_POLICY_VERSION = '2026-01'

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
