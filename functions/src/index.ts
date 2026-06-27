import { setGlobalOptions } from 'firebase-functions/v2'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { defineSecret } from 'firebase-functions/params'
import { logger } from 'firebase-functions'
import * as admin from 'firebase-admin'
import { sendToUser, type PushPayload } from './lib/push'
import { dayComplete, refDate, remainingForSlot, streakLength, tzParts } from './lib/logic'
import {
  DEFAULT_NOTIF_PREFS,
  DEFAULT_TZ,
  type Household,
  type NotifPrefs,
  type Slot,
  type UserDoc,
} from './lib/types'

admin.initializeApp()
const db = admin.firestore()

setGlobalOptions({ region: 'europe-west1', maxInstances: 5 })

const VAPID_PRIVATE_KEY = defineSecret('VAPID_PRIVATE_KEY')

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365]

function prefsOf(u: UserDoc): NotifPrefs {
  return { ...DEFAULT_NOTIF_PREFS, ...(u.notifPrefs ?? {}) }
}

// ---------------------------------------------------------------------------
// 1) Daily reminder: runs hourly, fires at each user's chosen local hour if they
//    still have tasks pending today (or their streak is at risk).
// ---------------------------------------------------------------------------
export const dailyReminder = onSchedule(
  { schedule: 'every 60 minutes', secrets: [VAPID_PRIVATE_KEY] },
  async () => {
    const now = new Date()
    const snap = await db.collection('users').where('pushEnabled', '==', true).get()
    const householdCache = new Map<string, Household | null>()

    for (const docSnap of snap.docs) {
      const user = docSnap.data() as UserDoc
      const prefs = prefsOf(user)
      const subs = user.pushSubscriptions ?? []
      if (!prefs.dailyReminder || !subs.length || !user.householdId) continue

      const tz = user.timezone || DEFAULT_TZ
      const parts = tzParts(now, tz)
      if (parts.hour !== prefs.reminderHour) continue

      const ref = refDate(parts)
      const todayKey = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
      if (user.lastReminderKey === todayKey) continue

      const hid = user.householdId
      if (!householdCache.has(hid)) {
        const hhSnap = await db.doc(`households/${hid}`).get()
        householdCache.set(hid, hhSnap.exists ? (hhSnap.data() as Household) : null)
      }
      const hh = householdCache.get(hid)
      if (!hh) continue

      const slot: Slot = hh.memberSlots?.[docSnap.id] ?? 'a'
      const remaining = remainingForSlot(hh, ref, slot)
      const houseComplete = dayComplete(hh, ref) === true
      const streak = streakLength(hh, ref)
      const streakAtRisk = prefs.streakAlerts && streak > 0 && !houseComplete

      let body: string | null = null
      if (remaining > 0) {
        body = `Te ${remaining === 1 ? 'queda 1 tarea' : `quedan ${remaining} tareas`} para hoy.`
        if (streakAtRisk) body += ` ¡No rompáis la racha de ${streak}! 🔥`
      } else if (streakAtRisk) {
        body = `Vuestra racha de ${streak} días está en juego. ¡Completad el día! 🔥`
      }
      if (!body) continue

      const payload: PushPayload = {
        title: 'Reparto del Hogar',
        body,
        tag: 'daily-reminder',
        url: '/',
        badge: remaining,
      }
      try {
        await sendToUser(db, docSnap.id, subs, payload, VAPID_PRIVATE_KEY.value())
        await docSnap.ref.set({ lastReminderKey: todayKey }, { merge: true })
      } catch (err) {
        logger.error('dailyReminder send failed', { uid: docSnap.id, err })
      }
    }
  },
)

