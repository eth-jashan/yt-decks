import type { Bank, QuantizeValue, PlaybackMode } from './types'

// Grid dimensions
export const PADS_PER_ROW = 4
export const ROWS_PER_BANK = 4
export const PADS_PER_BANK = PADS_PER_ROW * ROWS_PER_BANK // 16
export const TOTAL_BANKS = 4
export const TOTAL_PADS = PADS_PER_BANK * TOTAL_BANKS // 64

// Bank identifiers
export const BANKS: Bank[] = ['A', 'B', 'C', 'D']

// Default values
export const DEFAULT_BPM = 120
export const MIN_BPM = 20
export const MAX_BPM = 300

export const DEFAULT_VOLUME = 0.8
export const DEFAULT_PAN = 0
export const DEFAULT_PITCH = 0

export const DEFAULT_QUANTIZE: QuantizeValue = '1/4'
export const DEFAULT_PLAYBACK_MODE: PlaybackMode = 'one-shot'

export const DEFAULT_FADE_IN = 0
export const DEFAULT_FADE_OUT = 0

// Pad colors (vibrant palette for dark UI)
export const PAD_COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#22D3EE', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#84CC16', // Lime
  '#F97316', // Orange
  '#A855F7', // Violet
  '#14B8A6', // Teal
  '#F43F5E', // Rose
  '#6366F1', // Indigo
  '#FBBF24', // Yellow
  '#06B6D4', // Sky
  '#D946EF', // Fuchsia
] as const

// State colors
export const STATE_COLORS = {
  empty: '#374151', // Gray 700
  loading: '#F59E0B', // Amber
  ready: '#10B981', // Emerald
  playing: '#8B5CF6', // Purple (animated)
  queued: '#3B82F6', // Blue
  error: '#EF4444', // Red
} as const

// Keyboard to pad mapping (QWERTY layout, 4x4 grid)
// Bank A (default) - uses number row and top letter rows
export const KEYBOARD_MAP: Record<string, number> = {
  // Row 1 (top) - indices 0-3
  '1': 0,
  '2': 1,
  '3': 2,
  '4': 3,
  // Row 2 - indices 4-7
  'q': 4,
  'w': 5,
  'e': 6,
  'r': 7,
  // Row 3 - indices 8-11
  'a': 8,
  's': 9,
  'd': 10,
  'f': 11,
  // Row 4 (bottom) - indices 12-15
  'z': 12,
  'x': 13,
  'c': 14,
  'v': 15,
} as const

// Bank switching keys
export const BANK_KEYS: Record<string, Bank> = {
  'F1': 'A',
  'F2': 'B',
  'F3': 'C',
  'F4': 'D',
} as const

// Quantize options with display labels
export const QUANTIZE_OPTIONS: { value: QuantizeValue; label: string; beats: number }[] = [
  { value: 'off', label: 'Off', beats: 0 },
  { value: '1/1', label: '1 Bar', beats: 4 },
  { value: '1/2', label: '1/2', beats: 2 },
  { value: '1/4', label: '1/4', beats: 1 },
  { value: '1/8', label: '1/8', beats: 0.5 },
  { value: '1/16', label: '1/16', beats: 0.25 },
]

// Playback mode options with descriptions
export const PLAYBACK_MODE_OPTIONS: { value: PlaybackMode; label: string; description: string }[] = [
  { value: 'one-shot', label: 'One Shot', description: 'Plays once, ignores retrigger' },
  { value: 'gate', label: 'Gate', description: 'Plays while held, stops on release' },
  { value: 'toggle', label: 'Toggle', description: 'Press to play, press again to stop' },
  { value: 'loop', label: 'Loop', description: 'Loops continuously until stopped' },
  { value: 'latch', label: 'Latch', description: 'Plays once, restarts on retrigger' },
]

// Overlay constraints
export const OVERLAY_MIN_WIDTH = 600
export const OVERLAY_MIN_HEIGHT = 400
export const OVERLAY_MAX_WIDTH = 1200
export const OVERLAY_MAX_HEIGHT = 800
export const OVERLAY_DEFAULT_WIDTH = 800
export const OVERLAY_DEFAULT_HEIGHT = 500

// localStorage keys
export const STORAGE_KEYS = {
  OVERLAY_POSITION: 'yt-decks-overlay-position',
  OVERLAY_SIZE: 'yt-decks-overlay-size',
  CURRENT_PROJECT: 'yt-decks-current-project',
  PROJECTS: 'yt-decks-projects',
  SETTINGS: 'yt-decks-settings',
} as const

// Animation durations (ms)
export const ANIMATION = {
  FAST: 100,
  NORMAL: 150,
  SLOW: 300,
} as const
