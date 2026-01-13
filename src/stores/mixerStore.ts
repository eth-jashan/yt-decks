import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface Channel {
  id: string
  name: string
  volume: number
  pan: number
  muted: boolean
  solo: boolean
}

interface MixerState {
  masterVolume: number
  channels: Channel[]
}

interface MixerActions {
  setMasterVolume: (volume: number) => void
  setChannelVolume: (channelId: string, volume: number) => void
  setChannelPan: (channelId: string, pan: number) => void
  toggleChannelMute: (channelId: string) => void
  toggleChannelSolo: (channelId: string) => void
  addChannel: (channel: Channel) => void
  removeChannel: (channelId: string) => void
  resetMixer: () => void
}

const createDefaultChannel = (id: string, name: string): Channel => ({
  id,
  name,
  volume: 0.8,
  pan: 0,
  muted: false,
  solo: false,
})

const initialChannels: Channel[] = [
  createDefaultChannel('channel-1', 'Channel 1'),
  createDefaultChannel('channel-2', 'Channel 2'),
  createDefaultChannel('channel-3', 'Channel 3'),
  createDefaultChannel('channel-4', 'Channel 4'),
]

export const useMixerStore = create<MixerState & MixerActions>()(
  immer((set) => ({
    masterVolume: 0.8,
    channels: initialChannels,

    setMasterVolume: (volume) =>
      set((state) => {
        state.masterVolume = Math.max(0, Math.min(1, volume))
      }),

    setChannelVolume: (channelId, volume) =>
      set((state) => {
        const channel = state.channels.find((c) => c.id === channelId)
        if (channel) {
          channel.volume = Math.max(0, Math.min(1, volume))
        }
      }),

    setChannelPan: (channelId, pan) =>
      set((state) => {
        const channel = state.channels.find((c) => c.id === channelId)
        if (channel) {
          channel.pan = Math.max(-1, Math.min(1, pan))
        }
      }),

    toggleChannelMute: (channelId) =>
      set((state) => {
        const channel = state.channels.find((c) => c.id === channelId)
        if (channel) {
          channel.muted = !channel.muted
        }
      }),

    toggleChannelSolo: (channelId) =>
      set((state) => {
        const channel = state.channels.find((c) => c.id === channelId)
        if (channel) {
          channel.solo = !channel.solo
        }
      }),

    addChannel: (channel) =>
      set((state) => {
        state.channels.push(channel)
      }),

    removeChannel: (channelId) =>
      set((state) => {
        state.channels = state.channels.filter((c) => c.id !== channelId)
      }),

    resetMixer: () =>
      set((state) => {
        state.masterVolume = 0.8
        state.channels = initialChannels
      }),
  }))
)
