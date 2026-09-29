import { z } from 'zod'

/**
 * Esquemas de formulario, compartidos entre cliente y servidor (manual §8.1).
 *
 * El navegador valida con el mismo esquema con el que valida Nitro: si alguien
 * salta el formulario y golpea la API directamente, se encuentra las mismas
 * reglas.
 */

/** Teléfonos de Colombia: fijos de 7 dígitos y móviles de 10, con o sin +57. */
const phone = z.string()
  .trim()
  .min(7, 'Escribe un teléfono válido')
  .max(20, 'Escribe un teléfono válido')
  .refine((value) => {
    const digits = value.replace(/\D/g, '')
    return digits.length >= 7 && digits.length <= 13
  }, 'Escribe un teléfono válido')

const name = z.string()
  .trim()
  .min(2, 'Escribe tu nombre')
  .max(80, 'El nombre es demasiado largo')

const email = z.string()
  .trim()
  .max(120, 'El correo es demasiado largo')
  .pipe(z.email('Escribe un correo válido'))

/**
 * Autorización de datos (§8.2). Es `literal(true)`, no un booleano: un envío sin
 * el visto bueno no es un envío inválido que se corrige, es uno que no existe.
 * La Ley 1581 de 2012 exige consentimiento previo, expreso e informado.
 */
const consent = z.literal(true, 'Necesitamos tu autorización para poder contactarte')

/**
 * Campo trampa. Los bots rellenan todo lo que encuentran; una persona no lo ve.
 *
 * **Acepta cualquier valor a propósito.** Si lo rechazara aquí, la respuesta 400
 * le diría al bot qué campo lo delató y bastaría con dejarlo vacío la próxima
 * vez. Quien decide es el servidor: con el campo relleno responde «recibido» y
 * no entrega nada (§8.1).
 */
const honeypot = z.string().max(200).optional()

export const CONTACT_SUBJECTS = [
  { value: 'arriendo', label: 'Quiero arrendar un inmueble' },
  { value: 'venta', label: 'Quiero comprar un inmueble' },
  { value: 'propietario', label: 'Tengo un inmueble para entregar en administración' },
  { value: 'otro', label: 'Otro asunto' },
] as const

export const contactSchema = z.object({
  name,
  email,
  phone,
  subject: z.enum(
    CONTACT_SUBJECTS.map(item => item.value) as [string, ...string[]],
    'Elige el motivo de tu mensaje',
  ),
  message: z.string()
    .trim()
    .min(10, 'Cuéntanos un poco más')
    .max(2000, 'El mensaje es demasiado largo'),
  /** Código del inmueble, cuando se llega desde una ficha. */
  propertyCode: z.string().regex(/^\d{4,12}$/).optional().or(z.literal('')),
  consent,
  website: honeypot,
  captchaToken: z.string().optional(),
})

/** Un envío ya validado: aquí `consent` solo puede ser `true`. */
export type ContactForm = z.infer<typeof contactSchema>

// --- Consignación de inmueble (§8.3) ---

export const CONSIGN_OPERATIONS = [
  { value: 'arriendo', label: 'Para arrendar' },
  { value: 'venta', label: 'Para vender' },
  { value: 'ambas', label: 'Para arrendar o vender' },
] as const

export const consignSchema = z.object({
  name,
  email,
  phone,
  /** Qué quiere hacer el propietario con el inmueble. */
  operation: z.enum(
    CONSIGN_OPERATIONS.map(item => item.value) as [string, ...string[]],
    'Dinos qué quieres hacer con el inmueble',
  ),
  /** Slug de `PROPERTY_TYPES`, u `otro` para lo que no esté en la lista. */
  propertyType: z.string().trim().min(1, 'Elige el tipo de inmueble').max(40),
  /** Slug de `ZONES`, u `otro`. El detalle se pide en el mensaje. */
  zone: z.string().trim().min(1, 'Elige el municipio').max(40),
  /**
   * Canon o precio esperado, en pesos. Opcional a propósito: muchos propietarios
   * no lo tienen claro, y esta es la página que más convierte del sitio. Exigirlo
   * espanta a quien justamente necesita que le hagan el avalúo.
   */
  expectedPrice: z.coerce.number().int().positive().max(100_000_000_000).optional().or(z.literal('')),
  message: z.string().trim().max(2000, 'El mensaje es demasiado largo').optional().or(z.literal('')),
  consent,
  website: honeypot,
  captchaToken: z.string().optional(),
})

