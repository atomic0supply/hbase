import type { Reward, Task } from '../types'

export const DAY_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
export const DAY_LONG = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
export const ZONES = ['Cocina', 'Baño', 'Salón', 'Dormitorio', 'Terraza', 'General']
export const EMOJIS = ['🍽️', '🧹', '🛏️', '🗑️', '🌿', '🚿', '🧽', '🛒', '🧺', '🪟', '🛋️', '🧴', '🛌', '🧼', '🚽', '🪣', '🍳', '🪴']
export const REMOJIS = ['🍽️', '☕', '🎬', '💆', '🍷', '🍕', '🛁', '🎮', '🏖️', '💐', '🍫', '🎁']

export const DEFAULT_COLOR_A = '#8FA892' // salvia
export const DEFAULT_COLOR_B = '#B8896A' // terracota

export function defaultTasks(): Task[] {
  return [
    { id: 'd1', emoji: '🍽️', name: 'Fregar los platos', zone: 'Cocina', freq: 'daily', day: 5, assign: 'rotate', points: 2 },
    { id: 'd2', emoji: '🛏️', name: 'Hacer la cama', zone: 'Dormitorio', freq: 'daily', day: 5, assign: 'rotate', points: 1 },
    { id: 'd3', emoji: '🗑️', name: 'Bajar la basura', zone: 'General', freq: 'daily', day: 5, assign: 'rotate', points: 2 },
    { id: 'd4', emoji: '🌿', name: 'Regar las plantas', zone: 'Terraza', freq: 'daily', day: 5, assign: 'rotate', points: 1 },
    { id: 'd5', emoji: '🧹', name: 'Barrer la cocina', zone: 'Cocina', freq: 'daily', day: 5, assign: 'rotate', points: 1 },
    { id: 'w1', emoji: '🧺', name: 'Poner la lavadora', zone: 'General', freq: 'weekly', day: 2, assign: 'rotate', points: 2 },
    { id: 'w2', emoji: '🛋️', name: 'Aspirar el salón', zone: 'Salón', freq: 'weekly', day: 3, assign: 'rotate', points: 3 },
    { id: 'w3', emoji: '🪟', name: 'Limpiar cristales terraza', zone: 'Terraza', freq: 'weekly', day: 4, assign: 'rotate', points: 2 },
    { id: 'w4', emoji: '🛒', name: 'Compra semanal', zone: 'General', freq: 'weekly', day: 5, assign: 'rotate', points: 3 },
    { id: 'w5', emoji: '🚿', name: 'Limpiar el baño a fondo', zone: 'Baño', freq: 'weekly', day: 5, assign: 'rotate', points: 4 },
    { id: 'w6', emoji: '🧽', name: 'Fregar el suelo', zone: 'General', freq: 'weekly', day: 6, assign: 'rotate', points: 3 },
    { id: 'w7', emoji: '🛌', name: 'Cambiar las sábanas', zone: 'Dormitorio', freq: 'weekly', day: 6, assign: 'rotate', points: 2 },
    { id: 'w8', emoji: '🧴', name: 'Cocina a fondo', zone: 'Cocina', freq: 'weekly', day: 6, assign: 'rotate', points: 4 },
  ]
}

export function defaultRewards(): Reward[] {
  return [
    { id: 'r1', emoji: '☕', text: 'Desayuno en la cama', cost: 15 },
    { id: 'r2', emoji: '🎬', text: 'Noche de peli, elige quien gana', cost: 25 },
    { id: 'r3', emoji: '💆', text: 'Masaje del que va perdiendo', cost: 35 },
    { id: 'r4', emoji: '🍽️', text: 'Cena fuera', cost: 50 },
  ]
}