// ---------------------------------------------------------------------------
// 2) On household change: notify the partner of a newly added task, and both of
//    a streak milestone reached.
// ---------------------------------------------------------------------------
export const onHouseholdChange = onDocumentUpdated(
  { document: 'households/{hid}', secrets: [VAPID_PRIVATE_KEY] },
  async (event) => {
    const before = event.data?.before.data() as Household | undefined
    const after = event.data?.after.data() as Household | undefined
    if (!before || !after) return

    // --- new task added ---
    if (after.tasks.length > before.tasks.length) {
      const beforeIds = new Set(before.tasks.map((t) => t.id))
      const added = after.tasks.filter((t) => !beforeIds.has(t.id))
      const actor = (after as Household & { lastEditedBy?: string }).lastEditedBy
      if (added.length) {
        const t = added[0]
        const actorSlot = actor ? after.memberSlots?.[actor] : undefined
        const actorName = actorSlot ? after.people[actorSlot].name : 'Tu pareja'
        const recipients = after.members.filter((m) => m !== actor)
        await notifyUsers(recipients, 'taskAssigned', {
          title: 'Nueva tarea',
          body: `${actorName} añadió "${t.emoji} ${t.name}"`,
          tag: 'task-added',
          url: '/',
        })
      }
    }

    // --- task completed: tell the partner who did what ---
    const actorUid = (after as Household & { lastEditedBy?: string }).lastEditedBy
    const newlyDone: string[] = []
    const beforeComp = before.completions || {}
    const afterComp = after.completions || {}
    for (const dateKey of Object.keys(afterComp)) {
      const beforeDay = beforeComp[dateKey] || {}
      for (const taskId of Object.keys(afterComp[dateKey])) {
        if (!beforeDay[taskId]) newlyDone.push(taskId)
      }
    }
    if (newlyDone.length) {
      const actorSlot = actorUid ? after.memberSlots?.[actorUid] : undefined
      const actorName = actorSlot ? after.people[actorSlot].name : 'Tu pareja'
      const recipients = after.members.filter((m) => m !== actorUid)
      let body: string
      let tag = 'task-done'
      if (newlyDone.length === 1) {
        const t = after.tasks.find((x) => x.id === newlyDone[0])
        body = `${actorName} ha hecho ${t ? `${t.emoji} ${t.name}` : 'una tarea'}`
        tag = `task-done-${newlyDone[0]}`
      } else {
        body = `${actorName} ha completado ${newlyDone.length} tareas`
      }
      await notifyUsers(recipients, 'partnerCompleted', {
        title: 'Tarea completada ✅',
        body,
        tag,
        url: '/',
      })
    }

    // --- reward redeemed: tell the partner ---
    const beforeRed = new Set((before.redemptions ?? []).map((r) => r.id))
    const newRedemptions = (after.redemptions ?? []).filter((r) => !beforeRed.has(r.id))
    if (newRedemptions.length) {
      const actorSlot = actorUid ? after.memberSlots?.[actorUid] : undefined
      const actorName = actorSlot ? after.people[actorSlot].name : 'Tu pareja'
      const recipients = after.members.filter((m) => m !== actorUid)
      const r = newRedemptions[0]
      await notifyUsers(recipients, 'partnerCompleted', {
        title: 'Recompensa canjeada 🎁',
        body: `${actorName} ha canjeado "${r.emoji} ${r.text}"`,
        tag: 'reward-redeemed',
        url: '/',
      })
    }

    // --- streak milestone ---
    const tz = after.timezone || DEFAULT_TZ
    const ref = refDate(tzParts(new Date(), tz))
    const beforeStreak = streakLength(before, ref)
    const afterStreak = streakLength(after, ref)
    if (afterStreak > beforeStreak && STREAK_MILESTONES.includes(afterStreak)) {
      await notifyUsers(after.members, 'streakAlerts', {
        title: '¡Racha conseguida! 🔥',
        body: `Lleváis ${afterStreak} días seguidos con la casa al día. ¡Seguid así!`,
        tag: 'streak-milestone',
        url: '/',
      })
    } else if (afterStreak === 0 && beforeStreak >= 3) {
      // streak just broke — only notify if it was a meaningful run
      await notifyUsers(after.members, 'streakAlerts', {
        title: 'Se rompió la racha 😅',
        body: `Veníais de ${beforeStreak} días. ¡A por una nueva!`,
        tag: 'streak-broken',
        url: '/',
      })
    }
  },
)

/** Load each user, respect their pref + subscriptions, and send. */
async function notifyUsers(uids: string[], prefKey: keyof NotifPrefs, payload: PushPayload): Promise<void> {
  await Promise.all(
    uids.map(async (uid) => {
      const uSnap = await db.doc(`users/${uid}`).get()
      if (!uSnap.exists) return
      const u = uSnap.data() as UserDoc
      const prefs = prefsOf(u)
      const subs = u.pushSubscriptions ?? []
      if (!u.pushEnabled || !subs.length || prefs[prefKey] === false) return
      try {
        await sendToUser(db, uid, subs, payload, VAPID_PRIVATE_KEY.value())
      } catch (err) {
        logger.error('notifyUsers send failed', { uid, err })
      }
    }),
  )
}
