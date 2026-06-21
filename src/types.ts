export type Slot = 'a' | 'b'
export type Freq = 'daily' | 'weekly'
export type Assign = 'rotate' | 'a' | 'b'

export interface Person {
  name: string
  color: string
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

/** The shared, synced state of a household (the "pair"). */
export interface HouseholdData {
  people: { a: Person; b: Person }
  tasks: Task[]
  rewards: Reward[]
  completions: Completions
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
