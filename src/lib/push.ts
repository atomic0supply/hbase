import { arrayRemove, arrayUnion, doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { NotifPrefs, WebPushSubscription } from '../types'

// Public VAPID key — safe to ship in the client. The matching private key lives
// only in Cloud Functions (secret VAPID_PRIVATE_KEY).
export const VAPID_PUBLIC_KEY =
  'BCGwz_V3a8fQkHKQLaYbImwUoF3U1FVOaOXZb2Jr-ohvKGoJRQHtmb2UVyObo413GZyOkxxH-1wQ_bBb5hEX3CI'

/** Push needs a service worker + the Push API. iOS only exposes these in an installed PWA. */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/** iOS: notifications only work when launched from the Home Screen (standalone). */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function permissionState(): NotificationPermission {
  return isPushSupported() ? Notification.permission : 'denied'
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

const tz = () => Intl.DateTimeFormat().resolvedOptions().timeZone

/** Request permission, subscribe to push, and persist the subscription + timezone. */
export async function enablePush(uid: string): Promise<'ok' | 'denied' | 'unsupported'> {
  if (!isPushSupported()) return 'unsupported'
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'denied'

  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    })
  }
  const json = sub.toJSON() as unknown as WebPushSubscription
  await setDoc(
    doc(db, 'users', uid),
    { pushSubscriptions: arrayUnion(json), timezone: tz(), pushEnabled: true },
    { merge: true },
  )
  return 'ok'
}

/** Unsubscribe this device and drop its subscription from Firestore. */
export async function disablePush(uid: string): Promise<void> {
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (sub) {
    const json = sub.toJSON() as unknown as WebPushSubscription
    await setDoc(doc(db, 'users', uid), { pushSubscriptions: arrayRemove(json), pushEnabled: false }, { merge: true })
    await sub.unsubscribe().catch(() => {})
  } else {
    await setDoc(doc(db, 'users', uid), { pushEnabled: false }, { merge: true })
  }
}

export async function saveNotifPrefs(uid: string, prefs: NotifPrefs): Promise<void> {
  await setDoc(doc(db, 'users', uid), { notifPrefs: prefs, timezone: tz() }, { merge: true })
}
