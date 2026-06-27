import type { Completion, HouseholdData, Reward, Slot, Task } from '../types'
import { CATALOG_TASKS, DAY_LONG, resolveTask } from './defaults'

// ---------- date / key helpers (ported 1:1 from the prototype) ----------
export function localKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export function parseKey(k: string): Date {
  const p = k.split('-').map(Number)
  return new Date(p[0], p[1] - 1, p[2])
}
export function epochDay(d: Date): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000)
}
/** 0 = Monday … 6 = Sunday */
export function monIndex(d: Date): number {
  return (d.getDay() + 6) % 7
}
function hash(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h += id.charCodeAt(i)
  return h
}
function compP(v: Completion | undefined): Slot | null {
  return v ? v.p : null
}
function compT(v: Completion | undefined): number | null {
  return v && typeof v === 'object' ? v.t : null
}

export function scheduledFor(data: HouseholdData, d: Date): Task[] {
  const mi = monIndex(d)
  return data.tasks.filter((t) => t.freq === 'daily' || (t.freq === 'weekly' && t.day === mi))
}

/** Internal: assign one week's tasks starting from accumulated loads; returns the
 *  assignment map plus the resulting loads so they can carry into the next week. */
function assignWeek(data: HouseholdData, ref: Date, la0 = 0, lb0 = 0): { map: Record<string, Record<string, Slot>>; la: number; lb: number } {
  const monday = new Date(ref)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(ref.getDate() - monIndex(ref))
  let la = la0
  let lb = lb0
  const map: Record<string, Record<string, Slot>> = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const sched = scheduledFor(data, d)
    const fixed = sched.filter((t) => t.assign === 'a' || t.assign === 'b')
    const rot = sched
      .filter((t) => t.assign === 'rotate')
      .sort((x, y) => y.points - x.points || hash(x.id) - hash(y.id) || (x.id < y.id ? -1 : 1))
    const day: Record<string, Slot> = {}
    fixed.forEach((t) => {
      day[t.id] = t.assign as Slot
      if (t.assign === 'a') la += t.points
      else lb += t.points
    })
    rot.forEach((t) => {
      let who: Slot
      if (la < lb) who = 'a'
      else if (lb < la) who = 'b'
      else who = hash(t.id) % 2 === 0 ? 'a' : 'b'
      day[t.id] = who
      if (who === 'a') la += t.points
      else lb += t.points
    })
    map[localKey(d)] = day
  }
  return { map, la, lb }
}

// Fixed anchor (Mon 2025-01-06) for the carryover simulation. Anchoring to a fixed
// epoch (rather than a sliding window) keeps the realized sequence continuous, so
// consecutive real weeks genuinely alternate instead of washing out.
const CARRY_EPOCH = Date.UTC(2025, 0, 6)
const WEEK_MS = 7 * 86400000
const CARRY_CAP = 200 // bound the simulation (~4 years); beyond it, very old history fades

/** Balanced weekly assignment with cross-week carryover: simulate every week from a
 *  fixed epoch up to the target, carrying the realized load so imbalances compensate
 *  over time (whoever did more recently gets the lighter list). Deterministic. */
export function weekAssign(data: HouseholdData, ref: Date): Record<string, Record<string, Slot>> {
  const monday = new Date(ref)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(ref.getDate() - monIndex(ref))
  const mondayUTC = Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate())
  const weeksSinceEpoch = Math.round((mondayUTC - CARRY_EPOCH) / WEEK_MS)
  const L = Math.max(0, Math.min(weeksSinceEpoch, CARRY_CAP))
  let la = 0
  let lb = 0
  for (let i = L; i >= 1; i--) {
    const wkMon = new Date(monday)
    wkMon.setDate(monday.getDate() - 7 * i)
    const r = assignWeek(data, wkMon, la, lb)
    la = r.la
    lb = r.lb
  }
  return assignWeek(data, ref, la, lb).map
}

export function isDone(data: HouseholdData, taskId: string, key: string): boolean {
  const c = data.completions[key]
  return !!(c && c[taskId])
}

