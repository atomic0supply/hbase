// Original simple line-icon set, consistent with the app's tab-bar style.
// 24x24, stroke=currentColor, rounded caps. Map tasks/rewards to these names.
import type { ReactNode } from 'react'

const ICONS: Record<string, ReactNode> = {
  dish: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  bed: (
    <>
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
      <path d="M3 15h18" />
      <path d="M4 18v2M20 18v2" />
      <path d="M7 10V8.5A1.5 1.5 0 0 1 8.5 7h2A1.5 1.5 0 0 1 12 8.5V10" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5L18 7" />
      <path d="M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  plant: (
    <>
      <path d="M8 21h8l-1-6H9z" />
      <path d="M12 15c0-3 0-5 0-8" />
      <path d="M12 9c1.6-.6 3.2-1 4-2.8-2-.2-3.6.2-4 2.8z" />
      <path d="M12 11c-1.6-.6-3.2-1-4-2.8 2-.2 3.6.2 4 2.8z" />
    </>
  ),
  broom: (
    <>
      <path d="M19 4l-8 8" />
      <path d="M11 12l3 3-6 5-3-3z" />
      <path d="M8.5 14.5l3 3" />
    </>
  ),
  spray: (
    <>
      <rect x="7" y="10" width="7" height="11" rx="1.5" />
      <path d="M9 10V7h3v3" />
      <path d="M12 8h3M15 6v4" />
      <path d="M18 6h.01M20 5h.01M20 9h.01M18 10h.01" />
    </>
  ),
  coffee: (
    <>
      <path d="M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
      <path d="M16 9h1.5a2 2 0 0 1 0 4H16" />
      <path d="M8 3v2M11 3v2" />
    </>
  ),
  sofa: (
    <>
      <path d="M5 12V9.5A2.5 2.5 0 0 1 7.5 7h9A2.5 2.5 0 0 1 19 9.5V12" />
      <path d="M3 13a2 2 0 0 1 2 2v2h14v-2a2 2 0 0 1 2-2" />
      <path d="M6 17v2M18 17v2" />
    </>
  ),
  washer: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="13" r="4.5" />
      <circle cx="12" cy="13" r="1.5" />
      <path d="M8 6h.01M11 6h.01" />
    </>
  ),
  vacuum: (
    <>
      <path d="M3 8h10a3 3 0 1 0-3-3" />
      <path d="M3 12h13a3 3 0 1 1-3 3" />
      <path d="M3 16h7a2 2 0 1 1-2 2" />
    </>
  ),
  window: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M12 4v16M4 12h16" />
    </>
  ),
  cart: (
    <>
      <circle cx="9.5" cy="20" r="1.2" />
      <circle cx="17.5" cy="20" r="1.2" />
      <path d="M2.5 4h2l2.2 11h10.5l1.8-8H6.2" />
    </>
  ),
  shower: (
    <>
      <path d="M4 12h16" />
      <path d="M7 12a5 5 0 0 1 10 0" />
      <path d="M12 7V4h4" />
      <path d="M9 16v2M12 17v2M15 16v2" />
    </>
  ),
  mop: (
    <>
      <path d="M12 3v9" />
      <path d="M8 12h8l-1 6.5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 18.5z" />
      <path d="M9.3 16h5.4" />
    </>
  ),
  pot: (
    <>
      <path d="M4 9h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
      <path d="M2 10h2M20 10h2" />
      <path d="M9 5v2M12 4v3M15 5v2" />
    </>
  ),
  shirt: (
    <>
      <path d="M9 4L4.5 6.5 6 10l2.2-1V20h7.6V9l2.2 1 1.5-3.5L15 4l-3 2.2z" />
    </>
  ),
  box: (
    <>
      <path d="M4 8l8-4 8 4-8 4z" />
      <path d="M4 8v8l8 4 8-4V8" />
      <path d="M12 12v8" />
    </>
  ),
  car: (
    <>
      <path d="M5 13l1.6-4.2A2 2 0 0 1 8.5 7.5h7a2 2 0 0 1 1.9 1.3L19 13" />
      <path d="M4 13h16v4H4z" />
      <circle cx="7.5" cy="17.5" r="1.4" />
      <circle cx="16.5" cy="17.5" r="1.4" />
    </>
  ),
  fridge: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M6 11h12" />
      <path d="M9 7v1.5M9 13.5v2.5" />
    </>
  ),
  recycle: (
    <>
      <path d="M5.5 12.5L4 15l2.5 1.2" />
      <path d="M4 15a8 8 0 0 1 4-7" />
      <path d="M14.5 5.5L13 4l-1.5 2.5" />
      <path d="M13 4a8 8 0 0 1 7 4" />
      <path d="M17 19.5l2.5-.7-.5-2.6" />
      <path d="M19.5 18.8A8 8 0 0 1 12 21" />
    </>
  ),
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" />
      <circle cx="4.5" cy="12" r="1" />
      <circle cx="4.5" cy="18" r="1" />
    </>
  ),
  toilet: (
    <>
      <path d="M6 4h7v3.5a3.5 3.5 0 0 1-7 0z" />
      <path d="M7.5 11l-1 6.5a1 1 0 0 0 1 1.2h6a1 1 0 0 0 1-1.2l-1-6.5" />
      <path d="M13 6h3" />
    </>
  ),
  bucket: (
    <>
      <path d="M5 7h14l-1.4 12.2a1 1 0 0 1-1 .8H7.4a1 1 0 0 1-1-.8z" />
      <path d="M5 7c0-1.6 3.1-3 7-3s7 1.4 7 3" />
    </>
  ),
  // ---- rewards ----
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7.5 4v16M16.5 4v16" />
      <path d="M3 9.5h4.5M3 14.5h4.5M16.5 9.5H21M16.5 14.5H21" />
    </>
  ),
  spa: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10c-1.4-1.6-1.4-3.6 0-5.2 1.4 1.6 1.4 3.6 0 5.2z" />
      <path d="M12 14c1.4 1.6 1.4 3.6 0 5.2-1.4-1.6-1.4-3.6 0-5.2z" />
      <path d="M10 12c-1.6-1.4-3.6-1.4-5.2 0 1.6 1.4 3.6 1.4 5.2 0z" />
      <path d="M14 12c1.6-1.4 3.6-1.4 5.2 0-1.6 1.4-3.6 1.4-5.2 0z" />
    </>
  ),
  dinner: (
    <>
      <path d="M7 3v8" />
      <path d="M5 3v3.5A1.5 1.5 0 0 0 6.5 8M9 3v3.5A1.5 1.5 0 0 1 7.5 8" />
      <path d="M7 11v10" />
      <path d="M16 3c-1.6 0-1.6 6 0 6v12" />
    </>
  ),
  wine: (
    <>
      <path d="M8 4h8l-1 5a3 3 0 0 1-6 0z" />
      <path d="M12 14v5M9 21h6" />
    </>
  ),
  pizza: (
    <>
      <path d="M3 7l9 13 9-13c-5.5-2.4-12.5-2.4-18 0z" />
      <circle cx="10" cy="10.5" r=".6" />
      <circle cx="14" cy="11" r=".6" />
      <circle cx="12" cy="14.5" r=".6" />
    </>
  ),
  bath: (
    <>
      <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
      <path d="M6 12V6.5a2 2 0 0 1 4 0" />
      <path d="M6 19l-1 2M19 19l1 2" />
    </>
  ),
  game: (
    <>
      <rect x="3" y="8" width="18" height="9" rx="4" />
      <path d="M7.5 11.5v3M6 13h3" />
      <circle cx="16" cy="12" r=".9" />
      <circle cx="18" cy="14" r=".9" />
    </>
  ),
  beach: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </>
  ),
  flowers: (
    <>
      <circle cx="9" cy="7" r="2" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M9 9l3 11M15 9l-3 11M12 7v13" />
    </>
  ),
  chocolate: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M5 9.3h14M5 14.6h14M12 4v16" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M4 13h16M12 9v11" />
      <path d="M12 9C9.5 9 8 7.4 8.7 5.7S12 6 12 9M12 9c2.5 0 4-1.6 3.3-3.3S12 6 12 9z" />
    </>
  ),
}

