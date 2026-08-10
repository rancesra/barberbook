self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload = {}
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'BarberBook', body: event.data.text() }
  }

  const title = payload.title || 'BarberBook'
  const options = {
    body: payload.body || '',
    icon: '/logo.webp',
    badge: '/logo.webp',
    data: { url: payload.url || '/admin/reservas' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/admin/reservas'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(targetUrl)
    })
  )
})
