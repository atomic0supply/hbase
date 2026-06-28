// Light haptic feedback where supported (no-op on iOS Safari, which lacks Vibration API,
// but harmless). Keeps calls centralized so we can swap in a richer API later.
function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern)
  } catch {
    /* noop */
  }
}

export const haptics = {
  tap: () => vibrate(10),
  success: () => vibrate([12, 40, 18]),
}
