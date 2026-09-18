/** Salud del contenedor. No toca Wasi a propósito (manual §12). */
export default defineEventHandler(() => ({
  ok: true,
  at: new Date().toISOString(),
}))
