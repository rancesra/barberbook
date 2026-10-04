/**
 * Achica una foto en el navegador y la devuelve como data URL lista para
 * subir. Las fotos del celular pesan varios MB; a 800 px pesan ~150 KB y se
 * ven igual de bien en la app.
 *
 * Intenta WebP; Safari en iPhone no sabe exportar WebP desde un canvas, así
 * que ahí cae a JPEG.
 */
export function resizePhoto(file: File, maxSize = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = document.createElement('img')

    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)

      const webp = canvas.toDataURL('image/webp', 0.85)
      resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la foto'))
    }
    img.src = url
  })
}
