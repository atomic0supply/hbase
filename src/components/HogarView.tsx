import type { Reward } from '../types'
import type { ViewModel } from '../lib/logic'
import { Plant } from './Plant'
import { card, cardLg, eyebrow, h1, sectionLabel, SYS } from './styles'
import { Glyph } from './Icon'
import { Avatar } from './Avatar'

export function HogarView({
  model,
  onOpenHistory,
  onRedeem,
  onUse,
}: {
  model: ViewModel
  onOpenHistory: () => void
  onRedeem: (r: Reward) => void
  onUse: (redemptionId: string) => void
}) {
  const { plant, nextReward } = model
  return (
    <div>
      <div style={{ padding: '14px 22px 2px' }}>
        <div style={eyebrow}>El hogar</div>
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

      {/* scoreboard — podium ranked by points */}
      <div style={{ margin: '18px 16px 0' }}>
        <div style={sectionLabel}>Marcador total</div>
        <div style={{ ...card, overflow: 'hidden' }}>
          {[...model.members]
            .sort((a, b) => b.score - a.score)
            .map((m, i) => (
              <div key={m.slot}>
                {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 54 }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <span style={{ width: 22, textAlign: 'center', fontSize: i < 3 && m.score > 0 ? 18 : 14, font: i < 3 && m.score > 0 ? undefined : `600 13px ${SYS}`, color: '#9A968C' }}>
                    {m.score > 0 && i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                  </span>
                  <Avatar name={m.name} color={m.color} photo={m.photo} size={30} />
                  <span style={{ flex: 1, minWidth: 0, font: `600 16px ${SYS}`, color: '#2C2C28', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.name}
                  </span>
                  <span style={{ font: `700 20px ${SYS}`, color: m.color }}>{m.score}</span>
                  <span style={{ font: `400 12px ${SYS}`, color: '#A9A49A' }}>pts</span>
                </div>
              </div>
            ))}
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
        <div style={sectionLabel}>Recompensas · tu saldo {model.balance} pts</div>
        {nextReward && (
          <div style={{ ...card, padding: '16px 18px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 'none', display: 'flex' }}><Glyph value={nextReward.emoji} size={26} color="#B8896A" /></span>
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
            <div key={r.reward.id}>
              {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 54 }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px' }}>
                <span style={{ flex: 'none', display: 'flex', opacity: r.opacity }}><Glyph value={r.emoji} size={22} color="#6E6A60" /></span>
                <span style={{ flex: 1, minWidth: 0, font: `500 16px ${SYS}`, color: r.textColor }}>{r.text}</span>
                {r.affordable ? (
                  <button
                    type="button"
                    onClick={() => onRedeem(r.reward)}
                    style={{
                      flex: 'none',
                      font: `600 12px ${SYS}`,
                      color: '#fff',
                      background: '#8FA892',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: 999,
                      cursor: 'pointer',
                    }}
                  >
                    Canjear
                  </button>
                ) : (
                  <span style={{ flex: 'none', font: `600 12px ${SYS}`, color: r.badgeColor, background: r.badgeBg, padding: '4px 10px', borderRadius: 999 }}>
                    {r.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* your inventory ("lista de uso") */}
        {model.myInventory.length > 0 && (
          <>
            <div style={{ ...sectionLabel, margin: '18px 0 8px 4px' }}>Tu lista de uso</div>
            <div style={{ ...card, overflow: 'hidden' }}>
              {model.myInventory.map((g, i) => (
                <div key={g.rewardId}>
                  {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 54 }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 16px' }}>
                    <span style={{ flex: 'none', display: 'flex' }}><Glyph value={g.emoji} size={22} color="#6E6A60" /></span>
                    <span style={{ flex: 1, minWidth: 0, font: `500 16px ${SYS}`, color: '#2C2C28' }}>
                      {g.text}
                      {g.count > 1 && <span style={{ font: `600 13px ${SYS}`, color: '#B8896A' }}> ×{g.count}</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUse(g.oldestId)}
                      style={{ flex: 'none', font: `600 12px ${SYS}`, color: '#B8896A', background: 'rgba(184,137,106,0.12)', border: 'none', padding: '6px 14px', borderRadius: 999, cursor: 'pointer' }}
                    >
                      Usar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {model.othersUnusedCount > 0 && (
              <div style={{ font: `400 12px ${SYS}`, color: '#B3AEA3', margin: '8px 0 0 4px' }}>
                Otros tienen {model.othersUnusedCount} sin usar.
              </div>
            )}
          </>
        )}

        {/* redemption history */}
        {model.redemptionRows.length > 0 && (
          <>
            <div style={{ ...sectionLabel, margin: '18px 0 8px 4px' }}>Historial de canjes</div>
            <div style={{ ...card, overflow: 'hidden' }}>
              {model.redemptionRows.map((r, i) => (
                <div key={i}>
                  {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 54 }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 16px', opacity: r.used ? 0.6 : 1 }}>
                    <span style={{ flex: 'none', display: 'flex' }}><Glyph value={r.emoji} size={21} color="#6E6A60" /></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', font: `500 15px ${SYS}`, color: '#2C2C28' }}>{r.text}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: r.color }} />
                        <span style={{ font: `400 12px ${SYS}`, color: '#A29D93' }}>
                          {r.whoName} · {r.dateLabel}
                          {r.used ? ' · usada' : ''}
                        </span>
                      </span>
                    </span>
                    <span style={{ flex: 'none', font: `600 12px ${SYS}`, color: '#B8896A' }}>−{r.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
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

