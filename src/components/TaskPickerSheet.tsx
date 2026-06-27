import type { Task } from '../types'
import { CATALOG_TASKS, DAY_LONG } from '../lib/defaults'
import { SYS } from './styles'
import { Glyph } from './Icon'

/** Pick any catalog task (active or not) to log it as done today — credited to you. */
export function TaskPickerSheet({
  doneIds,
  onPick,
  onClose,
}: {
  doneIds: string[]
  onPick: (t: Task) => void
  onClose: () => void
}) {
  const done = new Set(doneIds)
  const sorted = CATALOG_TASKS.slice().sort((a, b) => {
    const fa = a.freq === 'daily' ? 0 : 1
    const fb = b.freq === 'daily' ? 0 : 1
    if (fa !== fb) return fa - fb
    if (a.freq === 'weekly' && b.freq === 'weekly') return a.day - b.day
    return 0
  })

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,24,0.42)', animation: 'fadeIn 0.25s ease' }} />
      <div
        style={{
          position: 'relative',
          background: '#F4F0E8',
          borderRadius: '24px 24px 0 0',
          maxHeight: '88vh',
          overflowY: 'auto',
          animation: 'sheetUp 0.34s cubic-bezier(0.16,1,0.3,1)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 18px)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '9px 0 2px' }}>
          <div style={{ width: 38, height: 5, borderRadius: 999, background: 'rgba(0,0,0,0.14)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 18px 4px' }}>
          <span style={{ width: 50 }} />
          <span style={{ font: `600 16px ${SYS}`, color: '#2C2C28' }}>¿Qué hiciste?</span>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', font: `700 16px ${SYS}`, color: '#B8896A', cursor: 'pointer' }}>
            Listo
          </button>
        </div>
        <div style={{ font: `400 13px/1.4 ${SYS}`, color: '#9A968C', textAlign: 'center', padding: '0 24px 10px' }}>
          Marca cualquier tarea que hayas hecho, aunque no estuviera asignada hoy. Te suma los puntos.
        </div>

        <div style={{ padding: '0 16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            {sorted.map((t, i) => {
              const isDone = done.has(t.id)
              const sched = t.freq === 'daily' ? 'Cada día' : `Cada ${DAY_LONG[t.day]}`
              return (
                <div key={t.id}>
                  {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 54 }} />}
                  <button
                    type="button"
                    onClick={() => onPick(t)}
                    style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <span style={{ flex: 'none', display: 'flex', width: 24, justifyContent: 'center' }}>
                      <Glyph taskId={t.id} value={t.emoji} size={22} color={isDone ? '#B0AB9F' : '#6E6A60'} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', font: `500 16px/1.2 ${SYS}`, color: isDone ? '#B0AB9F' : '#2C2C28', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {t.name}
                      </span>
                      <span style={{ display: 'block', font: `400 13px ${SYS}`, color: '#A29D93', marginTop: 1 }}>
                        {t.zone} · {sched} · {t.points} pt
                      </span>
                    </span>
                    <span
                      style={{
                        flex: 'none',
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        border: `1.5px solid ${isDone ? '#8FA892' : 'rgba(44,44,40,0.22)'}`,
                        background: isDone ? '#8FA892' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isDone && (
                        <svg width="14" height="14" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
