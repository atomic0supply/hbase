import { useEffect, useRef, useState } from 'react'
import type { User } from 'firebase/auth'
import type { Household, NotifPrefs, Reward, Task } from '../types'
import type { ViewModel } from '../lib/logic'
import { card, sectionLabel, SYS } from './styles'
import { QrImage } from './QrImage'
import { NotificationsCard } from './NotificationsCard'

interface Props {
  model: ViewModel
  user: User
  household: Household
  inviteUrl: string
  pushEnabled: boolean
  notifPrefs?: NotifPrefs
  onNameA: (v: string) => void
  onNameB: (v: string) => void
  onAddTask: (t: Task) => void
  onRemoveTask: (id: string) => void
  onAddReward: () => void
  onEditReward: (r: Reward) => void
  onRestore: () => void
  onSignOut: () => void
  onLeave: () => void
  onRefreshInvite: () => void
}

export function OrganizarView(props: Props) {
  const { model, user, household, inviteUrl } = props
  const paired = household.members.length >= 2
  const code = household.inviteCode

  const [confirmRestore, setConfirmRestore] = useState(false)
  const restoreTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(restoreTimer.current), [])

  const handleRestore = () => {
    if (!confirmRestore) {
      setConfirmRestore(true)
      window.clearTimeout(restoreTimer.current)
      restoreTimer.current = window.setTimeout(() => setConfirmRestore(false), 3000)
      return
    }
    window.clearTimeout(restoreTimer.current)
    setConfirmRestore(false)
    props.onRestore()
  }

  const [copied, setCopied] = useState(false)
  const copyCode = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* noop */
    }
  }
  const share = async () => {
    if (!code) return
    const text = `Únete a nuestro Reparto del Hogar con el código ${code}\n${inviteUrl}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Reparto del Hogar', text, url: inviteUrl })
      } catch {
        /* cancelled */
      }
    } else {
      void copyCode()
    }
  }

  return (
    <div>
      <div style={{ padding: '14px 22px 2px' }}>
        <div style={{ font: `600 12px/1.3 ${SYS}`, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#B8896A' }}>
          Ajustes
        </div>
        <h1 style={{ margin: '1px 0 0', font: `700 33px/1.1 ${SYS}`, letterSpacing: '-0.02em', color: '#2C2C28' }}>
          Organizar
        </h1>
      </div>

      {/* who you are */}
      <div style={{ margin: '20px 16px 0' }}>
        <div style={sectionLabel}>Quiénes sois</div>
        <div style={{ ...card, overflow: 'hidden' }}>
          <NameRow color={model.colorA} value={model.nameA} placeholder="Persona A" hint="salvia" onInput={props.onNameA} />
          <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 42 }} />
          <NameRow color={model.colorB} value={model.nameB} placeholder="Persona B" hint="terracota" onInput={props.onNameB} />
        </div>
      </div>

      {/* pairing / account */}
      <div style={{ margin: '22px 16px 0' }}>
        <div style={sectionLabel}>Vuestra pareja</div>
        <div style={{ ...card, padding: '16px 18px' }}>
          {paired ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>💞</span>
              <div style={{ flex: 1 }}>
                <div style={{ font: `600 16px ${SYS}`, color: '#2C2C28' }}>
                  {model.nameA} y {model.nameB}
                </div>
                <div style={{ font: `400 13px ${SYS}`, color: '#9A968C', marginTop: 1 }}>Emparejados ✓ · todo se sincroniza</div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ font: `600 16px ${SYS}`, color: '#2C2C28' }}>Invita a tu pareja</div>
              <div style={{ font: `400 13px ${SYS}`, color: '#9A968C', margin: '3px 0 14px' }}>
                Que escanee el QR o introduzca el código
              </div>
              {code && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <QrImage text={inviteUrl} size={172} />
                  </div>
                  <div
                    style={{
                      font: `700 30px ${SYS}`,
                      letterSpacing: '0.18em',
                      color: '#2C2C28',
                      margin: '14px 0 2px',
                      paddingLeft: '0.18em',
                    }}
                  >
                    {code}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button type="button" onClick={copyCode} style={pillBtn(false)}>
                      {copied ? 'Copiado ✓' : 'Copiar código'}
                    </button>
                    <button type="button" onClick={share} style={pillBtn(true)}>
                      Compartir
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={props.onRefreshInvite}
                    style={{ marginTop: 12, background: 'none', border: 'none', font: `500 13px ${SYS}`, color: '#B8896A', cursor: 'pointer' }}
                  >
                    Generar código nuevo
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* account */}
        <div style={{ ...card, padding: '12px 16px', marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          {user.photoURL ? (
            <img src={user.photoURL} alt="" width={36} height={36} style={{ borderRadius: '50%' }} referrerPolicy="no-referrer" />
          ) : (
            <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#EDE7DC', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              👤
            </span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: `500 15px ${SYS}`, color: '#2C2C28', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.displayName || 'Cuenta'}
            </div>
            <div style={{ font: `400 12px ${SYS}`, color: '#A29D93', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
          </div>
          <button type="button" onClick={props.onSignOut} style={{ background: 'none', border: 'none', font: `600 13px ${SYS}`, color: '#B8896A', cursor: 'pointer' }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* notifications */}
      <NotificationsCard uid={user.uid} pushEnabled={props.pushEnabled} prefs={props.notifPrefs} />

      {/* active tasks */}
      <div style={{ margin: '22px 16px 0' }}>
        <div style={{ margin: '0 0 8px 4px' }}>
          <span style={sectionLabel as React.CSSProperties}>{model.tasksLabel}</span>
        </div>
        <div style={{ ...card, overflow: 'hidden' }}>
          {model.allTasks.length === 0 ? (
            <div style={{ padding: '18px 16px', font: `400 15px ${SYS}`, color: '#B3AEA3', textAlign: 'center' }}>
              Añade tareas desde la galería ✨
            </div>
          ) : (
            model.allTasks.map((t, i) => (
              <div key={t.task.id}>
                {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 55 }} />}
                <div style={listRowBtn as React.CSSProperties}>
                  <span style={{ fontSize: 21, lineHeight: 1, width: 24, textAlign: 'center' }}>{t.emoji}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', font: `500 16px/1.25 ${SYS}`, color: '#2C2C28' }}>{t.name}</span>
                    <span style={{ display: 'block', font: `400 13px/1.3 ${SYS}`, color: '#A29D93', marginTop: 1 }}>{t.metaSub}</span>
                  </span>
                  <button type="button" onClick={() => props.onRemoveTask(t.task.id)} style={chipBtn(false)}>
                    Quitar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* gallery of extra tasks */}
      <div style={{ margin: '22px 16px 0' }}>
        <div style={{ margin: '0 0 8px 4px' }}>
          <span style={sectionLabel as React.CSSProperties}>{model.galleryLabel}</span>
        </div>
        {model.gallery.length === 0 ? (
          <div style={{ ...card, padding: '16px 18px', font: `400 14px ${SYS}`, color: '#9A968C', textAlign: 'center' }}>
            Ya tienes todas las tareas del catálogo activas 🎉
          </div>
        ) : (
          <div style={{ ...card, overflow: 'hidden' }}>
            {model.gallery.map((t, i) => (
              <div key={t.task.id}>
                {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 55 }} />}
                <div style={listRowBtn as React.CSSProperties}>
                  <span style={{ fontSize: 21, lineHeight: 1, width: 24, textAlign: 'center', opacity: 0.85 }}>{t.emoji}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', font: `500 16px/1.25 ${SYS}`, color: '#6E6A60' }}>{t.name}</span>
                    <span style={{ display: 'block', font: `400 13px/1.3 ${SYS}`, color: '#A29D93', marginTop: 1 }}>{t.metaSub}</span>
                  </span>
                  <button type="button" onClick={() => props.onAddTask(t.task)} style={chipBtn(true)}>
                    Añadir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* rewards */}
      <div style={{ margin: '22px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 8px 4px' }}>
          <span style={sectionLabel as React.CSSProperties}>{model.rewardsLabel}</span>
          <button type="button" onClick={props.onAddReward} style={addBtn}>
            + Recompensa
          </button>
        </div>
        <div style={{ ...card, overflow: 'hidden' }}>
          {model.rewardEdits.map((r, i) => (
            <div key={r.id}>
              {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 55 }} />}
              <button type="button" onClick={() => props.onEditReward(r)} style={listRowBtn}>
                <span style={{ fontSize: 21, lineHeight: 1, width: 24, textAlign: 'center' }}>{r.emoji}</span>
                <span style={{ flex: 1, minWidth: 0, font: `500 16px ${SYS}`, color: '#2C2C28' }}>{r.text}</span>
                <span style={{ flex: 'none', font: `600 13px ${SYS}`, color: '#B8896A' }}>{r.cost} pts</span>
                <span style={{ flex: 'none', font: `400 20px ${SYS}`, color: '#C9C4B8' }}>›</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* restore + leave */}
      <div style={{ margin: '22px 16px 6px' }}>
        <button
          type="button"
          onClick={handleRestore}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 16,
            border: 'none',
            background: '#FFFFFF',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            color: confirmRestore ? '#D05A5A' : '#B8896A',
            font: `600 16px ${SYS}`,
            cursor: 'pointer',
          }}
        >
          {confirmRestore ? 'Pulsa otra vez para confirmar' : 'Restaurar plantilla por defecto'}
        </button>
      </div>
      <div style={{ textAlign: 'center', padding: '6px 24px 2px' }}>
        <button type="button" onClick={props.onLeave} style={{ background: 'none', border: 'none', font: `500 13px ${SYS}`, color: '#B3AEA3', cursor: 'pointer' }}>
          Desemparejar este dispositivo
        </button>
      </div>
      <div style={{ textAlign: 'center', padding: '2px 24px 8px', font: `400 12px ${SYS}`, color: '#B3AEA3' }}>
        Se sincroniza entre tus dispositivos · uso diario
      </div>
    </div>
  )
}

function NameRow({
  color,
  value,
  placeholder,
  hint,
  onInput,
}: {
  color: string
  value: string
  placeholder: string
  hint: string
  onInput: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px' }}>
      <span style={{ width: 13, height: 13, borderRadius: '50%', background: color, flex: 'none' }} />
      <input
        value={value}
        onChange={(e) => onInput(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', font: `500 16px ${SYS}`, color: '#2C2C28' }}
      />
      <span style={{ font: `500 12px ${SYS}`, color: '#B3AEA3' }}>{hint}</span>
    </div>
  )
}

const addBtn: React.CSSProperties = {
  font: `600 13px ${SYS}`,
  color: '#B8896A',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '2px 2px',
}

const listRowBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 13,
  width: '100%',
  padding: '13px 16px',
  background: 'transparent',
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
}

function chipBtn(primary: boolean): React.CSSProperties {
  return {
    flex: 'none',
    padding: '7px 14px',
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    font: `600 13px ${SYS}`,
    background: primary ? '#B8896A' : '#EDE7DC',
    color: primary ? '#FFFFFF' : '#9A968C',
  }
}

function pillBtn(primary: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '11px 0',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    font: `600 14px ${SYS}`,
    background: primary ? '#B8896A' : '#EDE7DC',
    color: primary ? '#FFFFFF' : '#6E6A60',
  }
}
