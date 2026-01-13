import { create } from 'zustand'

/**
 * Store for decoded AudioBuffers
 * Maps pad IDs to their decoded audio data
 *
 * Note: AudioBuffer objects cannot be serialized, so this store
 * is not persisted and must be re-populated on page reload
 */

interface AudioBufferState {
  // Map of padId -> AudioBuffer
  buffers: Map<string, AudioBuffer>
  // Map of padId -> active voice ID (for stopping)
  activeVoices: Map<string, string>
}

interface AudioBufferActions {
  setBuffer: (padId: string, buffer: AudioBuffer) => void
  getBuffer: (padId: string) => AudioBuffer | undefined
  removeBuffer: (padId: string) => void
  clearAllBuffers: () => void
  setActiveVoice: (padId: string, voiceId: string) => void
  getActiveVoice: (padId: string) => string | undefined
  clearActiveVoice: (padId: string) => void
  clearAllVoices: () => void
}

export const useAudioBufferStore = create<AudioBufferState & AudioBufferActions>()(
  (set, get) => ({
    buffers: new Map(),
    activeVoices: new Map(),

    setBuffer: (padId, buffer) =>
      set((state) => {
        const newBuffers = new Map(state.buffers)
        newBuffers.set(padId, buffer)
        return { buffers: newBuffers }
      }),

    getBuffer: (padId) => get().buffers.get(padId),

    removeBuffer: (padId) =>
      set((state) => {
        const newBuffers = new Map(state.buffers)
        newBuffers.delete(padId)
        return { buffers: newBuffers }
      }),

    clearAllBuffers: () =>
      set({ buffers: new Map() }),

    setActiveVoice: (padId, voiceId) =>
      set((state) => {
        const newVoices = new Map(state.activeVoices)
        newVoices.set(padId, voiceId)
        return { activeVoices: newVoices }
      }),

    getActiveVoice: (padId) => get().activeVoices.get(padId),

    clearActiveVoice: (padId) =>
      set((state) => {
        const newVoices = new Map(state.activeVoices)
        newVoices.delete(padId)
        return { activeVoices: newVoices }
      }),

    clearAllVoices: () =>
      set({ activeVoices: new Map() }),
  })
)