export type IconName = keyof typeof ICONS

export function hasIcon(name: string): name is IconName {
  return name in ICONS
}

export function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.7 }: { name: string; size?: number; color?: string; strokeWidth?: number }) {
  const node = ICONS[name]
  if (!node) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {node}
    </svg>
  )
}

// catalog task id -> icon name
export const TASK_ICON: Record<string, string> = {
  d1: 'dish', d2: 'bed', d3: 'trash', d4: 'plant', d5: 'broom', d6: 'spray', d7: 'coffee', d8: 'sofa',
  w1: 'washer', w2: 'vacuum', w3: 'window', w4: 'cart', w5: 'shower', w6: 'mop', w7: 'bed', w8: 'pot',
  w9: 'shirt', w10: 'spray', w11: 'box', w12: 'vacuum', w13: 'car', w14: 'fridge', w15: 'recycle',
  w16: 'plant', w17: 'spray', w18: 'list', w19: 'toilet', w20: 'bucket',
}

// emoji (from the legacy palettes) -> icon name, for back-compat rendering of stored values
const EMOJI_TO_ICON: Record<string, string> = {
  '🍽️': 'dish', '🛏️': 'bed', '🗑️': 'trash', '🌿': 'plant', '🪴': 'plant', '🧹': 'broom', '🧴': 'spray',
  '☕': 'coffee', '🛋️': 'sofa', '🧺': 'washer', '🪟': 'window', '🛒': 'cart', '🚿': 'shower', '🧽': 'mop',
  '🛌': 'bed', '🧦': 'shirt', '🚗': 'car', '🧊': 'fridge', '♻️': 'recycle', '🚽': 'toilet', '🪣': 'bucket',
  '🪞': 'window', '🗄️': 'box', '🧼': 'spray', '🎬': 'film', '💆': 'spa', '🍷': 'wine', '🍕': 'pizza',
  '🛁': 'bath', '🎮': 'game', '🏖️': 'beach', '💐': 'flowers', '🍫': 'chocolate', '🎁': 'gift',
}

/** Resolve the icon name for a stored glyph value (icon name OR legacy emoji). */
export function resolveIcon(value: string): string | null {
  if (hasIcon(value)) return value
  return EMOJI_TO_ICON[value] ?? null
}

// reward icon choices for the editor picker
export const REWARD_ICON_CHOICES = ['coffee', 'film', 'spa', 'dinner', 'wine', 'pizza', 'bath', 'game', 'beach', 'flowers', 'chocolate', 'gift']

/** Render an SVG icon resolved from a task id and/or a stored glyph value; falls
 *  back to the raw emoji glyph when no icon matches (keeps legacy data readable). */
export function Glyph({
  taskId,
  value,
  size = 22,
  color = '#2C2C28',
}: {
  taskId?: string
  value?: string
  size?: number
  color?: string
}) {
  const name = (taskId && TASK_ICON[taskId]) || (value ? resolveIcon(value) : null)
  if (name) return <Icon name={name} size={size} color={color} />
  return <span style={{ fontSize: size - 1, lineHeight: 1 }}>{value ?? ''}</span>
}