export type ConsignForm = z.infer<typeof consignSchema>

export interface ConsignFormDraft extends Omit<ConsignForm, 'consent' | 'expectedPrice'> {
  consent: boolean
  expectedPrice: string
}

export function emptyConsignForm(): ConsignFormDraft {
  return {
    name: '',
    email: '',
    phone: '',
    operation: 'arriendo',
    propertyType: '',
    zone: '',
    expectedPrice: '',
    message: '',
    consent: false,
    website: '',
  }
}

/**
 * Lo que el usuario está escribiendo. `consent` es booleano porque el checkbox
 * **nace sin marcar** (§8.2, CERRADO) y solo al marcarlo el borrador pasa a ser
 * un envío válido.
 */
export interface ContactFormDraft extends Omit<ContactForm, 'consent'> {
  consent: boolean
}

export function emptyContactForm(): ContactFormDraft {
  return {
    name: '',
    email: '',
    phone: '',
    subject: 'arriendo',
    message: '',
    propertyCode: '',
    consent: false,
    website: '',
  }
}

// --- Solicitud de mantenimiento ---

/**
 * Sustituye al formulario de PQRS del §8.3 (ver `docs/DECISIONS.md`, punto 48).
 * El canal legal de peticiones, quejas y reclamos sigue siendo el que publica la
 * política de tratamiento: correo, dirección y teléfono del área administrativa.
 * Esto es otra cosa —un trámite operativo de quien ya tiene contrato— y por eso
 * no dispara los plazos de la Ley 1581.
 */

/** Taxonomía operativa de Inmobarco. Cada categoría enruta a un proveedor distinto. */
export const MAINTENANCE_CATEGORIES = [
  { value: 'electrico', label: 'Eléctrico', subcategories: ['Corto circuito', 'Toma o interruptor dañado', 'Falla de iluminación', 'Breaker o taco disparado', 'Otro'] },
  { value: 'electrodomesticos', label: 'Electrodomésticos', subcategories: ['Nevera', 'Estufa', 'Lavadora', 'Calentador de agua', 'Otro'] },
  { value: 'filtraciones', label: 'Filtraciones', subcategories: ['Techo', 'Baño', 'Cocina', 'Fachada o muro exterior', 'Otro'] },
  { value: 'humedades', label: 'Humedades', subcategories: ['Pared', 'Techo', 'Piso', 'Otro'] },
  { value: 'otros', label: 'Otros', subcategories: [] },
] as const

export const MAINTENANCE_CLIENT_TYPES = [
  { value: 'arrendatario', label: 'Arrendatario' },
  { value: 'propietario', label: 'Propietario' },
] as const

export const MAINTENANCE_DAYS = [
  { value: 'lun', label: 'Lunes' },
  { value: 'mar', label: 'Martes' },
  { value: 'mie', label: 'Miércoles' },
  { value: 'jue', label: 'Jueves' },
  { value: 'vie', label: 'Viernes' },
  { value: 'sab', label: 'Sábado' },
] as const

export const MAINTENANCE_TIME_SLOTS = [
  { value: 'manana', label: 'En la mañana' },
  { value: 'tarde', label: 'En la tarde' },
  { value: 'cualquiera', label: 'A cualquier hora' },
] as const

/** Límites de los adjuntos. El servidor firma la subida contra estos mismos números. */
export const MAINTENANCE_UPLOAD = {
  image: {
    /** Antes de comprimir en el navegador; lo que se sube acaba pesando una fracción. */
    maxBytes: 12 * 1024 * 1024,
    maxFiles: 5,
    types: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  },
  video: {
    maxBytes: 100 * 1024 * 1024,
    maxFiles: 1,
    types: ['video/mp4', 'video/quicktime', 'video/webm'],
  },
} as const

export const ALL_UPLOAD_TYPES: string[] = [...MAINTENANCE_UPLOAD.image.types, ...MAINTENANCE_UPLOAD.video.types]

export function uploadKindFor(contentType: string): 'image' | 'video' | null {
  if ((MAINTENANCE_UPLOAD.image.types as readonly string[]).includes(contentType)) return 'image'
  if ((MAINTENANCE_UPLOAD.video.types as readonly string[]).includes(contentType)) return 'video'
  return null
}

