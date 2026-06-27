import { useState } from 'react'
import type { HouseholdData } from '../types'
import { computeHistory, type Period, shiftAnchor } from '../lib/history'
import { card, SYS } from './styles'
import { segGroup, segStyle } from './Sheet'

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

      {/* per-person summary */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ ...card, display: 'flex', overflow: 'hidden' }}>
          <SummaryCell color={h.colorA} name={h.nameA} count={h.countA} points={h.totalA} />
          <div style={{ width: 1, background: 'rgba(0,0,0,0.06)' }} />
          <SummaryCell color={h.colorB} name={h.nameB} count={h.countB} points={h.totalB} />
        </div>
      </div>

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
                      <span style={{ fontSize: 20, lineHeight: 1, width: 22, textAlign: 'center' }}>{it.emoji}</span>
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
    <div style={{ flex: 1, padding: '14px 10px 16px', textAlign: 'center' }}>
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
