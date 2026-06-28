import { useState } from 'react'
import type { HouseholdData } from '../types'
import { type ChartBar, computeHistory, type HistoryMember, type Period, shiftAnchor } from '../lib/history'
import { card, SYS } from './styles'
import { segGroup, segStyle } from './Sheet'
import { Glyph } from './Icon'

export function HistoryView({ data, onClose }: { data: HouseholdData; onClose: () => void }) {
  const [period, setPeriod] = useState<Period>('week')
  const [anchor, setAnchor] = useState<Date>(() => new Date())
  const h = computeHistory(data, period, anchor, new Date())

  const changePeriod = (p: Period) => {
    setPeriod(p)
    setAnchor(new Date()) // reset to current when switching unit
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 55, background: '#F4F0E8', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ height: 'env(safe-area-inset-top)' }} />

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px 6px' }}>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', font: `500 16px ${SYS}`, color: '#B8896A', cursor: 'pointer' }}>
          ‹ Atrás
        </button>
        <span style={{ font: `700 18px ${SYS}`, color: '#2C2C28' }}>Historial</span>
        <span style={{ width: 52 }} />
      </div>

      {/* period unit */}
      <div style={{ padding: '4px 16px 0' }}>
        <div style={segGroup}>
          {(['week', 'month'] as Period[]).map((p) => (
            <button key={p} type="button" onClick={() => changePeriod(p)} style={segStyle(period === p)}>
              {p === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* period navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px 8px' }}>
        <NavArrow dir="prev" onClick={() => setAnchor(shiftAnchor(period, anchor, -1))} disabled={!h.canPrev} />
        <span style={{ font: `700 17px ${SYS}`, color: '#2C2C28', textTransform: 'capitalize' }}>{h.label}</span>
        <NavArrow dir="next" onClick={() => setAnchor(shiftAnchor(period, anchor, 1))} disabled={!h.canNext} />
      </div>

      {/* per-member summary */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ ...card, display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}>
          {h.members.map((m) => (
            <SummaryCell key={m.slot} color={m.color} name={m.name} count={m.count} points={m.total} />
          ))}
        </div>
      </div>

      {/* stacked bar chart */}
      {h.members.some((m) => m.count > 0) && (
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ ...card, padding: '14px 14px 10px' }}>
            <BarChart bars={h.chart} members={h.members} period={period} />
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
              {h.members.map((m) => (
                <Legend key={m.slot} color={m.color} name={m.name} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* daily log */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 16px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
        {h.days.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', font: `400 15px/1.5 ${SYS}`, color: '#B3AEA3' }}>
            Aún no hay tareas completadas en este periodo.
          </div>
        ) : (
          h.days.map((day) => (
            <div key={day.dateKey} style={{ marginBottom: 18 }}>
              <div style={{ font: `600 12px/1 ${SYS}`, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9A968C', margin: '0 0 8px 4px' }}>
                {day.dateLabel}
              </div>
              <div style={{ ...card, overflow: 'hidden' }}>
                {day.items.map((it, i) => (
                  <div key={it.key}>
                    {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 52 }} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px' }}>
                      <span style={{ flex: 'none', display: 'flex', width: 22, justifyContent: 'center' }}>
                        <Glyph taskId={it.taskId} value={it.emoji} size={21} color="#6E6A60" />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', font: `500 15px/1.25 ${SYS}`, color: '#2C2C28' }}>{it.name}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: it.color }} />
                          <span style={{ font: `400 12px ${SYS}`, color: '#A29D93' }}>
                            {it.whoName}
                            {it.timeLabel ? ` · ${it.timeLabel}` : ''}
                          </span>
                        </span>
                      </span>
                      <span style={{ flex: 'none', font: `600 12px ${SYS}`, color: '#B8896A', background: 'rgba(184,137,106,0.10)', padding: '3px 9px', borderRadius: 8 }}>
                        +{it.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function SummaryCell({ color, name, count, points }: { color: string; name: string; count: number; points: number }) {
  return (
    <div style={{ flex: '1 1 0', minWidth: 84, padding: '14px 10px 16px', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />
        <span style={{ font: `600 14px ${SYS}`, color: '#2C2C28' }}>{name}</span>
      </div>
      <div style={{ font: `700 28px/1.1 ${SYS}`, color, marginTop: 6 }}>{points}</div>
      <div style={{ font: `400 12px ${SYS}`, color: '#A9A49A', marginTop: 1 }}>
        {points === 1 ? 'punto' : 'puntos'} · {count} {count === 1 ? 'tarea' : 'tareas'}
      </div>
    </div>
  )
}

function Legend({ color, name }: { color: string; name: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 9, height: 9, borderRadius: 3, background: color }} />
      <span style={{ font: `500 12px ${SYS}`, color: '#6E6A60' }}>{name}</span>
    </span>
  )
}

function BarChart({ bars, members, period }: { bars: ChartBar[]; members: HistoryMember[]; period: Period }) {
  const dayTotal = (b: ChartBar) => members.reduce((s, m) => s + (b.counts[m.slot] || 0), 0)
  const max = Math.max(1, ...bars.map(dayTotal))
  const H = 76
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: period === 'week' ? 8 : 3, height: H + 16 }}>
      {bars.map((b, i) => {
        const showLabel = period === 'week' || i === 0 || Number(b.label) % 5 === 0
        const segs = members.map((m) => ({ color: m.color, v: b.counts[m.slot] || 0 })).filter((s) => s.v > 0)
        const tot = segs.reduce((s, x) => s + x.v, 0)
        return (
          <div key={i} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ height: H, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: period === 'week' ? 26 : '78%' }}>
              <div style={{ height: tot > 0 ? Math.max(3, (tot / max) * H) : 0, borderRadius: '4px 4px 0 0', overflow: 'hidden', display: 'flex', flexDirection: 'column-reverse' }}>
                {segs.map((s, j) => (
                  <div key={j} style={{ flex: s.v, background: s.color }} />
                ))}
              </div>
            </div>
            <div style={{ font: `500 10px ${SYS}`, color: '#A9A49A', height: 12 }}>{showLabel ? b.label : ''}</div>
          </div>
        )
      })}
    </div>
  )
}

function NavArrow({ dir, onClick, disabled }: { dir: 'prev' | 'next'; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: 'none',
        background: disabled ? 'transparent' : '#FFFFFF',
        boxShadow: disabled ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
        color: disabled ? '#D8D2C6' : '#6E6A60',
        font: `400 20px ${SYS}`,
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {dir === 'prev' ? '‹' : '›'}
    </button>
  )
}
