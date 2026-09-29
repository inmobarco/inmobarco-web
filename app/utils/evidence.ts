/**
 * Preparación y subida de las evidencias de mantenimiento.
 *
 * Todo ocurre en el navegador: las fotos se reducen antes de salir y el archivo
 * viaja directo a Cloudflare R2 con una URL que firmó el servidor. Ni Nitro ni
 * n8n ven los bytes.
 */

export interface PreparedFile {
  blob: Blob
  contentType: string
}

/**
 * Reduce una foto antes de subirla. Una cámara de celular entrega 4 o 5 MB por
 * imagen y para diagnosticar una gotera sobra muchísimo menos.
 *
 * Si algo falla —un HEIC que el navegador no sabe decodificar, por ejemplo— se
 * devuelve el archivo original en vez de perderlo: pesa más, pero llega.
 */
export async function compressImage(file: File, maxDimension = 1600, quality = 0.72): Promise<PreparedFile> {
  const original: PreparedFile = { blob: file, contentType: file.type }

  if (typeof createImageBitmap !== 'function') return original

  try {
    // `from-image` respeta la orientación EXIF: sin esto las fotos verticales
    // de iPhone llegan acostadas.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })

    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) return original

    context.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) return original

    // Si comprimir no ganó nada, se sube el original y no una recodificación peor.
    if (blob.size >= file.size) return original

    return { blob, contentType: 'image/jpeg' }
  }
  catch {
    return original
  }
}

/**
 * `PUT` contra la URL firmada, con progreso.
 *
 * Se usa XMLHttpRequest y no `fetch` por una sola razón: `fetch` no informa del
 * progreso de subida, y un video de 100 MB sin barra parece un formulario
 * colgado.
 *
 * El navegador pone `Content-Length` solo, con el tamaño real del cuerpo. Como
 * ese encabezado entra en la firma, una URL emitida para 3 MB no sirve para
 * subir 80.
 */
export function uploadWithProgress(
  url: string,
  blob: Blob,
  contentType: string,
  onProgress: (ratio: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PUT', url)
    request.setRequestHeader('Content-Type', contentType)

    request.upload.addEventListener('progress', (progress) => {
      if (progress.lengthComputable) onProgress(progress.loaded / progress.total)
    })

    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) resolve()
      else reject(new Error(`El almacenamiento respondió ${request.status}`))
    })

    request.addEventListener('error', () => reject(new Error('No pudimos conectar con el almacenamiento')))
    request.addEventListener('abort', () => reject(new Error('Subida cancelada')))

    request.send(blob)
  })
}

/** `2,4 MB`, para mostrarle al usuario por qué su video no cabe. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}
