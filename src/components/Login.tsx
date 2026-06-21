import { useState } from 'react'
import { signInWithGoogle } from '../hooks/useAuth'
import { SYS } from './styles'

export function Login() {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handle = async () => {
    setBusy(true)
    setErr(null)
    try {
      await signInWithGoogle()
    } catch {
      setErr('No se pudo iniciar sesión. Inténtalo de nuevo.')
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        textAlign: 'center',
        background: '#F4F0E8',
      }}
    >
      <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 18 }}>🪴</div>
      <h1 style={{ font: `700 30px/1.15 ${SYS}`, letterSpacing: '-0.02em', color: '#2C2C28', margin: 0 }}>
        Reparto del Hogar
      </h1>
      <p style={{ font: `400 15px/1.45 ${SYS}`, color: '#9A968C', margin: '10px 0 32px', maxWidth: 300 }}>
        Reparto justo de tareas para dos, con marcador, racha y recompensas. Sincronizado entre tú y tu pareja.
      </p>

      <button
        type="button"
        onClick={handle}
        disabled={busy}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          width: '100%',
          maxWidth: 320,
          padding: '14px 18px',
          borderRadius: 16,
          border: 'none',
          background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 6px 18px rgba(0,0,0,0.04)',
          font: `600 16px ${SYS}`,
          color: '#2C2C28',
          cursor: busy ? 'default' : 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        <GoogleG />
        {busy ? 'Conectando…' : 'Entrar con Google'}
      </button>

      {err && <div style={{ font: `500 13px ${SYS}`, color: '#D05A5A', marginTop: 16 }}>{err}</div>}

      <div style={{ font: `400 12px ${SYS}`, color: '#B3AEA3', marginTop: 28, maxWidth: 280 }}>
        Tus datos se guardan en tu cuenta y se comparten solo con tu pareja.
      </div>
    </div>
  )
}

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}
