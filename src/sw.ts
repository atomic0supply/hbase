/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute, type PrecacheEntry } from 'workbox-precaching'

// Module-scoped declaration shadows the ambient global, so it doesn't clash and
// keeps the literal `self.__WB_MANIFEST` token that Workbox needs to inject the manifest.
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: (PrecacheEntry | string)[]
}

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('install', () => {
  void self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

interface PushPayload {
  title: string
  body: string
  tag?: string
  url?: string
  badge?: number
}

self.addEventListener('push', (event) => {
  let data: PushPayload | null = null
  try {
    data = event.data?.json() as PushPayload
  } catch {
    const text = event.data?.text()
    if (text) data = { title: 'Reparto del Hogar', body: text }
  }
  if (!data || !data.title) return
  const payload = data

  const promises: Promise<unknown>[] = [
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: payload.url || '/' },
    }),
  ]

  // Update the home-screen icon badge when a count is provided.
  const badger = self.navigator as unknown as {
    setAppBadge?: (n?: number) => Promise<void>
    clearAppBadge?: () => Promise<void>
  }
  if (typeof payload.badge === 'number' && badger.setAppBadge && badger.clearAppBadge) {
    promises.push(payload.badge > 0 ? badger.setAppBadge(payload.badge) : badger.clearAppBadge())
  }

  event.waitUntil(Promise.all(promises))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data?.url as string) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          void client.focus()
          if (target !== '/') void (client as WindowClient).navigate(target)
          return
        }
      }
      return self.clients.openWindow(target)
    }),
  )
})
