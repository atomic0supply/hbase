export type Slot = string // member slot id: letter sequence 'a','b','c',… (see SLOT_IDS)
export type Freq = 'daily' | 'weekly'
export type Assign = 'rotate' | string // 'rotate' or a fixed slot id

export interface Person {
  name: string
  color: string
  photo?: string | null // Google profile photo URL, for avatars
}

export interface Task {
  id: string
  emoji: string
  name: string
  zone: string
  freq: Freq
  day: number // 0=Mon ... 6=Sun, only meaningful when freq === 'weekly'
  assign: Assign
  points: number
}

export interface Reward {
  id: string
  emoji: string
  text: string
  cost: number
}

/** One completion entry: which person it counted for, and when (ms epoch). */
export interface Completion {
  p: Slot
  t: number
}

/** completions[dateKey][taskId] = Completion */
export type Completions = Record<string, Record<string, Completion>>

/** A claimed reward held in a person's "lista de uso" (inventory). Redeeming spends
 * the redeemer's own points; the item is kept until they choose to use it. Reward
 * fields are snapshotted so editing/deleting the reward later never changes anything. */
export interface Redemption {
  id: string
  rewardId: string
  emoji: string
  text: string
  cost: number
  by: Slot // who redeemed it (and whose points were spent)
  t: number // ms epoch when redeemed
  used?: boolean // consumed from the inventory
  usedAt?: number // ms epoch when used
}

/** The shared, synced state of a household (the "pair"). */
export interface HouseholdData {
  people: Record<string, Person> // keyed by slot id ('a','b','c',…)
  tasks: Task[]
  rewards: Reward[]
  completions: Completions
  redemptions: Redemption[]
}

/** Full Firestore household document. */
export interface Household extends HouseholdData {
  members: string[] // up to 2 uids
  memberSlots: Record<string, Slot> // uid -> 'a' | 'b'
  inviteCode: string | null // active pairing code while waiting for a partner
  joinCode?: string | null // transient: code presented by a joining member (for security rules)
  lastEditedBy?: string // uid of who last edited — lets the notifier skip the actor
  timezone?: string
  createdBy: string
  createdAt: number
  updatedAt: number
}

/** Local-only editor draft for a task (adds the transient _new flag). */
export type TaskDraft = Task & { _new?: boolean }
export type RewardDraft = Reward & { _new?: boolean }

// ---------- notifications ----------
export interface WebPushSubscription {
  endpoint: string
  expirationTime?: number | null
  keys: { p256dh: string; auth: string }
}

export interface NotifPrefs {
  dailyReminder: boolean
  reminderHour: number // 0-23, local time of the user's timezone
  streakAlerts: boolean
  taskAssigned: boolean
  partnerCompleted: boolean // notify me when my partner completes a task
}

export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  dailyReminder: true,
  reminderHour: 20,
  streakAlerts: true,
  taskAssigned: true,
  partnerCompleted: true,
}
