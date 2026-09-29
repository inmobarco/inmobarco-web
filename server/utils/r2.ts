import { AwsClient } from 'aws4fetch'

/**
 * Almacenamiento de las evidencias de mantenimiento en Cloudflare R2.
 *
 * **Los bytes no pasan por aquí.** Este módulo solo firma una URL con la que el
 * navegador sube el archivo directo al bucket. La razón es de tamaño: un video
 * de celular de un minuto ronda los 100 MB, `nuxt-security` corta los cuerpos de
 * petición en 2 MB (8 MB si son multipart), y con una sola réplica proxear eso
 * bloquearía la atención del resto de visitas. n8n recibe solo la referencia.
 *
 * Las credenciales viven en `runtimeConfig` privado, igual que las de Wasi, y
 * nunca llegan al cliente: lo que se le entrega es una URL de un solo uso que
 * caduca en cinco minutos.
 */

/** Caducidad de la URL firmada. Suficiente para subir 100 MB con conexión lenta. */
const EXPIRES_IN_SECONDS = 300

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
}

export interface R2Settings {
  endpoint: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  /**
   * `auto` sirve para un bucket normal. Con endpoint de jurisdicción hay que
   * poner la jurisdicción (`eu`), o la firma no cuadra y R2 responde 403 sin
   * explicar por qué.
   */
  region: string
}

/** `null` mientras no estén las cuatro variables: el endpoint responde 503 y el formulario sigue sin adjuntos. */
export function r2Settings(): R2Settings | null {
  const { r2 } = useRuntimeConfig()
  if (!r2?.endpoint || !r2.bucket || !r2.accessKeyId || !r2.secretAccessKey) return null
  return r2 as R2Settings
}

/**
 * Todo lo que el sitio escribe cae bajo este prefijo, y solo bajo este.
 *
 * Queda **fuera** de `mantenimientos/` a propósito. Las dos carpetas necesitan
 * reglas de ciclo de vida muy distintas —la bandeja se vacía en un día, el
 * archivo vive años— y con prefijos anidados esas reglas se solapan: la regla
 * corta acabaría aplicándose también a lo archivado y borrando la evidencia de
 * todos los radicados sin que nadie se entere. Separadas no se pisan.
 */
export const INBOX_PREFIX = 'entrantes'

/**
 * Clave del objeto.
 *
 * **El sitio no puede archivar por radicado.** Los archivos se suben mientras el
 * usuario llena el formulario, y el radicado lo asigna n8n al recibir el envío,
 * que ocurre después. Así que aquí todo cae en una bandeja de entrada agrupada
 * por envío, y es n8n —que sí conoce el radicado— quien copia cada objeto a su
 * carpeta definitiva. La estructura de destino está en `docs/DEPLOY.md`.
 *
 * **No se usa el nombre del archivo del usuario**: se genera un UUID y la
 * extensión sale del tipo MIME ya validado, así que no hay forma de que un
 * nombre hostil se cuele en la ruta. El `submissionId` lo pone el navegador,
 * pero llega validado como UUID, que por su formato tampoco puede escaparse de
 * la carpeta. El nombre original viaja aparte en el JSON que va a n8n, donde es
 * un dato y no una ruta.
 */
export function buildObjectKey(submissionId: string, contentType: string): string {
  const extension = EXTENSIONS[contentType] ?? 'bin'
  return `${INBOX_PREFIX}/${submissionId}/${crypto.randomUUID()}.${extension}`
}

/**
 * Firma un PUT contra R2.
 *
 * `content-type` y `content-length` entran en la firma a propósito: el navegador
 * está obligado a enviar exactamente esos valores, así que la URL no sirve para
 * subir un archivo más grande ni de otro tipo que el declarado. Sin eso, el
 * límite de tamaño sería una declaración del cliente —es decir, ninguno— y la
 * URL firmada valdría para meter gigabytes en el bucket.
 *
 * Hace falta `allHeaders`: aws4fetch deja fuera de la firma `content-type` y
 * `content-length` salvo que se le pida lo contrario (están en su lista de
 * cabeceras no firmables), y sin esta bandera la URL sale con
 * `X-Amz-SignedHeaders=host` a secas.
 */
export async function presignUpload(key: string, contentType: string, size: number): Promise<string> {
  const settings = r2Settings()
  if (!settings) {
    throw createError({ statusCode: 503, statusMessage: 'Los adjuntos todavía no están habilitados' })
  }

  const client = new AwsClient({
    accessKeyId: settings.accessKeyId,
    secretAccessKey: settings.secretAccessKey,
    service: 's3',
    region: settings.region || 'auto',
  })

  const url = new URL(`${settings.endpoint.replace(/\/+$/, '')}/${settings.bucket}/${key}`)
  url.searchParams.set('X-Amz-Expires', String(EXPIRES_IN_SECONDS))

  const signed = await client.sign(url, {
    method: 'PUT',
    headers: {
      'content-type': contentType,
      'content-length': String(size),
    },
    aws: { signQuery: true, allHeaders: true },
  })

  return signed.url
}

export const UPLOAD_EXPIRES_IN_SECONDS = EXPIRES_IN_SECONDS
