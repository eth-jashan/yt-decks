import React from 'react'
import { usePadStore } from '../../stores'
import { Pad } from '../Pad'
import { BankSelector } from './BankSelector'
import { GridControls } from './GridControls'
import { useKeyboardTriggers } from '../../hooks/useKeyboardTriggers'
import { getPadsForBank } from '../../domain'
import { getKeyForPad } from '../../utils/keyboardMapping'

export function PadGrid() {
  const pads = usePadStore((state) => state.pads)
  const selectedBank = usePadStore((state) => state.selectedBank)
  const triggerPad = usePadStore((state) => state.triggerPad)
  const stopPad = usePadStore((state) => state.stopPad)
  const activePadId = usePadStore((state) => state.activePadId)

  // Enable keyboard triggers
  useKeyboardTriggers(true)

  // Get pads for the current bank (16 pads per bank)
  const bankPads = getPadsForBank(pads, selectedBank)

  const handleTrigger = (padId: string) => {
    const pad = pads.find((p) => p.id === padId)
    if (pad?.state === 'playing') {
      stopPad(padId)
    } else {
      triggerPad(padId)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, padId: string) => {
    e.preventDefault()
    console.log('[YT Decks] Context menu for pad:', padId)
    // TODO: Show context menu for pad configuration
  }

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
            onContextMenu={(e) => handleContextMenu(e, pad.id)}
          />
        ))}
      </div>
    </div>
  )
}