/**
 * Un adjunto ya subido. El navegador lo sube **directo a R2** con una URL
 * firmada, así que al servidor solo le llega la referencia: los bytes nunca
 * pasan por Nitro ni por n8n.
 */
export const maintenanceAttachmentSchema = z.object({
  key: z.string().min(1).max(200),
  name: z.string().min(1).max(160),
  contentType: z.string().refine(value => ALL_UPLOAD_TYPES.includes(value), 'Formato no admitido'),
  size: z.number().int().positive().max(MAINTENANCE_UPLOAD.video.maxBytes),
})

export type MaintenanceAttachment = z.infer<typeof maintenanceAttachmentSchema>

const documentNumber = z.string()
  .trim()
  .min(5, 'Escribe tu número de documento')
  .max(20, 'El número de documento es demasiado largo')
  .refine(value => /^[\d.\-\s]+$/.test(value), 'El documento solo lleva números')

export const maintenanceSchema = z.object({
  /**
   * Agrupa los adjuntos de un mismo reporte. Lo genera el navegador porque los
   * archivos se suben antes de enviar el formulario, cuando todavía no existe
   * radicado: las evidencias caen en una carpeta con este identificador y n8n
   * las reubica bajo el radicado que asigne.
   */
  submissionId: z.uuid('Identificador de envío inválido'),
  name,
  documentNumber,
  email,
  phone,
  clientType: z.enum(
    MAINTENANCE_CLIENT_TYPES.map(item => item.value) as [string, ...string[]],
    'Dinos si eres arrendatario o propietario',
  ),

  /**
   * La dirección es obligatoria y torre/apartamento no: el inventario tiene
   * casas y locales, no solo unidades de conjunto. Pedir torre siempre dejaría
   * fuera a quien arrienda una casa.
   */
  propertyAddress: z.string().trim().min(5, 'Escribe la dirección del inmueble').max(160),
  tower: z.string().trim().max(40).optional().or(z.literal('')),
  unit: z.string().trim().max(40).optional().or(z.literal('')),

  category: z.enum(
    MAINTENANCE_CATEGORIES.map(item => item.value) as [string, ...string[]],
    'Elige la categoría de la falla',
  ),
  subcategory: z.string().trim().max(60).optional().or(z.literal('')),
  description: z.string()
    .trim()
    .min(15, 'Cuéntanos un poco más: qué pasa y desde cuándo')
    .max(2000, 'La descripción es demasiado larga'),

  attachments: z.array(maintenanceAttachmentSchema).max(6).default([]),

  availableDays: z.array(z.enum(MAINTENANCE_DAYS.map(item => item.value) as [string, ...string[]]))
    .min(1, 'Elige al menos un día en el que podamos visitarte'),
  timeSlot: z.enum(
    MAINTENANCE_TIME_SLOTS.map(item => item.value) as [string, ...string[]],
    'Dinos a qué hora te conviene',
  ),
  availabilityNotes: z.string().trim().max(500).optional().or(z.literal('')),

  /**
   * Dos autorizaciones distintas y las dos obligatorias: la de datos personales
   * (§8.2, Ley 1581) y la de ingreso del técnico a la vivienda. No se pueden
   * fundir en una sola casilla porque cubren cosas que no tienen nada que ver.
   */
  entryAuthorization: z.literal(true, 'Necesitamos tu autorización para que el técnico pueda entrar'),
  consent,

  website: honeypot,
  captchaToken: z.string().optional(),
})

export type MaintenanceForm = z.infer<typeof maintenanceSchema>

export interface MaintenanceFormDraft extends Omit<MaintenanceForm, 'consent' | 'entryAuthorization' | 'category'> {
  consent: boolean
  entryAuthorization: boolean
  /** Cadena libre en el borrador: nace vacío, sin categoría preseleccionada. */
  category: string
}

export function emptyMaintenanceForm(): MaintenanceFormDraft {
  return {
    submissionId: crypto.randomUUID(),
    name: '',
    documentNumber: '',
    email: '',
    phone: '',
    clientType: 'arrendatario',
    propertyAddress: '',
    tower: '',
    unit: '',
    category: '',
    subcategory: '',
    description: '',
    attachments: [],
    availableDays: [],
    timeSlot: 'cualquiera',
    availabilityNotes: '',
    entryAuthorization: false,
    consent: false,
    website: '',
  }
}

export function findMaintenanceCategory(value: string) {
  return MAINTENANCE_CATEGORIES.find(item => item.value === value)
}
