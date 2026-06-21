import type { Task } from '../types'
import type { TaskRow, ViewModel } from '../lib/logic'
import { card, eyebrow, h1, SYS } from './styles'

function CheckRow({ row, first, onToggle }: { row: TaskRow; first: boolean; onToggle: (t: Task) => void }) {
  return (
    <div>
      {!first && <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 55 }} />}
      <button
        type="button"
        onClick={() => onToggle(row.task)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 13,
          width: '100%',
          padding: '13px 16px',
          background: 'transparent',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            flex: 'none',
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: `1.5px solid ${row.borderColor}`,
            background: row.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          {row.done && (
            <svg width="14" height="14" viewBox="0 0 24 24" style={{ animation: 'pop 0.3s ease' }}>
              <path d="M5 13l4 4L19 7" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span style={{ fontSize: 21, lineHeight: 1 }}>{row.emoji}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', font: `500 16px/1.25 ${SYS}`, color: row.nameColor, textDecoration: row.deco }}>
            {row.name}
          </span>
          <span style={{ display: 'block', font: `400 13px/1.3 ${SYS}`, color: '#A29D93', marginTop: 1 }}>{row.sub}</span>
        </span>
        <span
          style={{
            flex: 'none',
            font: `600 12px ${SYS}`,
            color: '#B8896A',
            background: 'rgba(184,137,106,0.10)',
            padding: '3px 9px',
            borderRadius: 8,
          }}
        >
          {row.pointsBadge}
        </span>
      </button>
    </div>
  )
}

function PersonSection({
  color,
  name,
  count,
  rows,
  onToggle,
}: {
  color: string
  name: string
  count: string
  rows: TaskRow[]
  onToggle: (t: Task) => void
}) {
  return (
    <div style={{ margin: '22px 16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 8px 4px' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, display: 'inline-block' }} />
        <span style={{ font: `600 13px/1 ${SYS}`, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#6E6A60' }}>
          {name}
        </span>
        <span style={{ font: `500 12px ${SYS}`, color: '#B3AEA3' }}>{count}</span>
      </div>
      <div style={{ ...card, overflow: 'hidden' }}>
        {rows.length > 0 ? (
          rows.map((r, i) => <CheckRow key={r.task.id} row={r} first={i === 0} onToggle={onToggle} />)
        ) : (
          <div style={{ padding: '18px 16px', font: `400 15px ${SYS}`, color: '#B3AEA3', textAlign: 'center' }}>
            Nada para hoy ✨
          </div>
        )}
      </div>
    </div>
  )
}

export function HoyView({ model, onToggle }: { model: ViewModel; onToggle: (t: Task) => void }) {
  return (
    <div>
      <div style={{ padding: '14px 22px 2px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={eyebrow}>{model.dateLabel}</div>
          <h1 style={h1}>Hoy</h1>
        </div>
        <span
          style={{
            font: `600 13px ${SYS}`,
            color: '#B8896A',
            background: 'rgba(184,137,106,0.12)',
            padding: '5px 12px',
            borderRadius: 999,
          }}
        >
          🔥 {model.streak} juntos
        </span>
      </div>

      <div
        style={{
          ...card,
          margin: '12px 16px 0',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <svg width="82" height="82" viewBox="0 0 100 100" style={{ flex: 'none' }}>
          <circle cx="50" cy="50" r="42" fill="none" stroke="#ECE6DB" strokeWidth="9" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#B8896A"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray="264"
            style={{
              strokeDashoffset: model.ringOffset,
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
            }}
          />
          <text x="50" y="51" textAnchor="middle" dominantBaseline="central" style={{ font: `700 21px ${SYS}`, fill: '#2C2C28' }}>
            {model.progressPctLabel}
          </text>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ font: `700 22px/1.1 ${SYS}`, color: '#2C2C28' }}>{model.progressTitle}</div>
          <div style={{ font: `400 14px ${SYS}`, color: '#9A968C', marginTop: 2 }}>tareas de hoy</div>
          <div style={{ font: `600 14px ${SYS}`, color: '#8FA892', marginTop: 6 }}>{model.progressSubtitle}</div>
        </div>
      </div>

      <PersonSection color={model.colorA} name={model.nameA} count={model.countA} rows={model.todayA} onToggle={onToggle} />
      <PersonSection color={model.colorB} name={model.nameB} count={model.countB} rows={model.todayB} onToggle={onToggle} />
    </div>
  )
}
