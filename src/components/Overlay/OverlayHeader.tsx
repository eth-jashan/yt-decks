import React from 'react'
import { useUIStore, type ActiveView } from '../../stores'

interface OverlayHeaderProps {
  onMouseDown: (e: React.MouseEvent) => void
  onClose: () => void
  onMinimize: () => void
}

const VIEW_TABS: { id: ActiveView; label: string }[] = [
  { id: 'pads', label: 'Grid' },
  { id: 'mixer', label: 'Mixer' },
  { id: 'settings', label: 'Effects' },
]

export function OverlayHeader({ onMouseDown, onClose, onMinimize }: OverlayHeaderProps) {
  const activeView = useUIStore((state) => state.activeView)
  const setActiveView = useUIStore((state) => state.setActiveView)

  return (
    <header
      className="flex items-center justify-between h-12 px-4 cursor-move select-none border-b border-white/10"
      onMouseDown={onMouseDown}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-purple-500 tracking-wider">
          YT DECKS
        </span>
      </div>

      {/* View Tabs */}
      <nav className="flex items-center gap-1">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={(e) => {
              e.stopPropagation()
              setActiveView(tab.id)
            }}
            className={`
              px-4 py-1.5 rounded-md text-sm font-medium
              transition-all duration-150 ease-out
              ${activeView === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMinimize()
          }}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-150"
          aria-label="Minimize"
        >
          <svg width="14" height="2" viewBox="0 0 14 2" fill="currentColor">
            <rect width="14" height="2" rx="1" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150"
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l10 10M11 1L1 11" />
          </svg>
        </button>
      </div>
    </header>
  )
}
