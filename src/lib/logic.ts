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

/** Balanced weekly assignment — equalizes points across the two people. */
export function weekAssign(data: HouseholdData, ref: Date): Record<string, Record<string, Slot>> {
  const monday = new Date(ref)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(ref.getDate() - monIndex(ref))
  let la = 0
  let lb = 0
  const out: Record<string, Record<string, Slot>> = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
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

export function plantInfo(data: HouseholdData, now: Date): PlantInfo {
  let considered = 0
  let score = 0
  const cur = new Date(now)
  cur.setDate(cur.getDate() - 1)
  for (let i = 0; i < 25 && considered < 7; i++) {
    const dc = dayComplete(data, cur)
    if (dc !== null) {
      considered++
      score += dc ? 1 : 0
    }
    cur.setDate(cur.getDate() - 1)
  }
  const sched = scheduledFor(data, now)
  const total = sched.length
  const doneT = total ? sched.filter((t) => isDone(data, t.id, localKey(now))).length / total : null
  let base: number
  if (considered === 0) base = doneT == null ? 60 : 50 + doneT * 40
  else {
    base = (score / considered) * 100
    if (doneT != null) base = base * 0.75 + doneT * 25
  }
  const h = Math.max(0, Math.min(100, Math.round(base)))
  let p: Omit<PlantInfo, 'barW'>
  if (h >= 85) p = { status: 'Floreciendo', sub: 'La casa brilla ✨', stem: '#6E8A6E', leaf: '#7E9B80', leaf2: '#8FA892', flowerOp: '1', flower: '#E8B4A0', droop: 'rotate(0 100 150)', barColor: '#8FA892' }
  else if (h >= 65) p = { status: 'Sana y fuerte', sub: 'Buen ritmo, seguid así', stem: '#6E8A6E', leaf: '#7E9B80', leaf2: '#8FA892', flowerOp: '0', flower: '#E8B4A0', droop: 'rotate(0 100 150)', barColor: '#8FA892' }
  else if (h >= 45) p = { status: 'Creciendo', sub: 'Vais por buen camino', stem: '#7E9270', leaf: '#9DAE7E', leaf2: '#AEB988', flowerOp: '0', flower: '#E8B4A0', droop: 'rotate(2 100 150)', barColor: '#B8A86A' }
  else if (h >= 22) p = { status: 'Le falta agua', sub: 'No la dejéis sola', stem: '#A38F5E', leaf: '#BBA968', leaf2: '#C9B97E', flowerOp: '0', flower: '#E8B4A0', droop: 'rotate(7 100 150)', barColor: '#C99A4E' }
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
  emoji: string
  text: string
  opacity: string
  textColor: string
  badge: string
  badgeColor: string
  badgeBg: string
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
  const totalPoints = scoreA + scoreB

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

  // rewards — unlocked once the cumulative total reaches their cost
  const rewSorted = data.rewards.slice().sort((a, b) => a.cost - b.cost)
  const nextReward: Reward | undefined = rewSorted.find((r) => totalPoints < r.cost)
  const rewardRows: RewardRow[] = rewSorted.map((r) => {
    const unlocked = totalPoints >= r.cost
    return {
      emoji: r.emoji,
      text: r.text,
      opacity: unlocked ? '1' : '0.5',
      textColor: unlocked ? '#2C2C28' : '#9A968C',
      badge: unlocked ? 'Lista' : `${r.cost} pts`,
      badgeColor: unlocked ? '#fff' : '#B8896A',
      badgeBg: unlocked ? '#8FA892' : 'rgba(184,137,106,0.12)',
    }
  })
  const rewardEdits = rewSorted

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
    leaderA: scoreA > scoreB && scoreA > 0,
    leaderB: scoreB > scoreA && scoreB > 0,
    todayA,
    todayB,
    countA: `· ${todayA.length}${todayA.length === 1 ? ' tarea' : ' tareas'}`,
    countB: `· ${todayB.length}${todayB.length === 1 ? ' tarea' : ' tareas'}`,
    plant: plantInfo(data, now),
    nextReward,
    nextRemaining: nextReward ? nextReward.cost - totalPoints : 0,
    nextPct: nextReward ? `${Math.min(100, Math.round((totalPoints / nextReward.cost) * 100))}%` : '0%',
    rewardRows,
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

/** Toggle a completion immutably; returns the new completions map. */
export function toggleCompletion(data: HouseholdData, t: Task, now: Date): { completions: HouseholdData['completions']; wasComplete: boolean; isComplete: boolean } {
  const key = localKey(now)
  const wa = weekAssign(data, now)
  const who: Slot = wa[key] ? wa[key][t.id] : 'a'
  const comp = { ...data.completions }
  const day = { ...(comp[key] || {}) }
  if (day[t.id]) delete day[t.id]
  else day[t.id] = { p: who, t: Date.now() }
  if (Object.keys(day).length) comp[key] = day
  else delete comp[key]
  const after: HouseholdData = { ...data, completions: comp }
  return {
    completions: comp,
    wasComplete: dayComplete(data, now) === true,
    isComplete: dayComplete(after, now) === true,
  }
}
