import { useState } from 'react'
import type { Assign, Freq, Task, TaskDraft } from '../types'
import { DAY_LONG, DAY_SHORT, EMOJIS, ZONES } from '../lib/defaults'
import { SYS } from './styles'
import { deleteBtn, emojiPickStyle, hintText, segGroup, segStyle, Sheet, stepperBtn, subLabel } from './Sheet'

interface Props {
  initial: TaskDraft
  nameA: string
  nameB: string
  onClose: () => void
  onSave: (t: Task) => void
  onDelete: (id: string) => void
}

export function TaskEditSheet({ initial, nameA, nameB, onClose, onSave, onDelete }: Props) {
  const [e, setE] = useState<TaskDraft>(initial)
  const set = <K extends keyof TaskDraft>(k: K, v: TaskDraft[K]) => setE((prev) => ({ ...prev, [k]: v }))

  const save = () => {
    onSave({
      id: e.id,
      emoji: e.emoji || '🧽',
      name: (e.name || '').trim() || 'Tarea',
      zone: (e.zone || '').trim() || 'General',
      freq: e.freq,
      day: e.day,
      assign: e.assign,
      points: e.points,
    })
  }

  return (
    <Sheet title={e._new ? 'Nueva tarea' : 'Editar tarea'} onClose={onClose} onSave={save}>
      <div style={{ textAlign: 'center', padding: '6px 0 2px', fontSize: 50, lineHeight: 1 }}>{e.emoji}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', padding: '10px 2px 4px' }}>
        {EMOJIS.map((ch) => (
          <button key={ch} type="button" onClick={() => set('emoji', ch)} style={emojiPickStyle(e.emoji === ch)}>
            {ch}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 14, background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '11px 16px 12px' }}>
          <div style={fieldLabel}>Nombre</div>
          <input
            value={e.name}
            onChange={(ev) => set('name', ev.target.value)}
            placeholder="Fregar los platos"
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', font: `500 16px ${SYS}`, color: '#2C2C28', marginTop: 4 }}
          />
        </div>
        <div style={{ height: 1, background: 'rgba(0,0,0,0.07)' }} />
        <div style={{ padding: '11px 16px 13px' }}>
          <div style={fieldLabel}>Zona</div>
          <input
            value={e.zone}
            onChange={(ev) => set('zone', ev.target.value)}
            placeholder="Cocina"
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', font: `500 16px ${SYS}`, color: '#2C2C28', margin: '4px 0 8px' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ZONES.map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => set('zone', z)}
                style={{
                  padding: '5px 11px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  font: `500 13px ${SYS}`,
                  background: e.zone === z ? '#B8896A' : '#EDE7DC',
                  color: e.zone === z ? '#FFFFFF' : '#6E6A60',
                }}
              >
                {z}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={subLabel}>Frecuencia</div>
      <div style={segGroup}>
        {(['daily', 'weekly'] as Freq[]).map((f) => (
          <button key={f} type="button" onClick={() => set('freq', f)} style={segStyle(e.freq === f)}>
            {f === 'daily' ? 'Diaria' : 'Semanal'}
          </button>
        ))}
      </div>
      {e.freq === 'weekly' && (
        <>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {DAY_SHORT.map((lbl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => set('day', i)}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  font: `600 13px ${SYS}`,
                  background: e.day === i ? '#B8896A' : '#FFFFFF',
                  color: e.day === i ? '#FFFFFF' : '#6E6A60',
                }}
              >
                {lbl}
              </button>
            ))}
          </div>
          <div style={hintText}>Se reparte cada semana los {DAY_LONG[e.day]}.</div>
        </>
      )}

      <div style={subLabel}>Quién la hace</div>
      <div style={segGroup}>
        {(
          [
            { v: 'rotate' as Assign, label: 'Equilibra' },
            { v: 'a' as Assign, label: nameA },
            { v: 'b' as Assign, label: nameB },
          ]
        ).map((s) => (
          <button key={s.v} type="button" onClick={() => set('assign', s.v)} style={segStyle(e.assign === s.v)}>
            {s.label}
          </button>
        ))}
      </div>
      <div style={hintText}>
        {e.assign === 'rotate' ? 'La app reparte para igualar los puntos de la semana.' : 'Siempre la misma persona.'}
      </div>

      <div style={subLabel}>Esfuerzo</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', borderRadius: 16, padding: '11px 14px 11px 18px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <span style={{ font: `500 15px ${SYS}`, color: '#6E6A60' }}>
          Vale {e.points} {e.points === 1 ? 'punto' : 'puntos'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button type="button" onClick={() => set('points', Math.max(1, e.points - 1))} style={stepperBtn}>
            −
          </button>
          <span style={{ font: `700 19px ${SYS}`, width: 16, textAlign: 'center' }}>{e.points}</span>
          <button type="button" onClick={() => set('points', Math.min(5, e.points + 1))} style={stepperBtn}>
            +
          </button>
        </div>
      </div>

      {!e._new && (
        <button type="button" onClick={() => onDelete(e.id)} style={deleteBtn}>
          Eliminar tarea
        </button>
      )}
    </Sheet>
  )
}

const fieldLabel: React.CSSProperties = {
  font: `600 11px/1 ${SYS}`,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#A9A49A',
}
