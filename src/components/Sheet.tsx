import type { ReactNode } from 'react'
import { SYS } from './styles'

export function Sheet({
  title,
  onClose,
  onSave,
  children,
}: {
  title: string
  onClose: () => void
  onSave: () => void
  children: ReactNode
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,24,0.42)', animation: 'fadeIn 0.25s ease' }} />
      <div
        style={{
          position: 'relative',
          background: '#F4F0E8',
          borderRadius: '24px 24px 0 0',
          maxHeight: '92vh',
          overflowY: 'auto',
          animation: 'sheetUp 0.34s cubic-bezier(0.16,1,0.3,1)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 18px)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '9px 0 2px' }}>
          <div style={{ width: 38, height: 5, borderRadius: 999, background: 'rgba(0,0,0,0.14)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 18px 8px' }}>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', font: `400 16px ${SYS}`, color: '#B8896A', cursor: 'pointer' }}>
            Cancelar
          </button>
          <span style={{ font: `600 16px ${SYS}`, color: '#2C2C28' }}>{title}</span>
          <button type="button" onClick={onSave} style={{ background: 'none', border: 'none', font: `700 16px ${SYS}`, color: '#B8896A', cursor: 'pointer' }}>
            Guardar
          </button>
        </div>
        <div style={{ padding: '2px 18px 8px' }}>{children}</div>
      </div>
    </div>
  )
}

export const emojiPickStyle = (selected: boolean): React.CSSProperties => ({
  width: 42,
  height: 42,
  borderRadius: 12,
  fontSize: 22,
  background: selected ? 'rgba(184,137,106,0.16)' : '#FFFFFF',
  border: selected ? '1.5px solid #B8896A' : '1.5px solid rgba(0,0,0,0.06)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const segStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '8px 0',
  borderRadius: 9,
  border: 'none',
  cursor: 'pointer',
  font: `600 14px ${SYS}`,
  background: active ? '#FFFFFF' : 'transparent',
  color: active ? '#2C2C28' : '#7A7870',
  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.13)' : 'none',
})

export const segGroup: React.CSSProperties = {
  display: 'flex',
  background: '#E6E0D5',
  borderRadius: 11,
  padding: 3,
  gap: 3,
}

export const subLabel: React.CSSProperties = {
  font: `600 12px/1 ${SYS}`,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#9A968C',
  margin: '18px 0 8px 2px',
}

export const hintText: React.CSSProperties = { font: `400 12px ${SYS}`, color: '#A9A49A', margin: '7px 0 0 2px' }

export const stepperBtn: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: '50%',
  border: 'none',
  background: '#EDE7DC',
  color: '#2C2C28',
  fontSize: 20,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export const deleteBtn: React.CSSProperties = {
  width: '100%',
  marginTop: 18,
  padding: 14,
  borderRadius: 16,
  border: 'none',
  background: '#FFFFFF',
  color: '#D05A5A',
  font: `600 16px ${SYS}`,
  cursor: 'pointer',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
}
