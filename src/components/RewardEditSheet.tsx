import { useState } from 'react'
import type { Reward, RewardDraft } from '../types'
import { SYS } from './styles'
import { deleteBtn, emojiPickStyle, Sheet, stepperBtn, subLabel } from './Sheet'
import { Icon, resolveIcon, REWARD_ICON_CHOICES } from './Icon'

interface Props {
  initial: RewardDraft
  onClose: () => void
  onSave: (r: Reward) => void
  onDelete: (id: string) => void
}

export function RewardEditSheet({ initial, onClose, onSave, onDelete }: Props) {
  const [e, setE] = useState<RewardDraft>(initial)
  const set = <K extends keyof RewardDraft>(k: K, v: RewardDraft[K]) => setE((prev) => ({ ...prev, [k]: v }))

  const current = resolveIcon(e.emoji) ?? 'gift'

  const save = () => {
    onSave({
      id: e.id,
      emoji: e.emoji || 'gift',
      text: (e.text || '').trim() || 'Recompensa',
      cost: e.cost,
    })
  }

  return (
    <Sheet title={e._new ? 'Nueva recompensa' : 'Editar recompensa'} onClose={onClose} onSave={save}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 2px' }}>
        <Icon name={current} size={46} color="#B8896A" />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', padding: '10px 2px 4px' }}>
        {REWARD_ICON_CHOICES.map((name) => (
          <button key={name} type="button" onClick={() => set('emoji', name)} style={emojiPickStyle(current === name)}>
            <Icon name={name} size={22} color="#6E6A60" />
          </button>
        ))}
      </div>

      <div style={{ marginTop: 14, background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '11px 16px 12px' }}>
          <div style={{ font: `600 11px/1 ${SYS}`, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#A9A49A' }}>
            La recompensa
          </div>
          <input
            value={e.text}
            onChange={(ev) => set('text', ev.target.value)}
            placeholder="Cena fuera"
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', font: `500 16px ${SYS}`, color: '#2C2C28', marginTop: 4 }}
          />
        </div>
      </div>

      <div style={subLabel}>Coste en puntos</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', borderRadius: 16, padding: '11px 14px 11px 18px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <span style={{ font: `500 15px ${SYS}`, color: '#6E6A60' }}>Al llegar a {e.cost} pts en total</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button type="button" onClick={() => set('cost', Math.max(5, e.cost - 5))} style={stepperBtn}>
            −
          </button>
          <span style={{ font: `700 19px ${SYS}`, width: 30, textAlign: 'center' }}>{e.cost}</span>
          <button type="button" onClick={() => set('cost', Math.min(200, e.cost + 5))} style={stepperBtn}>
            +
          </button>
        </div>
      </div>

      {!e._new && (
        <button type="button" onClick={() => onDelete(e.id)} style={deleteBtn}>
          Eliminar recompensa
        </button>
      )}
    </Sheet>
  )
}