/** true = all scheduled tasks done, false = some missing, null = no tasks that day */
export function dayComplete(data: HouseholdData, d: Date): boolean | null {
  const sched = scheduledFor(data, d)
  if (!sched.length) return null
  const c = data.completions[localKey(d)] || {}
  return sched.every((t) => c[t.id] != null)
}

export interface PlantInfo {
  status: string
  sub: string
  stem: string
  leaf: string
  leaf2: string
  flowerOp: string
  flower: string
  droop: string
  barColor: string
  barW: string
}

export function plantInfo(data: HouseholdData, now: Date, N = 10, halfLife = 7): PlantInfo {
  // Recency-weighted rolling completion-RATE over the last N task-having days
  // (continuous per-day ratio, so one weak day can't collapse the plant). Excludes today.
  let wSum = 0
  let sSum = 0
  let collected = 0
  let idx = 0
  const cur = new Date(now)
  cur.setDate(cur.getDate() - 1)
  for (let i = 0; i < 60 && collected < N; i++) {
    const sched = scheduledFor(data, cur)
    if (sched.length > 0) {
      const ratio = sched.filter((t) => isDone(data, t.id, localKey(cur))).length / sched.length
      const w = Math.pow(0.5, idx / halfLife)
      sSum += ratio * w
      wSum += w
      idx++
      collected++
    }
    cur.setDate(cur.getDate() - 1)
  }
  const histRate = wSum > 0 ? sSum / wSum : null

  const todaySched = scheduledFor(data, now)
  const todayRatio = todaySched.length
    ? todaySched.filter((t) => isDone(data, t.id, localKey(now))).length / todaySched.length
    : null

  let base: number
  if (histRate == null && todayRatio == null) base = 60 // no tasks at all
  else if (histRate == null) base = 45 + todayRatio! * 45 // brand new — lean on today
  else {
    const blend = todayRatio == null ? histRate : histRate * 0.8 + todayRatio * 0.2 // today nudges, history leads
    base = 12 + blend * 88 // floor ~12 so a bad stretch never reads as dead
  }
  const h = Math.max(0, Math.min(100, Math.round(base)))
  let p: Omit<PlantInfo, 'barW'>
  if (h >= 80) p = { status: 'Floreciendo', sub: 'La casa brilla ✨', stem: '#6E8A6E', leaf: '#7E9B80', leaf2: '#8FA892', flowerOp: '1', flower: '#E8B4A0', droop: 'rotate(0 100 150)', barColor: '#8FA892' }
  else if (h >= 60) p = { status: 'Sana y fuerte', sub: 'Buen ritmo, seguid así', stem: '#6E8A6E', leaf: '#7E9B80', leaf2: '#8FA892', flowerOp: '0', flower: '#E8B4A0', droop: 'rotate(0 100 150)', barColor: '#8FA892' }
  else if (h >= 40) p = { status: 'Creciendo', sub: 'Vais por buen camino', stem: '#7E9270', leaf: '#9DAE7E', leaf2: '#AEB988', flowerOp: '0', flower: '#E8B4A0', droop: 'rotate(2 100 150)', barColor: '#B8A86A' }
  else if (h >= 20) p = { status: 'Le falta agua', sub: 'No la dejéis sola', stem: '#A38F5E', leaf: '#BBA968', leaf2: '#C9B97E', flowerOp: '0', flower: '#E8B4A0', droop: 'rotate(7 100 150)', barColor: '#C99A4E' }
  else p = { status: 'Mustia', sub: 'Necesita cariño 🥀', stem: '#9C7B55', leaf: '#A88B5E', leaf2: '#B59A68', flowerOp: '0', flower: '#E8B4A0', droop: 'rotate(12 100 150)', barColor: '#C77B5C' }
  return { ...p, barW: `${Math.max(6, h)}%` }
}

export interface Stats {
  anyDone: boolean
  lifetime: number
  madrugador: boolean
  buho: boolean
  longest: number
  perfectWeek: boolean
}

