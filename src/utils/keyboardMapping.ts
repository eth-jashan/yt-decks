// Keyboard to pad index mapping (4x4 grid layout)
// Row 1: Q W E R -> pads 0-3
// Row 2: A S D F -> pads 4-7
// Row 3: Z X C V -> pads 8-11
// Row 4: 1 2 3 4 -> pads 12-15

export const KEYBOARD_TO_PAD: Record<string, number> = {
  // Row 1 (top)
  q: 0,
  w: 1,
  e: 2,
  r: 3,
  // Row 2
  a: 4,
  s: 5,
  d: 6,
  f: 7,
  // Row 3
  z: 8,
  x: 9,
  c: 10,
  v: 11,
  // Row 4 (bottom)
  '1': 12,
  '2': 13,
  '3': 14,
  '4': 15,
}

// Reverse mapping: pad index to keyboard key
export const PAD_TO_KEYBOARD: Record<number, string> = Object.entries(
  KEYBOARD_TO_PAD
).reduce(
  (acc, [key, padIndex]) => {
    acc[padIndex] = key.toUpperCase()
    return acc
  },
  {} as Record<number, string>
)

/**
 * Get the keyboard key for a given pad index
 */
export function getKeyForPad(padIndex: number): string {
  return PAD_TO_KEYBOARD[padIndex] || ''
}

/**
 * Get the pad index for a given keyboard key
 */
export function getPadForKey(key: string): number | undefined {
  return KEYBOARD_TO_PAD[key.toLowerCase()]
}

/**
 * Check if a key is a valid pad trigger key
 */
export function isPadTriggerKey(key: string): boolean {
  return key.toLowerCase() in KEYBOARD_TO_PAD
}
