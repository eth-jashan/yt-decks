import React from 'react'
import { useUIStore } from '../../stores'
import { useDraggable } from '../../hooks/useDraggable'
import { OverlayHeader } from './OverlayHeader'
import { OverlayContent } from './OverlayContent'

export function Overlay() {
  const isOverlayVisible = useUIStore((state) => state.isOverlayVisible)
  const toggleOverlay = useUIStore((state) => state.toggleOverlay)
  const overlaySize = useUIStore((state) => state.overlaySize)
  const setOverlayPosition = useUIStore((state) => state.setPosition)

  const { position, onMouseDown } = useDraggable({
    storageKey: 'overlay',
    initialPosition: { x: 0, y: 0 },
  })

  // Sync position to store
  React.useEffect(() => {
    setOverlayPosition(position)
  }, [position, setOverlayPosition])

  const handleClose = () => {
    toggleOverlay()
  }

  const handleMinimize = () => {
    toggleOverlay()
  }

  return (
    <div
      className={`
        fixed bottom-0 z-[2147483647]
        flex flex-col
        bg-[#0F0F0F]/95 backdrop-blur-xl
        rounded-t-2xl
        border border-purple-500/30
        shadow-2xl shadow-purple-500/10
        transition-transform duration-150 ease-out
        ${isOverlayVisible ? 'translate-y-0' : 'translate-y-full'}
      `}
      style={{
        left: position.x,
        width: overlaySize.width,
        height: overlaySize.height,
        minWidth: 600,
        minHeight: 400,
        maxWidth: 1200,
        maxHeight: 800,
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-t-2xl pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      </div>

      <OverlayHeader
        onMouseDown={onMouseDown}
        onClose={handleClose}
        onMinimize={handleMinimize}
      />
      <OverlayContent />
    </div>
  )
}