export function computeStats(data: HouseholdData, now: Date): Stats {
  const comp = data.completions
  const keys = Object.keys(comp).sort()
  let lifetime = 0
  let madrugador = false
  let buho = false
  keys.forEach((k) => {
    const day = comp[k]
    Object.keys(day).forEach((tid) => {
      const t = resolveTask(data.tasks, tid)
      if (t) lifetime += t.points
      const ts = compT(day[tid])
      if (ts) {
        const h = new Date(ts).getHours()
        if (h >= 5 && h < 9) madrugador = true
        if (h < 5) buho = true
      }
    })
  })
  let longest = 0
  if (keys.length) {
    let cur = parseKey(keys[0])
    const end = new Date(now)
    end.setHours(0, 0, 0, 0)
    let run = 0
    while (cur <= end) {
      const dc = dayComplete(data, cur)
      if (dc === true) {
        run++
        if (run > longest) longest = run
      } else if (dc === false) run = 0
      cur.setDate(cur.getDate() + 1)
    }
  }
  let perfectWeek = false
  const monSet: Record<string, number> = {}
  keys.forEach((k) => {
    const d = parseKey(k)
    const mon = new Date(d)
    mon.setDate(d.getDate() - monIndex(d))
    monSet[localKey(mon)] = 1
  })
  Object.keys(monSet).forEach((mk) => {
    const mon = parseKey(mk)
    let all = true
    let had = false
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon)
      d.setDate(mon.getDate() + i)
      const dc = dayComplete(data, d)
      if (dc === false) all = false
      if (dc === true) had = true
    }
    if (all && had) perfectWeek = true
  })
  return { anyDone: keys.length > 0, lifetime, madrugador, buho, longest, perfectWeek }
}

// ---------- derived view-model (ported from renderVals, data only) ----------
export interface TaskRow {
  task: Task
  emoji: string
  name: string
  sub: string
  pointsBadge: string
  done: boolean
  bg: string
  borderColor: string
  nameColor: string
  deco: string
}

export interface RewardRow {
  reward: Reward
  affordable: boolean
  emoji: string
  text: string
  opacity: string
  textColor: string
  badge: string
  badgeColor: string
  badgeBg: string
}

export interface RedemptionRow {
  emoji: string
  text: string
  whoName: string
  color: string
  cost: number
  dateLabel: string
}

export interface Medal {
  emoji: string
  label: string
  op: string
  filter: string
  labelColor: string
}

export interface AllTaskRow {
  task: Task
  emoji: string
  name: string
  metaSub: string
}

