import { v4 as uuidv4 } from 'uuid'
import type {
  Pad,
  PadPosition,
  PadSource,
  PlaybackSettings,
  AudioSettings,
  VisualSettings,
  Bank,
  Effect,
  EffectType,
  Channel,
  Project,
} from './types'
import {
  BANKS,
  PADS_PER_BANK,
  PADS_PER_ROW,
  ROWS_PER_BANK,
  PAD_COLORS,
  DEFAULT_VOLUME,
  DEFAULT_PAN,
  DEFAULT_PITCH,
  DEFAULT_PLAYBACK_MODE,
  DEFAULT_QUANTIZE,
  DEFAULT_FADE_IN,
  DEFAULT_FADE_OUT,
  DEFAULT_BPM,
  TOTAL_PADS,
} from './constants'

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return uuidv4()
}

/**
 * Get pad position from global index (0-63)
 */
export function getPadPosition(index: number): PadPosition {
  const bankIndex = Math.floor(index / PADS_PER_BANK)
  const localIndex = index % PADS_PER_BANK
  const row = Math.floor(localIndex / PADS_PER_ROW)
  const col = localIndex % PADS_PER_ROW

  return {
    bank: BANKS[bankIndex],
    row,
    col,
    index,
  }
}

/**
 * Get global pad index from bank, row, col
 */
export function getPadIndex(bank: Bank, row: number, col: number): number {
  const bankIndex = BANKS.indexOf(bank)
  return bankIndex * PADS_PER_BANK + row * PADS_PER_ROW + col
}

/**
 * Get local pad index within a bank (0-15) from row and col
 */
export function getLocalPadIndex(row: number, col: number): number {
  return row * PADS_PER_ROW + col
}

/**
 * Create default playback settings
 */
export function createDefaultPlayback(): PlaybackSettings {
  return {
    mode: DEFAULT_PLAYBACK_MODE,
    inPoint: 0,
    outPoint: -1, // -1 means end of source
    fadeIn: DEFAULT_FADE_IN,
    fadeOut: DEFAULT_FADE_OUT,
    quantize: DEFAULT_QUANTIZE,
    reverse: false,
    halfSpeed: false,
  }
}

/**
 * Create default audio settings
 */
export function createDefaultAudio(): AudioSettings {
  return {
    volume: DEFAULT_VOLUME,
    pan: DEFAULT_PAN,
    pitch: DEFAULT_PITCH,
    mute: false,
    solo: false,
    group: null,
  }
}

/**
 * Create default visual settings
 */
export function createDefaultVisual(index: number): VisualSettings {
  return {
    color: PAD_COLORS[index % PAD_COLORS.length],
    label: '',
    waveformData: null,
  }
}

/**
 * Create an empty pad at the given position
 */
export function createEmptyPad(position: PadPosition): Pad {
  return {
    id: generateId(),
    position,
    source: null,
    playback: createDefaultPlayback(),
    audio: createDefaultAudio(),
    visual: createDefaultVisual(position.index),
    state: 'empty',
  }
}

/**
 * Create a pad from a YouTube source
 */
export function createPadFromYouTube(
  position: PadPosition,
  youtubeId: string,
  title: string,
  duration: number,
  thumbnail: string | null = null
): Pad {
  const source: PadSource = {
    type: 'youtube',
    youtubeId,
    youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    title,
    duration,
    thumbnail,
  }

  return {
    id: generateId(),
    position,
    source,
    playback: {
      ...createDefaultPlayback(),
      outPoint: duration,
    },
    audio: createDefaultAudio(),
    visual: {
      ...createDefaultVisual(position.index),
      label: title,
    },
    state: 'loading',
  }
}

/**
 * Initialize all 64 empty pads
 */
export function createEmptyPads(): Pad[] {
  return Array.from({ length: TOTAL_PADS }, (_, index) => {
    const position = getPadPosition(index)
    return createEmptyPad(position)
  })
}

/**
 * Create a default effect with standard parameters
 */
export function createEffect(type: EffectType): Effect {
  const baseEffect = {
    id: generateId(),
    type,
    enabled: true,
  }

  // Default parameters by effect type
  const parametersByType: Record<EffectType, Record<string, number | boolean | string>> = {
    reverb: { mix: 0.3, decay: 2.0, preDelay: 0.01 },
    delay: { mix: 0.3, time: 0.25, feedback: 0.4, sync: true },
    filter: { type: 'lowpass', frequency: 1000, resonance: 1.0 },
    distortion: { amount: 0.5, tone: 0.5 },
    compressor: { threshold: -24, ratio: 4, attack: 0.003, release: 0.25 },
    eq: { low: 0, mid: 0, high: 0 },
    chorus: { rate: 1.5, depth: 0.7, mix: 0.5 },
    phaser: { rate: 0.5, depth: 0.5, feedback: 0.7 },
    bitcrusher: { bits: 8, sampleRate: 0.5 },
  }

  return {
    ...baseEffect,
    parameters: parametersByType[type],
  }
}

/**
 * Create a mixer channel
 */
export function createChannel(padId: string | null = null): Channel {
  return {
    id: generateId(),
    padId,
    volume: DEFAULT_VOLUME,
    pan: DEFAULT_PAN,
    mute: false,
    solo: false,
    effects: [],
  }
}

/**
 * Create a new empty project
 */
export function createProject(name: string = 'Untitled Project'): Project {
  const now = Date.now()
  return {
    id: generateId(),
    name,
    bpm: DEFAULT_BPM,
    pads: createEmptyPads(),
    effects: [],
    masterVolume: DEFAULT_VOLUME,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Get pads for a specific bank
 */
export function getPadsForBank(pads: Pad[], bank: Bank): Pad[] {
  return pads.filter((pad) => pad.position.bank === bank)
}

/**
 * Find pad by ID
 */
export function findPadById(pads: Pad[], id: string): Pad | undefined {
  return pads.find((pad) => pad.id === id)
}

/**
 * Find pad by position
 */
export function findPadByPosition(pads: Pad[], bank: Bank, row: number, col: number): Pad | undefined {
  return pads.find(
    (pad) => pad.position.bank === bank && pad.position.row === row && pad.position.col === col
  )
}

/**
 * Calculate beat duration in milliseconds
 */
export function getBeatDuration(bpm: number): number {
  return (60 / bpm) * 1000
}

/**
 * Calculate time until next quantized beat
 */
export function getTimeToNextBeat(currentBeat: number, quantize: number): number {
  if (quantize === 0) return 0
  const nextBeat = Math.ceil(currentBeat / quantize) * quantize
  return nextBeat - currentBeat
}

/**
 * Format duration in seconds to mm:ss format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Parse YouTube video ID from URL
 */
export function parseYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}
