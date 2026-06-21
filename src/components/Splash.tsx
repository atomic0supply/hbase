import { SYS } from './styles'

export function Splash() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F4F0E8',
        gap: 18,
      }}
    >
      <div style={{ fontSize: 52, lineHeight: 1, animation: 'bob 2.4s ease-in-out infinite' }}>🪴</div>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          border: '3px solid rgba(184,137,106,0.25)',
          borderTopColor: '#B8896A',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <div style={{ font: `500 13px ${SYS}`, color: '#B3AEA3' }}>Cargando…</div>
    </div>
  )
}
