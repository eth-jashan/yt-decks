import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Pad, Bank, PadState as DomainPadState } from '../domain/types'
import { createEmptyPads } from '../domain/helpers'

interface PadStoreState {
  pads: Pad[]
  activePadId: string | null
  selectedBank: Bank
}

interface PadActions {
  setPads: (pads: Pad[]) => void
  updatePad: (id: string, updates: Partial<Pad>) => void
  triggerPad: (id: string) => void
  stopPad: (id: string) => void
  stopAllPads: () => void
  setActiveBank: (bank: Bank) => void
  setPadState: (id: string, state: DomainPadState) => void
}

const initialPads = createEmptyPads()

export const usePadStore = create<PadStoreState & PadActions>()(
  immer((set) => ({
    pads: initialPads,
    activePadId: null,
    selectedBank: 'A' as Bank,

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
          // Only play pads that have content (not empty)
          const pad = state.pads[padIndex]
          if (pad.state !== 'empty') {
            state.pads[padIndex].state = 'playing'
            state.activePadId = id
          }
        }
      }),

    stopPad: (id) =>
      set((state) => {
        const padIndex = state.pads.findIndex((p) => p.id === id)
        if (padIndex !== -1) {
          const pad = state.pads[padIndex]
          // Go back to ready state if pad has source, otherwise empty
          state.pads[padIndex].state = pad.source ? 'ready' : 'empty'
          if (state.activePadId === id) {
            state.activePadId = null
          }
        }
      }),

    stopAllPads: () =>
      set((state) => {
        state.pads.forEach((pad) => {
          if (pad.state === 'playing') {
            pad.state = pad.source ? 'ready' : 'empty'
          }
        })
        state.activePadId = null
      }),

    setActiveBank: (bank) =>
      set((state) => {
        state.selectedBank = bank
      }),

    setPadState: (id, newState) =>
      set((state) => {
        const padIndex = state.pads.findIndex((p) => p.id === id)
        if (padIndex !== -1) {
          state.pads[padIndex].state = newState
        }
      }),
  }))
)
