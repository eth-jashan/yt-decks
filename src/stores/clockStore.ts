import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type QuantizeValue = '1/1' | '1/2' | '1/4' | '1/8' | '1/16' | 'off'

interface ClockState {
  bpm: number
  isPlaying: boolean
  currentBeat: number
  quantize: QuantizeValue
}

interface ClockActions {
  setBpm: (bpm: number) => void
  play: () => void
  stop: () => void
  setQuantize: (quantize: QuantizeValue) => void
  incrementBeat: () => void
  resetBeat: () => void
}

export const useClockStore = create<ClockState & ClockActions>()(
  immer((set) => ({
    bpm: 120,
    isPlaying: false,
    currentBeat: 0,
    quantize: '1/4',

    setBpm: (bpm) =>
      set((state) => {
        state.bpm = Math.max(20, Math.min(300, bpm))
      }),

    play: () =>
      set((state) => {
        state.isPlaying = true
      }),

    stop: () =>
      set((state) => {
        state.isPlaying = false
        state.currentBeat = 0
      }),

    setQuantize: (quantize) =>
      set((state) => {
        state.quantize = quantize
      }),

    incrementBeat: () =>
      set((state) => {
        state.currentBeat = (state.currentBeat + 1) % 16
      }),

    resetBeat: () =>
      set((state) => {
        state.currentBeat = 0
      }),
  }))
)
