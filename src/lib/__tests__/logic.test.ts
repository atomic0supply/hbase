import { describe, expect, it } from 'vitest'
import type { Household, HouseholdData, Slot } from '../../types'
import { computeModel, localKey, plantInfo, weekAssign } from '../logic'
import { computeHistory } from '../history'
import { CATALOG_TASKS } from '../defaults'

function makeHousehold(slots: string[], over: Partial<HouseholdData> = {}): Household {
  const people: Household['people'] = {}
  const memberSlots: Record<string, Slot> = {}
  slots.forEach((s, i) => {
    people[s] = { name: s.toUpperCase(), color: '#000', photo: null }
    memberSlots[`u${i}`] = s
  })
  return {
    people,
    tasks: CATALOG_TASKS.filter((t) => ['d1', 'd2', 'd3', 'd4', 'd5', 'w1', 'w2', 'w4'].includes(t.id)).map((t) => ({ ...t })),
    rewards: [],
    completions: {},
    redemptions: [],
    members: slots.map((_, i) => `u${i}`),
    memberSlots,
    inviteCode: null,
    createdBy: 'u0',
    createdAt: 0,
    updatedAt: 0,
    ...over,
  }
}

const REF = new Date(2026, 5, 24) // a fixed Wednesday

describe('weekAssign', () => {
  it('is deterministic', () => {
    const hh = makeHousehold(['a', 'b', 'c'])
    expect(JSON.stringify(weekAssign(hh, REF))).toBe(JSON.stringify(weekAssign(hh, REF)))
  })

  it('assigns every scheduled task to an active slot only', () => {
    const slots = ['a', 'b', 'c', 'd']
    const hh = makeHousehold(slots)
    const wa = weekAssign(hh, REF)
    Object.values(wa).forEach((day) => {
      Object.values(day).forEach((slot) => expect(slots).toContain(slot))
    })
  })

  it('spreads the load across N members (nobody gets everything)', () => {
    const hh = makeHousehold(['a', 'b', 'c'])
    const wa = weekAssign(hh, REF)
    const load: Record<string, number> = { a: 0, b: 0, c: 0 }
    Object.values(wa).forEach((day) =>
      Object.entries(day).forEach(([tid, slot]) => {
        const t = hh.tasks.find((x) => x.id === tid)!
        load[slot] += t.points
      }),
    )
    const vals = Object.values(load)
    const spread = Math.max(...vals) - Math.min(...vals)
    expect(spread).toBeLessThanOrEqual(6) // reasonably balanced over the week
    vals.forEach((v) => expect(v).toBeGreaterThan(0))
  })

  it('two-person households still balance', () => {
    const hh = makeHousehold(['a', 'b'])
    const wa = weekAssign(hh, REF)
    const load: Record<string, number> = { a: 0, b: 0 }
    Object.values(wa).forEach((day) =>
      Object.entries(day).forEach(([tid, slot]) => {
        load[slot] += hh.tasks.find((x) => x.id === tid)!.points
      }),
    )
    expect(Math.abs(load.a - load.b)).toBeLessThanOrEqual(4)
  })
})

describe('computeModel', () => {
  it('produces one member per active slot, credited to the tapper', () => {
    const k = localKey(REF)
    const hh = makeHousehold(['a', 'b', 'c'], {
      completions: { [k]: { d1: { p: 'c', t: 1 }, d2: { p: 'c', t: 1 }, d3: { p: 'a', t: 1 } } },
    })
    const m = computeModel(hh, REF, 'a')
    expect(m.members.map((x) => x.slot)).toEqual(['a', 'b', 'c'])
    const c = m.members.find((x) => x.slot === 'c')!
    const a = m.members.find((x) => x.slot === 'a')!
    expect(c.score).toBe(3) // d1(2)+d2(1)
    expect(a.score).toBe(2) // d3(2)
    expect(c.isLeader).toBe(true)
    expect(a.isLeader).toBe(false)
  })

  it('balance is per-viewer (earned − own redemptions)', () => {
    const k = localKey(REF)
    const hh = makeHousehold(['a', 'b'], {
      completions: { [k]: { d1: { p: 'a', t: 1 }, d3: { p: 'a', t: 1 } } }, // a earns 4
      redemptions: [{ id: 'r', rewardId: 'x', emoji: 'gift', text: 'X', cost: 3, by: 'a', t: 1, used: false }],
    })
    expect(computeModel(hh, REF, 'a').balance).toBe(1) // 4 − 3
    expect(computeModel(hh, REF, 'b').balance).toBe(0)
  })
})

describe('plantInfo', () => {
  it('one bad day inside a good history does not collapse the plant', () => {
    const hh = makeHousehold(['a', 'b'])
    const comp: HouseholdData['completions'] = {}
    const sched = ['d1', 'd2', 'd3', 'd4', 'd5'] // daily tasks
    for (let d = 1; d <= 10; d++) {
      const day = new Date(REF)
      day.setDate(REF.getDate() - d)
      comp[localKey(day)] = d === 4 ? {} : Object.fromEntries(sched.map((id) => [id, { p: 'a' as Slot, t: 1 }]))
    }
    hh.completions = comp
    const h = parseInt(plantInfo(hh, REF).barW, 10)
    expect(h).toBeGreaterThanOrEqual(65)
  })

  it('never collapses to 0 (floor) when nothing is done', () => {
    const hh = makeHousehold(['a', 'b'])
    const comp: HouseholdData['completions'] = {}
    for (let d = 1; d <= 10; d++) {
      const day = new Date(REF)
      day.setDate(REF.getDate() - d)
      comp[localKey(day)] = {}
    }
    hh.completions = comp
    expect(parseInt(plantInfo(hh, REF).barW, 10)).toBeGreaterThanOrEqual(10)
  })
})

describe('computeHistory', () => {
  it('aggregates counts per member slot', () => {
    const k = localKey(REF)
    const hh = makeHousehold(['a', 'b', 'c'], {
      completions: { [k]: { d1: { p: 'a', t: 1 }, d2: { p: 'b', t: 1 }, d3: { p: 'a', t: 1 } } },
    })
    const h = computeHistory(hh, 'week', REF, REF)
    expect(h.members.map((m) => m.slot)).toEqual(['a', 'b', 'c'])
    expect(h.members.find((m) => m.slot === 'a')!.count).toBe(2)
    expect(h.members.find((m) => m.slot === 'b')!.count).toBe(1)
    expect(h.members.find((m) => m.slot === 'c')!.count).toBe(0)
  })
})
