// Mirrors the relevant parts of the client's src/types.ts. Kept in sync manually —
// these are pure data shapes for the chore logic, which changes rarely.
export type Slot = 'a' | 'b'
export type Freq = 'daily' | 'weekly'
export type Assign = 'rotate' | 'a' | 'b'

export interface Task {
  id: string
  emoji: string
  name: string
  zone: string
  freq: Freq
  day: number
  assign: Assign
  points: number
}

export interface Reward {
  id: string
  emoji: string
  text: string
  cost: number
}

export interface Completion {
  p: Slot
  t: number
}
export type Completions = Record<string, Record<string, Completion>>

export interface Redemption {
  id: string
  rewardId: string
  emoji: string
  text: string
  cost: number
  by: Slot
  t: number
  used?: boolean
  usedAt?: number
}

export interface HouseholdData {
  people: { a: { name: string; color: string }; b: { name: string; color: string } }
  tasks: Task[]
  rewards: Reward[]
  completions: Completions
  redemptions?: Redemption[]
}

export interface Household extends HouseholdData {
  members: string[]
  memberSlots: Record<string, Slot>
  inviteCode: string | null
  createdBy: string
  timezone?: string
}

export interface WebPushSubscription {
  endpoint: string
  expirationTime?: number | null
  keys: { p256dh: string; auth: string }
}

export interface NotifPrefs {
  dailyReminder: boolean
  reminderHour: number
  streakAlerts: boolean
  taskAssigned: boolean
  partnerCompleted: boolean
}

export interface UserDoc {
  householdId: string | null
  displayName: string | null
  photoURL: string | null
  pushEnabled?: boolean
  pushSubscriptions?: WebPushSubscription[]
  notifPrefs?: NotifPrefs
  timezone?: string
  lastReminderKey?: string
  lastStreakNotified?: number
}

export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  dailyReminder: true,
  reminderHour: 20,
  streakAlerts: true,
  taskAssigned: true,
  partnerCompleted: true,
}

export const DEFAULT_TZ = 'Europe/Madrid'
