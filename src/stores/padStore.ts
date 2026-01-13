import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface Pad {
  id: string
  position: number
  source: {
    videoId: string | null
    startTime: number
    endTime: number
  }
  playback: {
    volume: number
    speed: number
    loop: boolean
  }
  state: 'idle' | 'playing' | 'loading' | 'error'
}

interface PadState {
  pads: Pad[]
  activePadId: string | null
  selectedBank: number
}

interface PadActions {
  setPads: (pads: Pad[]) => void
  updatePad: (id: string, updates: Partial<Pad>) => void
  triggerPad: (id: string) => void
  stopPad: (id: string) => void
  setActiveBank: (bank: number) => void
}

const createEmptyPad = (position: number): Pad => ({
  id: `pad-${position}`,
  position,
  source: {
    videoId: null,
    startTime: 0,
    endTime: 0,
  },
  playback: {
    volume: 1,
    speed: 1,
    loop: false,
  },
  state: 'idle',
})

const initialPads = Array.from({ length: 64 }, (_, i) => createEmptyPad(i))

export const usePadStore = create<PadState & PadActions>()(
  immer((set) => ({
    pads: initialPads,
    activePadId: null,
    selectedBank: 0,

    setPads: (pads) =>
      set((state) => {
        state.pads = pads
      }),

    updatePad: (id, updates) =>
      set((state) => {
        const padIndex = state.pads.findIndex((p) => p.id === id)
        if (padIndex !== -1) {
          Object.assign(state.pads[padIndex], updates)
        }
      }),

    triggerPad: (id) =>
      set((state) => {
        const padIndex = state.pads.findIndex((p) => p.id === id)
        if (padIndex !== -1) {
          state.pads[padIndex].state = 'playing'
          state.activePadId = id
        }
      }),

    stopPad: (id) =>
      set((state) => {
        const padIndex = state.pads.findIndex((p) => p.id === id)
        if (padIndex !== -1) {
          state.pads[padIndex].state = 'idle'
          if (state.activePadId === id) {
            state.activePadId = null
          }
        }
      }),

    setActiveBank: (bank) =>
      set((state) => {
        state.selectedBank = bank
      }),
  }))
)
