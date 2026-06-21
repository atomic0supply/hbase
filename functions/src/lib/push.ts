import * as admin from 'firebase-admin'
import webpush from 'web-push'
import type { WebPushSubscription } from './types'

// Public VAPID key (matches the client). Private key is injected from the secret at call time.
const VAPID_PUBLIC = 'BCGwz_V3a8fQkHKQLaYbImwUoF3U1FVOaOXZb2Jr-ohvKGoJRQHtmb2UVyObo413GZyOkxxH-1wQ_bBb5hEX3CI'

let configured = false
function configure(privateKey: string): void {
  if (configured) return
  webpush.setVapidDetails('mailto:reparto@hbase-ceb8a.web.app', VAPID_PUBLIC, privateKey)
  configured = true
}

export interface PushPayload {
  title: string
  body: string
  tag?: string
  url?: string
  badge?: number
}

/**
 * Send a push to every subscription of a user. Prunes subscriptions that the push
 * service reports as gone (404/410) so dead devices don't accumulate.
 */
export async function sendToUser(
  db: admin.firestore.Firestore,
  userId: string,
  subscriptions: WebPushSubscription[],
  payload: PushPayload,
  privateKey: string,
): Promise<void> {
  if (!subscriptions.length) return
  configure(privateKey)
  const data = JSON.stringify(payload)
  const dead: string[] = []

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, data)
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode
        if (code === 404 || code === 410) dead.push(sub.endpoint)
      }
    }),
  )

  if (dead.length) {
    const alive = subscriptions.filter((s) => !dead.includes(s.endpoint))
    await db.doc(`users/${userId}`).set({ pushSubscriptions: alive }, { merge: true })
  }
}
