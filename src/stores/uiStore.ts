import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type ActiveView = 'pads' | 'mixer' | 'settings' | 'browser'

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

interface UIState {
  isOverlayVisible: boolean
  overlayPosition: Position
  overlaySize: Size
  activeView: ActiveView
}

interface UIActions {
  toggleOverlay: () => void
  setOverlayVisible: (visible: boolean) => void
  setPosition: (position: Position) => void
  setSize: (size: Size) => void
  setActiveView: (view: ActiveView) => void
}

export const useUIStore = create<UIState & UIActions>()(
  immer((set) => ({
    isOverlayVisible: false,
    overlayPosition: { x: 100, y: 100 },
    overlaySize: { width: 800, height: 600 },
    activeView: 'pads',

    toggleOverlay: () =>
      set((state) => {
        state.isOverlayVisible = !state.isOverlayVisible
      }),

    setOverlayVisible: (visible) =>
      set((state) => {
        state.isOverlayVisible = visible
      }),

    setPosition: (position) =>
      set((state) => {
        state.overlayPosition = position
      }),

    setSize: (size) =>
      set((state) => {
        state.overlaySize = size
      }),

    setActiveView: (view) =>
      set((state) => {
        state.activeView = view
      }),
  }))
)
