import type { CSSProperties } from 'react'

export const PAGE_BG = '#F4F0E8'
export const ACCENT = '#B8896A' // terracota
export const SAGE = '#8FA892'
export const INK = '#2C2C28'

export const SYS = "-apple-system, system-ui, sans-serif"

export const card: CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 18,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.03)',
}

export const cardLg: CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 22,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 22px rgba(0,0,0,0.04)',
}

export const sectionLabel: CSSProperties = {
  font: `600 12px/1 ${SYS}`,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#9A968C',
  margin: '0 0 8px 4px',
}

export const h1: CSSProperties = {
  margin: '1px 0 0',
  font: `700 33px/1.1 ${SYS}`,
  letterSpacing: '-0.02em',
  color: INK,
}

export const eyebrow: CSSProperties = {
  font: `600 12px/1.3 ${SYS}`,
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  color: ACCENT,
}

export const divider = (indent: number): CSSProperties => ({
  height: 1,
  background: 'rgba(0,0,0,0.07)',
  marginLeft: indent,
})
