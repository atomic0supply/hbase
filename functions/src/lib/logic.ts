// Server-side port of the pure chore logic (mirrors client src/lib/logic.ts).
// The Cloud Functions runtime is UTC; we build reference Dates from a user's local
// Y/M/D (via Intl + their timezone) so all the local-method helpers below produce
// keys that match what the client wrote.
import type { HouseholdData, Slot, Task } from './types'

export interface TzParts {
  year: number
  month: number // 1-12
  day: number
  hour: number
  weekdayMon: number // 0=Mon … 6=Sun
}

const WD: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }

/** Local date/time parts for `date` in the given IANA timezone. */
export function tzParts(date: Date, timeZone: string): TzParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    weekday: 'short',
  })
  const parts = fmt.formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  let hour = parseInt(get('hour'), 10)
  if (hour === 24) hour = 0 // some envs render midnight as 24
  return {
    year: parseInt(get('year'), 10),
    month: parseInt(get('month'), 10),
    day: parseInt(get('day'), 10),
    hour,
    weekdayMon: WD[get('weekday')] ?? 0,
  }
}

/** A Date pinned to noon UTC of the given local Y/M/D — safe to use with the UTC-based helpers. */
export function refDate(p: { year: number; month: number; day: number }): Date {
  return new Date(Date.UTC(p.year, p.month - 1, p.day, 12, 0, 0))
}

export function localKey(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export function monIndex(d: Date): number {
  return (d.getUTCDay() + 6) % 7
}
function hash(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h += id.charCodeAt(i)
  return h
}

export function scheduledFor(data: HouseholdData, d: Date): Task[] {
  const mi = monIndex(d)
  return data.tasks.filter((t) => t.freq === 'daily' || (t.freq === 'weekly' && t.day === mi))
}

export function weekAssign(data: HouseholdData, ref: Date): Record<string, Record<string, Slot>> {
  const monday = new Date(ref)
  monday.setUTCHours(12, 0, 0, 0)
  monday.setUTCDate(ref.getUTCDate() - monIndex(ref))
  let la = 0
  let lb = 0
  const out: Record<string, Record<string, Slot>> = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setUTCDate(monday.getUTCDate() + i)
    const sched = scheduledFor(data, d)
    const fixed = sched.filter((t) => t.assign === 'a' || t.assign === 'b')
    const rot = sched
      .filter((t) => t.assign === 'rotate')
      .sort((x, y) => y.points - x.points || hash(x.id) - hash(y.id) || (x.id < y.id ? -1 : 1))
    const map: Record<string, Slot> = {}
    fixed.forEach((t) => {
      map[t.id] = t.assign as Slot
      if (t.assign === 'a') la += t.points
      else lb += t.points
    })
    rot.forEach((t) => {
      let who: Slot
      if (la < lb) who = 'a'
      else if (lb < la) who = 'b'
      else who = hash(t.id) % 2 === 0 ? 'a' : 'b'
      map[t.id] = who
      if (who === 'a') la += t.points
      else lb += t.points
    })
    out[localKey(d)] = map
  }
  return out
}

export function isDone(data: HouseholdData, taskId: string, key: string): boolean {
  const c = data.completions[key]
  return !!(c && c[taskId])
}

export function dayComplete(data: HouseholdData, d: Date): boolean | null {
  const sched = scheduledFor(data, d)
  if (!sched.length) return null
  const c = data.completions[localKey(d)] || {}
  return sched.every((t) => c[t.id] != null)
}

/** Tasks scheduled today for `slot` that are still not done. */
export function remainingForSlot(data: HouseholdData, ref: Date, slot: Slot): number {
  const key = localKey(ref)
  const wa = weekAssign(data, ref)
  const todayMap = wa[key] || {}
  return scheduledFor(data, ref).filter((t) => (todayMap[t.id] || 'a') === slot && !isDone(data, t.id, key)).length
}

/** Cooperative streak (whole-house complete) ending at `ref`'s day. */
export function streakLength(data: HouseholdData, ref: Date): number {
  let streak = 0
  const cursor = new Date(ref)
  if (dayComplete(data, ref) === false) cursor.setUTCDate(cursor.getUTCDate() - 1)
  for (let i = 0; i < 400; i++) {
    const dc = dayComplete(data, cursor)
    if (dc === false) break
    if (dc === true) streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}
