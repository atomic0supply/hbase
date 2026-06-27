import type { Reward, Task } from '../types'

export const DAY_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
export const DAY_LONG = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
export const ZONES = ['Cocina', 'Baño', 'Salón', 'Dormitorio', 'Terraza', 'General']
export const EMOJIS = ['🍽️', '🧹', '🛏️', '🗑️', '🌿', '🚿', '🧽', '🛒', '🧺', '🪟', '🛋️', '🧴', '🛌', '🧼', '🚽', '🪣', '🍳', '🪴']
export const REMOJIS = ['🍽️', '☕', '🎬', '💆', '🍷', '🍕', '🛁', '🎮', '🏖️', '💐', '🍫', '🎁']

export const DEFAULT_COLOR_A = '#8FA892' // salvia
export const DEFAULT_COLOR_B = '#B8896A' // terracota

// Day index: 0=lunes … 6=domingo. All catalog tasks balance automatically (assign: 'rotate').
// The catalog is the full, preprogrammed list; a household's active tasks are a subset of it.
// "day" only matters for weekly tasks.
export const CATALOG_TASKS: Task[] = [
  // --- daily ---
  { id: 'd1', emoji: '🍽️', name: 'Fregar los platos', zone: 'Cocina', freq: 'daily', day: 0, assign: 'rotate', points: 2 },
  { id: 'd2', emoji: '🛏️', name: 'Hacer la cama', zone: 'Dormitorio', freq: 'daily', day: 0, assign: 'rotate', points: 1 },
  { id: 'd3', emoji: '🗑️', name: 'Bajar la basura', zone: 'General', freq: 'daily', day: 0, assign: 'rotate', points: 2 },
  { id: 'd4', emoji: '🌿', name: 'Regar las plantas', zone: 'Terraza', freq: 'daily', day: 0, assign: 'rotate', points: 1 },
  { id: 'd5', emoji: '🧹', name: 'Barrer la cocina', zone: 'Cocina', freq: 'daily', day: 0, assign: 'rotate', points: 1 },
  { id: 'd6', emoji: '🧴', name: 'Limpiar la encimera', zone: 'Cocina', freq: 'daily', day: 0, assign: 'rotate', points: 1 },
  { id: 'd7', emoji: '☕', name: 'Preparar el desayuno', zone: 'Cocina', freq: 'daily', day: 0, assign: 'rotate', points: 1 },
  { id: 'd8', emoji: '🧽', name: 'Recoger el salón', zone: 'Salón', freq: 'daily', day: 0, assign: 'rotate', points: 1 },
  // --- weekly (spread across the week) ---
  { id: 'w1', emoji: '🧺', name: 'Poner la lavadora', zone: 'General', freq: 'weekly', day: 1, assign: 'rotate', points: 2 },
  { id: 'w2', emoji: '🛋️', name: 'Aspirar el salón', zone: 'Salón', freq: 'weekly', day: 2, assign: 'rotate', points: 3 },
  { id: 'w3', emoji: '🪟', name: 'Limpiar cristales terraza', zone: 'Terraza', freq: 'weekly', day: 3, assign: 'rotate', points: 2 },
  { id: 'w4', emoji: '🛒', name: 'Compra semanal', zone: 'General', freq: 'weekly', day: 4, assign: 'rotate', points: 3 },
  { id: 'w5', emoji: '🚿', name: 'Limpiar el baño a fondo', zone: 'Baño', freq: 'weekly', day: 4, assign: 'rotate', points: 4 },
  { id: 'w6', emoji: '🧽', name: 'Fregar el suelo', zone: 'General', freq: 'weekly', day: 5, assign: 'rotate', points: 3 },
  { id: 'w7', emoji: '🛌', name: 'Cambiar las sábanas', zone: 'Dormitorio', freq: 'weekly', day: 5, assign: 'rotate', points: 2 },
  { id: 'w8', emoji: '🧴', name: 'Cocina a fondo', zone: 'Cocina', freq: 'weekly', day: 5, assign: 'rotate', points: 4 },
  // --- weekly extras (gallery) ---
  { id: 'w9', emoji: '🧦', name: 'Doblar y guardar la ropa', zone: 'Dormitorio', freq: 'weekly', day: 1, assign: 'rotate', points: 2 },
  { id: 'w10', emoji: '🪞', name: 'Limpiar espejos', zone: 'Baño', freq: 'weekly', day: 2, assign: 'rotate', points: 1 },
  { id: 'w11', emoji: '🗄️', name: 'Despejar superficies', zone: 'Salón', freq: 'weekly', day: 3, assign: 'rotate', points: 2 },
  { id: 'w12', emoji: '🧹', name: 'Aspirar el dormitorio', zone: 'Dormitorio', freq: 'weekly', day: 4, assign: 'rotate', points: 2 },
  { id: 'w13', emoji: '🚗', name: 'Limpiar el coche', zone: 'General', freq: 'weekly', day: 5, assign: 'rotate', points: 3 },
  { id: 'w14', emoji: '🧊', name: 'Limpiar el frigorífico', zone: 'Cocina', freq: 'weekly', day: 6, assign: 'rotate', points: 3 },
  { id: 'w15', emoji: '♻️', name: 'Sacar el reciclaje', zone: 'General', freq: 'weekly', day: 1, assign: 'rotate', points: 1 },
  { id: 'w16', emoji: '🪴', name: 'Cuidar las plantas a fondo', zone: 'Terraza', freq: 'weekly', day: 0, assign: 'rotate', points: 2 },
  { id: 'w17', emoji: '🧼', name: 'Limpiar electrodomésticos', zone: 'General', freq: 'weekly', day: 6, assign: 'rotate', points: 2 },
  { id: 'w18', emoji: '🍽️', name: 'Planificar el menú', zone: 'Cocina', freq: 'weekly', day: 6, assign: 'rotate', points: 1 },
  { id: 'w19', emoji: '🚽', name: 'Limpiar el inodoro', zone: 'Baño', freq: 'weekly', day: 3, assign: 'rotate', points: 2 },
  { id: 'w20', emoji: '🪣', name: 'Vaciar y limpiar cubos', zone: 'General', freq: 'weekly', day: 6, assign: 'rotate', points: 1 },
]

// The tasks active by default for a brand-new household (a subset of the catalog).
export const DEFAULT_ACTIVE_IDS = ['d1', 'd2', 'd3', 'd4', 'd5', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8']

export function defaultTasks(): Task[] {
  return CATALOG_TASKS.filter((t) => DEFAULT_ACTIVE_IDS.includes(t.id)).map((t) => ({ ...t }))
}

/** Resolve a task definition by id from the active set first, then the catalog. */
export function resolveTask(activeTasks: Task[], id: string): Task | undefined {
  return activeTasks.find((t) => t.id === id) || CATALOG_TASKS.find((t) => t.id === id)
}

export function defaultRewards(): Reward[] {
  return [
    { id: 'r1', emoji: 'coffee', text: 'Desayuno en la cama', cost: 15 },
    { id: 'r2', emoji: 'film', text: 'Noche de peli, elige quien gana', cost: 25 },
    { id: 'r3', emoji: 'spa', text: 'Masaje del que va perdiendo', cost: 35 },
    { id: 'r4', emoji: 'dinner', text: 'Cena fuera', cost: 50 },
  ]
}