export function computeModel(data: HouseholdData, now: Date) {
  const todayKey = localKey(now)
  const P = data.people
  const nameA = P.a.name
  const nameB = P.b.name
  const colorA = P.a.color
  const colorB = P.b.color
  const wa = weekAssign(data, now)

  let dateLabel = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)

  const assigneeToday = (t: Task): Slot => (wa[todayKey] && wa[todayKey][t.id]) || 'a'
  const mapRow = (t: Task): TaskRow => {
    const done = isDone(data, t.id, todayKey)
    const color = assigneeToday(t) === 'a' ? colorA : colorB
    return {
      task: t,
      emoji: t.emoji,
      name: t.name,
      sub: `${t.zone} · ${t.points}${t.points === 1 ? ' punto' : ' puntos'}`,
      pointsBadge: `+${t.points}`,
      done,
      bg: done ? color : 'transparent',
      borderColor: done ? color : 'rgba(44,44,40,0.22)',
      nameColor: done ? '#B0AB9F' : '#2C2C28',
      deco: done ? 'line-through' : 'none',
    }
  }

  const sched = scheduledFor(data, now)
  const todayA = sched.filter((t) => assigneeToday(t) === 'a').map(mapRow)
  const todayB = sched.filter((t) => assigneeToday(t) === 'b').map(mapRow)
  const total = sched.length
  const done = sched.filter((t) => isDone(data, t.id, todayKey)).length
  const pct = total ? done / total : 0

  // extra tasks logged today that are NOT scheduled today (ad-hoc "I did this too")
  const schedIds = new Set(sched.map((t) => t.id))
  const todayComp = data.completions[todayKey] || {}
  const todayDoneIds = Object.keys(todayComp)
  const extrasToday: TaskRow[] = todayDoneIds
    .filter((tid) => !schedIds.has(tid))
    .map((tid) => {
      const t = resolveTask(data.tasks, tid)
      if (!t) return null
      const who = todayComp[tid].p
      const color = who === 'a' ? colorA : colorB
      return {
        task: t,
        emoji: t.emoji,
        name: t.name,
        sub: `${who === 'a' ? nameA : nameB} · ${t.points}${t.points === 1 ? ' punto' : ' puntos'}`,
        pointsBadge: `+${t.points}`,
        done: true,
        bg: color,
        borderColor: color,
        nameColor: '#B0AB9F',
        deco: 'line-through',
      } as TaskRow
    })
    .filter((r): r is TaskRow => r !== null)

  // cumulative scoreboard — lifetime points per person, never reset
  let scoreA = 0
  let scoreB = 0
  Object.keys(data.completions).forEach((key) => {
    const c = data.completions[key]
    Object.keys(c).forEach((tid) => {
      const tk = resolveTask(data.tasks, tid)
      if (!tk) return
      if (compP(c[tid]) === 'a') scoreA += tk.points
      else scoreB += tk.points
    })
  })
  const totalEarned = scoreA + scoreB
  const totalPoints = totalEarned // alias kept for back-compat
  // shared spendable balance = everything earned minus everything redeemed
  const redemptions = data.redemptions ?? []
  const totalSpent = redemptions.reduce((s, r) => s + r.cost, 0)
  const balance = totalEarned - totalSpent

  // cooperative streak (whole house done)
  let streak = 0
  const cursor = new Date(now)
  if (dayComplete(data, now) === false) cursor.setDate(cursor.getDate() - 1)
  for (let i = 0; i < 400; i++) {
    const dc = dayComplete(data, cursor)
    if (dc === false) break
    if (dc === true) streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  // organizar: active tasks + gallery of inactive catalog tasks
  const sortTasks = (a: Task, b: Task) => {
    const fa = a.freq === 'daily' ? 0 : 1
    const fb = b.freq === 'daily' ? 0 : 1
    if (fa !== fb) return fa - fb
    if (a.freq === 'weekly' && b.freq === 'weekly') return a.day - b.day
    return 0
  }
  const taskRow = (t: Task): AllTaskRow => {
    const schedLabel = t.freq === 'daily' ? 'Cada día' : `Cada ${DAY_LONG[t.day]}`
    return { task: t, emoji: t.emoji, name: t.name, metaSub: `${t.zone} · ${schedLabel} · ${t.points} pt` }
  }
  const activeIds = new Set(data.tasks.map((t) => t.id))
  const allTasks: AllTaskRow[] = data.tasks.slice().sort(sortTasks).map(taskRow)
  const gallery: AllTaskRow[] = CATALOG_TASKS.filter((t) => !activeIds.has(t.id))
    .slice()
    .sort(sortTasks)
    .map(taskRow)

  // rewards — affordable against the spendable balance (earned − redeemed)
  const rewSorted = data.rewards.slice().sort((a, b) => a.cost - b.cost)
  const nextReward: Reward | undefined = rewSorted.find((r) => balance < r.cost)
  const rewardRows: RewardRow[] = rewSorted.map((r) => {
    const affordable = balance >= r.cost
    return {
      reward: r,
      affordable,
      emoji: r.emoji,
      text: r.text,
      opacity: affordable ? '1' : '0.5',
      textColor: affordable ? '#2C2C28' : '#9A968C',
      badge: affordable ? 'Canjear' : `${r.cost} pts`,
      badgeColor: affordable ? '#fff' : '#B8896A',
      badgeBg: affordable ? '#8FA892' : 'rgba(184,137,106,0.12)',
    }
  })
  const rewardEdits = rewSorted

  // redemption history (newest first)
  const redemptionRows: RedemptionRow[] = redemptions
    .slice()
    .sort((a, b) => b.t - a.t)
    .map((r) => ({
      emoji: r.emoji,
      text: r.text,
      whoName: r.by === 'a' ? nameA : nameB,
      color: r.by === 'a' ? colorA : colorB,
      cost: r.cost,
      dateLabel: new Date(r.t).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', ''),
    }))

  // achievements
  const st = computeStats(data, now)
  const bothWeek = scoreA > 0 && scoreB > 0
  const defs = [
    { emoji: '🌱', label: 'Primer día', on: st.anyDone },
    { emoji: '🤝', label: 'En equipo', on: bothWeek },
    { emoji: '🔥', label: 'Racha 7', on: st.longest >= 7 },
    { emoji: '⭐', label: 'Semana perfecta', on: st.perfectWeek },
    { emoji: '🌅', label: 'Madrugador', on: st.madrugador },
    { emoji: '🦉', label: 'Búho', on: st.buho },
    { emoji: '💎', label: 'Racha 30', on: st.longest >= 30 },
    { emoji: '🏆', label: '100 puntos', on: st.lifetime >= 100 },
  ]
  const medals: Medal[] = defs.map((m) => ({
    emoji: m.emoji,
    label: m.label,
    op: m.on ? '1' : '0.4',
    filter: m.on ? 'none' : 'grayscale(1)',
    labelColor: m.on ? '#6E6A60' : '#B3AEA3',
  }))
  const medalCount = `${defs.filter((m) => m.on).length} / ${defs.length}`

  return {
    dateLabel,
    nameA,
    nameB,
    colorA,
    colorB,
    ringOffset: 264 * (1 - pct),
    progressPctLabel: total ? `${Math.round(pct * 100)}%` : '—',
    progressTitle: total === 0 ? 'Día libre' : `${done} de ${total}`,
    progressSubtitle: total === 0 ? 'Sin tareas hoy' : done === total ? '¡Día completo! 🎉' : `Quedan ${total - done}`,
    streak,
    streakUnit: streak === 1 ? 'día seguido' : 'días seguidos',
    coopLine:
      streak === 0
        ? 'Completad el día de hoy para empezar la racha'
        : `Lleváis ${streak}${streak === 1 ? ' día' : ' días'} con la casa al día`,
    scoreA,
    scoreB,
    totalPoints,
    totalEarned,
    totalSpent,
    balance,
    leaderA: scoreA > scoreB && scoreA > 0,
    leaderB: scoreB > scoreA && scoreB > 0,
    todayA,
    todayB,
    extrasToday,
    todayDoneIds,
    countA: `· ${todayA.length}${todayA.length === 1 ? ' tarea' : ' tareas'}`,
    countB: `· ${todayB.length}${todayB.length === 1 ? ' tarea' : ' tareas'}`,
    plant: plantInfo(data, now),
    nextReward,
    nextRemaining: nextReward ? nextReward.cost - balance : 0,
    nextPct: nextReward ? `${Math.min(100, Math.round((Math.max(0, balance) / nextReward.cost) * 100))}%` : '0%',
    rewardRows,
    redemptionRows,
    rewardEdits,
    medals,
    medalCount,
    allTasks,
    gallery,
    tasksLabel: `Tus tareas (${data.tasks.length})`,
    galleryLabel: `Galería de tareas (${gallery.length})`,
    rewardsLabel: `Recompensas (${data.rewards.length})`,
  }
}

export type ViewModel = ReturnType<typeof computeModel>

/** Toggle a completion immutably; credits the person who marked it (`by`). */
export function toggleCompletion(data: HouseholdData, t: Task, now: Date, by: Slot): { completions: HouseholdData['completions']; wasComplete: boolean; isComplete: boolean } {
  const key = localKey(now)
  const comp = { ...data.completions }
  const day = { ...(comp[key] || {}) }
  if (day[t.id]) delete day[t.id]
  else day[t.id] = { p: by, t: Date.now() }
  if (Object.keys(day).length) comp[key] = day
  else delete comp[key]
  const after: HouseholdData = { ...data, completions: comp }
  return {
    completions: comp,
    wasComplete: dayComplete(data, now) === true,
    isComplete: dayComplete(after, now) === true,
  }
}
