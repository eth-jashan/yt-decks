import React, { useState, useCallback } from 'react'
import { usePadStore } from '../../stores'
import { Pad } from '../Pad'
import { BankSelector } from './BankSelector'
import { GridControls } from './GridControls'
import { PadContextMenu } from './PadContextMenu'
import { useKeyboardTriggers } from '../../hooks/useKeyboardTriggers'
import { usePadPlayback } from '../../hooks/usePadPlayback'
import { getPadsForBank, type Pad as PadType } from '../../domain'
import { getKeyForPad } from '../../utils/keyboardMapping'

interface ContextMenuState {
  pad: PadType
  position: { x: number; y: number }
}

export function PadGrid() {
  const pads = usePadStore((state) => state.pads)
  const selectedBank = usePadStore((state) => state.selectedBank)
  const activePadId = usePadStore((state) => state.activePadId)

  const { togglePad, stopAll } = usePadPlayback()

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  // Enable keyboard triggers
  useKeyboardTriggers(true)

  // Get pads for the current bank (16 pads per bank)
  const bankPads = getPadsForBank(pads, selectedBank)

  const handleTrigger = useCallback(
    (padId: string) => {
      togglePad(padId)
    },
    [togglePad]
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, pad: PadType) => {
      e.preventDefault()
      setContextMenu({
        pad,
        position: { x: e.clientX, y: e.clientY },
      })
    },
    []
  )

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header: Bank selector and quantize control */}
      <div className="flex items-center justify-between">
        <BankSelector />
        <div className="flex items-center gap-2">
          <GridControls />
        </div>
      </div>

      {/* Pad grid - 4x4 */}
      <div className="flex-1 grid grid-cols-4 gap-2">
        {bankPads.map((pad, localIndex) => (
          <Pad
            key={pad.id}
            pad={pad}
            isSelected={pad.id === activePadId}
            keyboardHint={getKeyForPad(localIndex)}
            onTrigger={() => handleTrigger(pad.id)}
            onContextMenu={(e) => handleContextMenu(e, pad)}
          />
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <PadContextMenu
          pad={contextMenu.pad}
          position={contextMenu.position}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  )
}
