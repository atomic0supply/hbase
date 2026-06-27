import type { ViewModel } from '../lib/logic'
import { Plant } from './Plant'
import { card, cardLg, eyebrow, h1, sectionLabel, SYS } from './styles'

export function HogarView({ model, onOpenHistory }: { model: ViewModel; onOpenHistory: () => void }) {
  const { plant, nextReward } = model
  return (
    <div>
      <div style={{ padding: '14px 22px 2px' }}>
        <div style={eyebrow}>Vuestro hogar</div>
        <h1 style={h1}>Hogar</h1>
      </div>

      {/* plant */}
      <div style={{ ...cardLg, margin: '14px 16px 0', padding: '18px 20px 22px', textAlign: 'center' }}>
        <Plant plant={plant} />
        <div style={{ font: `700 21px ${SYS}`, color: '#2C2C28', marginTop: 2 }}>{plant.status}</div>
        <div style={{ font: `400 14px ${SYS}`, color: '#9A968C', marginTop: 3 }}>{plant.sub}</div>
        <div style={{ height: 7, borderRadius: 999, background: '#ECE6DB', margin: '13px 8px 0', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: plant.barW,
              background: plant.barColor,
              borderRadius: 999,
              transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1), background 0.6s',
            }}
          />
        </div>
      </div>

      {/* coop streak */}
      <div style={{ ...card, margin: '14px 16px 0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 34, lineHeight: 1 }}>🔥</span>
        <div style={{ flex: 1 }}>
          <div style={{ font: `700 26px/1 ${SYS}`, color: '#2C2C28' }}>
            {model.streak} {model.streakUnit}
          </div>
          <div style={{ font: `400 13px ${SYS}`, color: '#9A968C', marginTop: 3 }}>{model.coopLine}</div>
        </div>
      </div>

      {/* scoreboard */}
      <div style={{ margin: '18px 16px 0' }}>
        <div style={sectionLabel}>Marcador total</div>
        <div style={{ ...card, display: 'flex', overflow: 'hidden' }}>
          <ScoreCell leader={model.leaderA} color={model.colorA} name={model.nameA} score={model.scoreA} />
          <div style={{ width: 1, background: 'rgba(0,0,0,0.06)' }} />
          <ScoreCell leader={model.leaderB} color={model.colorB} name={model.nameB} score={model.scoreB} />
        </div>
        <button
          type="button"
          onClick={onOpenHistory}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '13px 16px',
            borderRadius: 16,
            border: 'none',
            background: '#FFFFFF',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            color: '#6E6A60',
            font: `600 15px ${SYS}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          🗂️ Ver historial de tareas <span style={{ color: '#C9C4B8' }}>›</span>
        </button>
      </div>

      {/* rewards */}
      <div style={{ margin: '18px 16px 0' }}>
        <div style={sectionLabel}>Recompensas · {model.totalPoints} pts en total</div>
        {nextReward && (
          <div style={{ ...card, padding: '16px 18px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>{nextReward.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: `600 16px ${SYS}`, color: '#2C2C28' }}>{nextReward.text}</div>
                <div style={{ font: `400 13px ${SYS}`, color: '#9A968C', marginTop: 1 }}>
                  Próxima · faltan {model.nextRemaining} pts
                </div>
              </div>
              <span style={{ font: `600 13px ${SYS}`, color: '#B8896A' }}>{nextReward.cost}</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: '#ECE6DB', marginTop: 11, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: model.nextPct,
                  background: '#B8896A',
                  borderRadius: 999,
                  transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
                }}
              />
            </div>
          </div>
        )}
        <div style={{ ...card, overflow: 'hidden' }}>
          {model.rewardRows.map((r, i) => (
            <div key={i}>
              {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 54 }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px' }}>
                <span style={{ fontSize: 21, lineHeight: 1, opacity: r.opacity }}>{r.emoji}</span>
                <span style={{ flex: 1, minWidth: 0, font: `500 16px ${SYS}`, color: r.textColor }}>{r.text}</span>
                <span
                  style={{
                    flex: 'none',
                    font: `600 12px ${SYS}`,
                    color: r.badgeColor,
                    background: r.badgeBg,
                    padding: '4px 10px',
                    borderRadius: 999,
                  }}
                >
                  {r.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* achievements */}
      <div style={{ margin: '18px 16px 8px' }}>
        <div style={sectionLabel}>Medallas · {model.medalCount}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 }}>
          {model.medals.map((m, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                padding: '12px 4px 9px',
                textAlign: 'center',
                opacity: m.op,
              }}
            >
              <div style={{ fontSize: 25, lineHeight: 1, filter: m.filter }}>{m.emoji}</div>
              <div style={{ font: `500 10px/1.2 ${SYS}`, color: m.labelColor, marginTop: 5 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScoreCell({ leader, color, name, score }: { leader: boolean; color: string; name: string; score: number }) {
  return (
    <div style={{ flex: 1, padding: '16px 10px 18px', textAlign: 'center', position: 'relative' }}>
      {leader && (
        <div style={{ position: 'absolute', top: 7, left: '50%', transform: 'translateX(-50%)', fontSize: 16 }}>👑</div>
      )}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 15 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />
        <span style={{ font: `600 14px ${SYS}`, color: '#2C2C28' }}>{name}</span>
      </div>
      <div style={{ font: `700 32px/1 ${SYS}`, color, marginTop: 8 }}>{score}</div>
      <div style={{ font: `400 12px ${SYS}`, color: '#A9A49A', marginTop: 2 }}>puntos</div>
    </div>
  )
}
