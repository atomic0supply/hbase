import { lazy, Suspense, useState } from 'react'
import type { User } from 'firebase/auth'
import { createHousehold, JoinError, joinHousehold } from '../lib/household'
import { signOutUser } from '../hooks/useAuth'
import { SYS } from './styles'
import { Splash } from './Splash'

// The camera scanner pulls in ZXing — load it only when the user opens it.
const QrScanner = lazy(() => import('./QrScanner').then((m) => ({ default: m.QrScanner })))

type Mode = 'choose' | 'join'

export function Pairing({ user, prefillCode }: { user: User; prefillCode?: string }) {
  const [mode, setMode] = useState<Mode>(prefillCode ? 'join' : 'choose')
  const [code, setCode] = useState(prefillCode ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  const doCreate = async () => {
    setBusy(true)
    setError(null)
    try {
      await createHousehold(user)
      // useHousehold subscription will move us into the app automatically.
    } catch {
      setError('No se pudo crear el hogar. Revisa tu conexión.')
      setBusy(false)
    }
  }

  const doJoin = async (raw: string) => {
    setBusy(true)
    setError(null)
    try {
      await joinHousehold(user, raw)
    } catch (e) {
      setError(e instanceof JoinError ? e.message : 'No se pudo unir. Inténtalo de nuevo.')
      setBusy(false)
    }
  }

  const onScan = (text: string) => {
    setScanning(false)
    // QR may encode a full URL (…?join=CODE) or the bare code.
    let value = text.trim()
    try {
      const u = new URL(text)
      value = u.searchParams.get('join') || value
    } catch {
      /* not a URL, treat as raw code */
    }
    value = value.toUpperCase().slice(0, 6)
    setCode(value)
    void doJoin(value)
  }

  if (scanning) {
    return (
      <Suspense fallback={<Splash />}>
        <QrScanner onResult={onScan} onClose={() => setScanning(false)} />
      </Suspense>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F4F0E8', padding: '0 28px' }}>
      <div style={{ height: 'env(safe-area-inset-top)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 16 }}>💞</div>
        <h1 style={{ font: `700 27px/1.15 ${SYS}`, letterSpacing: '-0.02em', color: '#2C2C28', margin: 0 }}>
          {mode === 'choose' ? `Hola, ${user.displayName?.split(' ')[0] || ''}` : 'Únete a un hogar'}
        </h1>
        <p style={{ font: `400 15px/1.45 ${SYS}`, color: '#9A968C', margin: '10px 0 30px', maxWidth: 300 }}>
          {mode === 'choose'
            ? 'Crea vuestro hogar o únete al que ya ha creado tu pareja.'
            : 'Escanea el QR de tu pareja o escribe el código de 6 caracteres.'}
        </p>

        {mode === 'choose' ? (
          <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button type="button" onClick={doCreate} disabled={busy} style={primaryBtn(busy)}>
              {busy ? 'Creando…' : 'Crear nuestro hogar'}
            </button>
            <button type="button" onClick={() => { setMode('join'); setError(null) }} disabled={busy} style={secondaryBtn}>
              Unirme con un código
            </button>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button type="button" onClick={() => { setError(null); setScanning(true) }} disabled={busy} style={primaryBtn(busy)}>
              📷 Escanear QR
            </button>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              placeholder="CÓDIGO"
              inputMode="text"
              autoCapitalize="characters"
              autoCorrect="off"
              style={{
                width: '100%',
                textAlign: 'center',
                padding: '14px 0',
                borderRadius: 16,
                border: '1.5px solid rgba(0,0,0,0.10)',
                background: '#FFFFFF',
                outline: 'none',
                font: `700 24px ${SYS}`,
                letterSpacing: '0.22em',
                color: '#2C2C28',
              }}
            />
            <button type="button" onClick={() => doJoin(code)} disabled={busy || code.length !== 6} style={primaryBtn(busy || code.length !== 6)}>
              {busy ? 'Uniéndome…' : 'Unirme'}
            </button>
            <button type="button" onClick={() => { setMode('choose'); setError(null) }} disabled={busy} style={textBtn}>
              ‹ Volver
            </button>
          </div>
        )}

        {error && <div style={{ font: `500 13px/1.4 ${SYS}`, color: '#D05A5A', marginTop: 18, maxWidth: 300 }}>{error}</div>}
      </div>

      <div style={{ textAlign: 'center', paddingBottom: 'calc(env(safe-area-inset-bottom) + 18px)' }}>
        <button type="button" onClick={() => signOutUser()} style={textBtn}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function primaryBtn(disabled: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '15px 18px',
    borderRadius: 16,
    border: 'none',
    background: '#B8896A',
    color: '#FFFFFF',
    font: `600 16px ${SYS}`,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.55 : 1,
  }
}

const secondaryBtn: React.CSSProperties = {
  width: '100%',
  padding: '15px 18px',
  borderRadius: 16,
  border: 'none',
  background: '#FFFFFF',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  color: '#2C2C28',
  font: `600 16px ${SYS}`,
  cursor: 'pointer',
}

const textBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  font: `500 14px ${SYS}`,
  color: '#B8896A',
  cursor: 'pointer',
  padding: 8,
}
