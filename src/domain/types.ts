// Bank identifier for pad groups (4 banks of 16 pads each = 64 total)
export type Bank = 'A' | 'B' | 'C' | 'D'

// Playback behavior modes
export type PlaybackMode = 'one-shot' | 'gate' | 'toggle' | 'loop' | 'latch'

// Quantization values for beat-synced triggering
export type QuantizeValue = 'off' | '1/1' | '1/2' | '1/4' | '1/8' | '1/16'

// Pad lifecycle states
export type PadState = 'empty' | 'loading' | 'ready' | 'playing' | 'queued' | 'error'

// Effect types available
export type EffectType =
  | 'reverb'
  | 'delay'
  | 'filter'
  | 'distortion'
  | 'compressor'
  | 'eq'
  | 'chorus'
  | 'phaser'
  | 'bitcrusher'

// Position of a pad within the grid
export interface PadPosition {
  bank: Bank
  row: number // 0-3
  col: number // 0-3
  index: number // 0-63 (global index across all banks)
}

// Source content for a pad
export interface PadSource {
  type: 'youtube' | 'audio-buffer'
  youtubeId: string | null
  youtubeUrl: string | null
  title: string
  duration: number // in seconds
  thumbnail: string | null
}

// Playback settings for a pad
export interface PlaybackSettings {
  mode: PlaybackMode
  inPoint: number // start time in seconds
  outPoint: number // end time in seconds (-1 for end of source)
  fadeIn: number // fade in duration in ms
  fadeOut: number // fade out duration in ms
  quantize: QuantizeValue
  reverse: boolean
  halfSpeed: boolean
}

// Audio settings for a pad
export interface AudioSettings {
  volume: number // 0-1
  pan: number // -1 (left) to 1 (right)
  pitch: number // semitones, -12 to 12
  mute: boolean
  solo: boolean
  group: string | null // for exclusive groups (only one plays at a time)
}

// Visual settings for a pad
export interface VisualSettings {
  color: string // hex color
  label: string // custom label (defaults to source title)
  waveformData: number[] | null // normalized amplitude data for visualization
}

// Complete pad definition
export interface Pad {
  id: string
  position: PadPosition
  source: PadSource | null
  playback: PlaybackSettings
  audio: AudioSettings
  visual: VisualSettings
  state: PadState
  errorMessage?: string
}

// Effect with parameters
export interface Effect {
  id: string
  type: EffectType
  enabled: boolean
  parameters: Record<string, number | boolean | string>
}

// Mixer channel
export interface Channel {
  id: string
  padId: string | null // associated pad, or null for master/aux
  volume: number
  pan: number
  mute: boolean
  solo: boolean
  effects: string[] // effect IDs
}

// Project/session data
export interface Project {
  id: string
  name: string
  bpm: number
  pads: Pad[]
  effects: Effect[]
  masterVolume: number
  createdAt: number // timestamp
  updatedAt: number // timestamp
}

// Transport state
export interface Transport {
  bpm: number
  isPlaying: boolean
  currentBeat: number
  quantize: QuantizeValue
}

// UI state types
export type ActiveView = 'grid' | 'mixer' | 'effects'

export interface OverlayPosition {
  x: number
  y: number
}

export interface OverlaySize {
  width: number
  height: number
}

// Keyboard mapping entry
export interface KeyMapping {
  key: string
  padIndex: number
  bank: Bank
}

// MIDI mapping entry
export interface MidiMapping {
  channel: number
  note: number
  padIndex: number
}
