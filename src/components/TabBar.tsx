import { ACCENT, SYS } from './styles'

export type View = 'hoy' | 'hogar' | 'organizar'

const INACTIVE = '#A9A49A'

function TabButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: '8px 0 7px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: active ? ACCENT : INACTIVE,
      }}
    >
      {children}
      <span style={{ font: `500 11px ${SYS}` }}>{label}</span>
    </button>
  )
}

export function TabBar({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <nav
      style={{
        flex: 'none',
        display: 'flex',
        borderTop: '1px solid rgba(44,44,40,0.08)',
        background: 'rgba(244,240,232,0.92)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <TabButton active={view === 'hoy'} label="Hoy" onClick={() => onChange('hoy')}>
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.6L12 3l9 7.6" />
          <path d="M5 9.4V20h14V9.4" />
          <path d="M9.5 20v-5.5h5V20" />
        </svg>
      </TabButton>
      <TabButton active={view === 'hogar'} label="Hogar" onClick={() => onChange('hogar')}>
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      </TabButton>
      <TabButton active={view === 'organizar'} label="Organizar" onClick={() => onChange('organizar')}>
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="8" x2="20" y2="8" />
          <circle cx="9" cy="8" r="2.4" fill="#F4F0E8" />
          <line x1="4" y1="16" x2="20" y2="16" />
          <circle cx="15" cy="16" r="2.4" fill="#F4F0E8" />
        </svg>
      </TabButton>
    </nav>
  )
}
