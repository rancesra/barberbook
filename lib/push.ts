/**
 * Web Push — notificaciones push al navegador/celular del barbero/admin
 * Docs: https://github.com/web-push-libs/web-push
 *
 * Env vars needed:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY  → llave pública VAPID (también usada en el cliente)
 *   VAPID_PRIVATE_KEY             → llave privada VAPID
 *   VAPID_SUBJECT                 → "mailto:tu@correo.com"
 *
 * Generar las llaves una sola vez con: npx web-push generate-vapid-keys
 */
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/server'

interface PushPayload {
  title: string
  body: string
  url?: string
}

let vapidConfigured = false

function ensureVapid(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT

  if (!publicKey || !privateKey || !subject) {
    console.warn('[Push] VAPID keys no configuradas — se omite la notificación push')
    return false
  }

  if (!vapidConfigured) {
    webpush.setVapidDetails(subject, publicKey, privateKey)
    vapidConfigured = true
  }

  return true
}

export async function sendPushToAdmin(payload: PushPayload): Promise<void> {
  if (!ensureVapid()) return

  const supabase = createAdminClient()
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')

  if (error) {
    console.error('[Push] Error leyendo push_subscriptions:', error)
    return
  }

  if (!subscriptions || subscriptions.length === 0) return

  const body = JSON.stringify(payload)

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body
        )
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          // Suscripción caducada/inválida — se elimina para no reintentar en el futuro
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        } else {
          console.error('[Push] Error enviando a', sub.endpoint, err)
        }
      }
    })
  )
}
