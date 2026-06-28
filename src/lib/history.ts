import type { HouseholdData, Slot } from '../types'
import { activeSlots, resolveTask } from './defaults'
import { localKey, monIndex, parseKey } from './logic'

export type Period = 'week' | 'month'

export interface HistoryItem {
  key: string
  taskId: string
  emoji: string
  name: string
  who: Slot
  whoName: string
  color: string
  points: number
  timeLabel: string
  t: number
}

export interface HistoryDay {
  dateKey: string
  dateLabel: string
  items: HistoryItem[]
}

export interface ChartBar {
  label: string
  counts: Record<string, number> // tasks done per member slot that day
}

export interface HistoryMember {
  slot: string
  name: string
  color: string
  total: number // points in the period
  count: number // tasks in the period
}

export interface History {
  label: string
  isCurrent: boolean
  canPrev: boolean
  canNext: boolean
  days: HistoryDay[]
  chart: ChartBar[]
  members: HistoryMember[]
}

function startOfWeek(d: Date): Date {
  const s = new Date(d)
  s.setHours(0, 0, 0, 0)
  s.setDate(d.getDate() - monIndex(d))
  return s
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** [start, end] of the period containing `anchor`. */
export function periodRange(period: Period, anchor: Date): { start: Date; end: Date } {
  if (period === 'week') {
    const start = startOfWeek(anchor)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

/** Shift the anchor one period back (-1) or forward (+1). */
export function shiftAnchor(period: Period, anchor: Date, dir: -1 | 1): Date {
  const d = new Date(anchor)
  if (period === 'week') d.setDate(d.getDate() + dir * 7)
  else d.setMonth(d.getMonth() + dir, 1)
  return d
}

function periodLabel(period: Period, start: Date, end: Date, isCurrent: boolean): string {
  if (period === 'week') {
    if (isCurrent) return 'Esta semana'
    const m1 = start.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
    const m2 = end.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
    return start.getMonth() === end.getMonth()
      ? `${start.getDate()}–${end.getDate()} ${m1}`
      : `${start.getDate()} ${m1} – ${end.getDate()} ${m2}`
  }
  const month = cap(start.toLocaleDateString('es-ES', { month: 'long' }))
  const now = new Date()
  return start.getFullYear() === now.getFullYear() ? month : `${month} ${start.getFullYear()}`
}

export function computeHistory(data: HouseholdData, period: Period, anchor: Date, now: Date): History {
  const { start, end } = periodRange(period, anchor)
  const startKey = localKey(start)
  const endKey = localKey(end)
  const isCurrent = now >= start && now <= end

  const P = data.people
  const slots = activeSlots(P)
  const pname = (s: string) => P[s]?.name ?? '—'
  const pcolor = (s: string) => P[s]?.color ?? '#9A968C'
  const total: Record<string, number> = {}
  const count: Record<string, number> = {}
  slots.forEach((s) => {
    total[s] = 0
    count[s] = 0
  })

  const days: HistoryDay[] = []
  Object.keys(data.completions)
    .filter((k) => k >= startKey && k <= endKey)
    .sort()
    .reverse() // newest day first
    .forEach((dateKey) => {
      const dayComp = data.completions[dateKey]
      const items: HistoryItem[] = []
      Object.keys(dayComp).forEach((taskId) => {
        const c = dayComp[taskId]
        const task = resolveTask(data.tasks, taskId)
        const who = c.p
        const points = task ? task.points : 0
        if (who in total) {
          total[who] += points
          count[who] += 1
        }
        items.push({
          key: `${dateKey}:${taskId}`,
          taskId,
          emoji: task ? task.emoji : '✅',
          name: task ? task.name : 'Tarea',
          who,
          whoName: pname(who),
          color: pcolor(who),
          points,
          timeLabel: c.t ? new Date(c.t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '',
          t: c.t || 0,
        })
      })
      items.sort((x, y) => y.t - x.t)
      const dateLabel = cap(parseKey(dateKey).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })).replace('.', '')
      days.push({ dateKey, dateLabel, items })
    })

  // stacked bar chart: one bar per day of the period (chronological), counts by slot
  const WK = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const chart: ChartBar[] = []
  const cur = new Date(start)
  while (cur <= end) {
    const dayComp = data.completions[localKey(cur)] || {}
    const counts: Record<string, number> = {}
    slots.forEach((s) => (counts[s] = 0))
    Object.keys(dayComp).forEach((tid) => {
      const s = dayComp[tid].p
      if (s in counts) counts[s] += 1
    })
    chart.push({ label: period === 'week' ? WK[monIndex(cur)] : String(cur.getDate()), counts })
    cur.setDate(cur.getDate() + 1)
  }

  return {
    label: periodLabel(period, start, end, isCurrent),
    isCurrent,
    canPrev: true,
    canNext: !isCurrent && start < now,
    days,
    chart,
    members: slots.map((s) => ({ slot: s, name: pname(s), color: pcolor(s), total: total[s], count: count[s] })),
  }
}
