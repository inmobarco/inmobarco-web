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
