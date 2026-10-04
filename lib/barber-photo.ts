import type { SupabaseClient } from '@supabase/supabase-js'
import { parsePhotoDataUrl } from '@/lib/admin-validation'

const BUCKET = 'barbers'

/** Nombre de archivo seguro a partir del nombre o id del barbero. */
export function photoBaseName(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'barbero'
  )
}

/**
 * Sube la foto al bucket `barbers` de Supabase y devuelve su URL pública.
 * Cada subida usa un nombre nuevo para que el navegador no muestre la
 * foto vieja guardada en caché.
 */
export async function uploadBarberPhoto(
  supabase: SupabaseClient,
  dataUrl: string,
  baseName: string
): Promise<{ url: string } | { error: string }> {
  const photo = parsePhotoDataUrl(dataUrl)
  if (!photo.ok) return { error: photo.error }

  // Si el bucket es privado, la URL "pública" da error y la foto sale rota.
  const { data: bucket } = await supabase.storage.getBucket(BUCKET)
  if (bucket && !bucket.public) {
    return { error: 'El almacenamiento de fotos no es público. Falta correr la migración de Supabase.' }
  }

  const fileName = `${photoBaseName(baseName)}-${Date.now()}.${photo.extension}`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, photo.buffer, { contentType: photo.contentType, upsert: true })

  if (error) return { error: `No se pudo subir la foto: ${error.message}` }

  return { url: supabase.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl }
}
