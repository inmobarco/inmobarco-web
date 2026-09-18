/** Formatos de Colombia: pesos sin decimales, áreas en m², separador de miles. */
const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const plain = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

export function useFormatters() {
  return {
    /** 2300000 -> "$ 2.300.000" */
    formatPrice: (value?: number): string => (value && value > 0 ? cop.format(value) : 'Consultar'),
    /** 63 -> "63 m²" */
    formatArea: (value?: number): string => (value && value > 0 ? `${plain.format(value)} m²` : '—'),
    formatNumber: (value: number): string => plain.format(value),
  }
}
