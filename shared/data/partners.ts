export interface Partner {
  name: string
  /** Ruta bajo `public/`, cuando haya logo. Sin logo se pinta el nombre. */
  logo?: string
  url?: string
}

/**
 * Aliados de Inmobarco (manual §7.1, bloque 9).
 *
 * Vacío a propósito. El mockup trae nombres de relleno (AFFI, Seguros Bolívar,
 * Metrocuadrado…) que nadie ha confirmado, y el §16 prohíbe publicar nombres de
 * aliados inventados. Mientras la lista esté vacía, la sección no se pinta.
 */
export const PARTNERS: Partner[] = []
