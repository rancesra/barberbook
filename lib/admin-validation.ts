import { z } from 'zod'

// Reglas de lo que el panel admin puede guardar. Viven aparte de las rutas
// para poder probarlas sin servidor ni base de datos (ver tests/).

/** Texto opcional: se recorta y, si queda vacío, se guarda como null. */
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label}: máximo ${max} caracteres`)
    .nullish()
    .transform((value) => (value ? value : null))

export const announcementSchema = z
  .object({
    announcement_text: optionalText(500, 'El aviso'),
    announcement_active: z.boolean(),
  })
  .refine((v) => !v.announcement_active || v.announcement_text !== null, {
    message: 'Escribe el texto del aviso antes de activarlo',
    path: ['announcement_text'],
  })

export const barbershopSettingsSchema = z.object({
  name: z.string().trim().min(1, 'La barbería necesita un nombre').max(255),
  description: optionalText(1000, 'La descripción'),
  whatsapp: optionalText(30, 'El WhatsApp'),
  instagram: optionalText(100, 'El Instagram'),
  address: optionalText(500, 'La dirección'),
  google_maps_url: optionalText(1000, 'El link de Google Maps'),
})

/** 99 cortes al mes = ilimitados (así lo leen la página y las suscripciones). */
export const UNLIMITED_CUTS = 99

export const planSchema = z.object({
  name: z.string().trim().min(1, 'El plan necesita un nombre').max(60, 'El nombre: máximo 60 caracteres'),
  subtitle: optionalText(100, 'La frase corta'),
  price: z.coerce
    .number({ invalid_type_error: 'El precio debe ser un número' })
    .int('El precio va sin decimales')
    .min(1, 'Pon un precio mayor a 0')
    .max(100_000_000, 'El precio es demasiado alto'),
  cuts_per_month: z.coerce
    .number({ invalid_type_error: 'Los cortes deben ser un número' })
    .int('Los cortes van sin decimales')
    .min(1, 'Mínimo 1 corte al mes')
    .max(UNLIMITED_CUTS, 'Para más de 98 cortes, activa "Ilimitados"'),
  benefits: z
    .array(z.string().trim().max(120, 'Cada beneficio: máximo 120 caracteres'))
    .max(30, 'Máximo 30 beneficios')
    .transform((list) => list.filter(Boolean)),
  is_popular: z.boolean(),
  badge_text: optionalText(30, 'La etiqueta'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido'),
  is_active: z.boolean(),
})

export type PlanInput = z.infer<typeof planSchema>

export const planOrderSchema = z.object({
  order: z.array(z.string().uuid()).min(1),
})

export const barberUpdateSchema = z.object({
  name: z.string().trim().min(1, 'El barbero necesita un nombre').max(255),
  specialty: optionalText(255, 'La especialidad'),
  description: optionalText(1000, 'La descripción'),
  phone: optionalText(30, 'El teléfono'),
  sort_order: z.coerce.number().int().min(0, 'El orden no puede ser negativo').max(999),
  is_active: z.boolean(),
  photoBase64: z.string().nullish(),
})

/** Mensaje legible del primer error de validación. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Datos inválidos'
}

// ── Fotos ──────────────────────────────────────────────────────────────

const PHOTO_EXTENSIONS: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

export const MAX_PHOTO_BYTES = 3 * 1024 * 1024

type ParsedPhoto =
  | { ok: true; buffer: Buffer; contentType: string; extension: string }
  | { ok: false; error: string }

/**
 * Convierte el data URL que manda el navegador en un archivo listo para subir.
 *
 * Acepta WebP, JPEG y PNG: Safari en iPhone no sabe exportar WebP desde un
 * canvas y entrega JPEG/PNG, y antes eso se subía como un WebP roto.
 */
export function parsePhotoDataUrl(dataUrl: string): ParsedPhoto {
  const match = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl)
  if (!match) return { ok: false, error: 'La foto no tiene un formato válido' }

  const [, contentType, base64] = match
  const extension = PHOTO_EXTENSIONS[contentType]
  if (!extension) return { ok: false, error: 'La foto debe ser JPG, PNG o WebP' }

  const buffer = Buffer.from(base64, 'base64')
  if (buffer.length === 0) return { ok: false, error: 'La foto está vacía' }
  if (buffer.length > MAX_PHOTO_BYTES) return { ok: false, error: 'La foto pesa más de 3 MB' }

  return { ok: true, buffer, contentType, extension }
}
