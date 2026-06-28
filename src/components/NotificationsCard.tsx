import { useState } from 'react'
import type { NotifPrefs } from '../types'
import { DEFAULT_NOTIF_PREFS } from '../types'
import { disablePush, enablePush, isPushSupported, isStandalone, permissionState, saveNotifPrefs } from '../lib/push'
import { card, sectionLabel, SYS } from './styles'

export function NotificationsCard({
  uid,
  pushEnabled,
  prefs: prefsProp,
}: {
  uid: string
  pushEnabled: boolean
  prefs?: NotifPrefs
}) {
  const prefs = prefsProp ?? DEFAULT_NOTIF_PREFS
  const supported = isPushSupported()
  const standalone = isStandalone()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const on = pushEnabled && permissionState() === 'granted'

  const toggleMaster = async () => {
    setBusy(true)
    setMsg(null)
    try {
      if (on) {
        await disablePush(uid)
      } else {
        const res = await enablePush(uid)
        if (res === 'denied') setMsg('Permiso denegado. Actívalo en Ajustes de iOS › Notificaciones.')
        else if (res === 'unsupported') setMsg('Este dispositivo no admite notificaciones web.')
      }
    } catch {
      setMsg('No se pudo cambiar. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  const update = (patch: Partial<NotifPrefs>) => saveNotifPrefs(uid, { ...prefs, ...patch })

  return (
    <div style={{ margin: '22px 16px 0' }}>
      <div style={sectionLabel}>Notificaciones</div>

      {!standalone ? (
        <div style={{ ...card, padding: '16px 18px' }}>
          <div style={{ font: `600 15px ${SYS}`, color: '#2C2C28' }}>Instala la app primero</div>
          <div style={{ font: `400 13px/1.45 ${SYS}`, color: '#9A968C', marginTop: 4 }}>
            En iPhone las notificaciones solo funcionan con la app en la pantalla de inicio: Compartir › Añadir a pantalla
            de inicio, y ábrela desde ahí.
          </div>
        </div>
      ) : !supported ? (
        <div style={{ ...card, padding: '16px 18px' }}>
          <div style={{ font: `400 13px/1.45 ${SYS}`, color: '#9A968C' }}>
            Este dispositivo no admite notificaciones web (requiere iOS 16.4 o superior).
          </div>
        </div>
      ) : (
        <div style={{ ...card, overflow: 'hidden' }}>
          <Row>
            <div style={{ flex: 1 }}>
              <div style={{ font: `500 16px ${SYS}`, color: '#2C2C28' }}>Activar en este dispositivo</div>
              <div style={{ font: `400 13px ${SYS}`, color: '#A29D93', marginTop: 1 }}>
                {on ? 'Activadas ✓' : 'Desactivadas'}
              </div>
            </div>
            <button type="button" onClick={toggleMaster} disabled={busy} style={switchStyle(on, busy)}>
              <span style={knobStyle(on)} />
            </button>
          </Row>

          {on && (
            <>
              <Divider />
              <Row>
                <span style={{ flex: 1, font: `500 16px ${SYS}`, color: '#2C2C28' }}>Recordatorio diario</span>
                <Toggle value={prefs.dailyReminder} onChange={(v) => update({ dailyReminder: v })} />
              </Row>
              {prefs.dailyReminder && (
                <>
                  <Divider />
                  <Row>
                    <span style={{ flex: 1, font: `400 15px ${SYS}`, color: '#6E6A60' }}>Hora del aviso</span>
                    <select
                      value={prefs.reminderHour}
                      onChange={(e) => update({ reminderHour: Number(e.target.value) })}
                      style={{ font: `600 15px ${SYS}`, color: '#B8896A', background: 'transparent', border: 'none', outline: 'none' }}
                    >
                      {Array.from({ length: 24 }, (_, h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </Row>
                </>
              )}
              <Divider />
              <Row>
                <span style={{ flex: 1, font: `500 16px ${SYS}`, color: '#2C2C28' }}>Avisos de racha 🔥</span>
                <Toggle value={prefs.streakAlerts} onChange={(v) => update({ streakAlerts: v })} />
              </Row>
              <Divider />
              <Row>
                <span style={{ flex: 1, font: `500 16px ${SYS}`, color: '#2C2C28' }}>Tareas nuevas de un compañero</span>
                <Toggle value={prefs.taskAssigned} onChange={(v) => update({ taskAssigned: v })} />
              </Row>
              <Divider />
              <Row>
                <span style={{ flex: 1, font: `500 16px ${SYS}`, color: '#2C2C28' }}>Cuando un compañero completa una tarea</span>
                <Toggle value={prefs.partnerCompleted} onChange={(v) => update({ partnerCompleted: v })} />
              </Row>
            </>
          )}
        </div>
      )}

      {msg && <div style={{ font: `500 13px/1.4 ${SYS}`, color: '#D05A5A', margin: '10px 0 0 4px' }}>{msg}</div>}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px' }}>{children}</div>
}
function Divider() {
  return <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} style={switchStyle(value, false)}>
      <span style={knobStyle(value)} />
    </button>
  )
}

function switchStyle(on: boolean, busy: boolean): React.CSSProperties {
  return {
    flex: 'none',
    width: 50,
    height: 30,
    borderRadius: 999,
    border: 'none',
    cursor: busy ? 'default' : 'pointer',
    background: on ? '#8FA892' : '#D8D2C6',
    position: 'relative',
    transition: 'background 0.2s ease',
    opacity: busy ? 0.6 : 1,
    padding: 0,
  }
}
function knobStyle(on: boolean): React.CSSProperties {
  return {
    position: 'absolute',
    top: 3,
    left: on ? 23 : 3,
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
    transition: 'left 0.2s ease',
  }
}
