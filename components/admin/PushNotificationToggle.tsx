'use client'
import { useEffect, useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type SupportState = 'checking' | 'unsupported' | 'default' | 'subscribed' | 'denied'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export function PushNotificationToggle() {
  const [state, setState] = useState<SupportState>('checking')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const check = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setState('unsupported')
        return
      }
      if (Notification.permission === 'denied') {
        setState('denied')
        return
      }
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        const existing = await registration.pushManager.getSubscription()
        setState(existing ? 'subscribed' : 'default')
      } catch (err) {
        console.error('[Push] Error registrando service worker:', err)
        setState('unsupported')
      }
    }
    check()
  }, [])

  const handleActivate = async () => {
    setBusy(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'default')
        return
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        console.error('[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY no configurada')
        return
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      })

      if (!res.ok) throw new Error('No se pudo guardar la suscripción')
      setState('subscribed')
    } catch (err) {
      console.error('[Push] Error activando notificaciones:', err)
    } finally {
      setBusy(false)
    }
  }

  if (state === 'checking') return null

  if (state === 'unsupported') {
    return (
      <p className="text-sm text-text-muted">
        Tu navegador no soporta notificaciones push. En iPhone: agrega esta página a tu pantalla de
        inicio primero (Compartir → Añadir a pantalla de inicio) y vuelve a intentar desde ahí.
      </p>
    )
  }

  if (state === 'denied') {
    return (
      <p className="text-sm text-red-400">
        Bloqueaste las notificaciones para este sitio. Actívalas desde la configuración de tu
        navegador.
      </p>
    )
  }

  if (state === 'subscribed') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <BellRing size={16} /> Notificaciones activadas en este dispositivo
      </div>
    )
  }

  return (
    <Button type="button" variant="secondary" size="sm" loading={busy} onClick={handleActivate}>
      <Bell size={16} className="mr-2" /> Activar notificaciones
    </Button>
  )
}
