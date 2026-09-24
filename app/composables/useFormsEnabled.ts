import { formsArePublishable } from '#shared/data/legal-documents'

/**
 * ¿Se pinta el formulario?
 *
 * Regla de verdad: solo cuando la política de tratamiento y el aviso de
 * privacidad estén publicados (§13). La excepción es la previsualización en
 * desarrollo, para poder revisar el formulario mientras el texto legal no llega.
 *
 * `import.meta.dev` es falso en el build de producción, así que esa rama
 * desaparece del bundle: no es una puerta trasera, es andamio de desarrollo.
 */
export function useFormsEnabled(): boolean {
  if (formsArePublishable()) return true
  return import.meta.dev && useRuntimeConfig().public.formsPreview === true
}
