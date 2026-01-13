import React from 'react'
import { usePadStore } from '../../stores'
import { Pad } from '../Pad'
import { KEYBOARD_MAP, BANKS, getPadsForBank, type Bank } from '../../domain'

export function GridView() {
  const pads = usePadStore((state) => state.pads)
  const selectedBank = usePadStore((state) => state.selectedBank)
  const triggerPad = usePadStore((state) => state.triggerPad)
  const stopPad = usePadStore((state) => state.stopPad)
  const activePadId = usePadStore((state) => state.activePadId)

  // Get pads for the current bank (16 pads per bank)
  const bankPads = getPadsForBank(pads, selectedBank)

  // Get keyboard hints for each pad position
  const getKeyboardHint = (localIndex: number): string => {
    const entry = Object.entries(KEYBOARD_MAP).find(([_, idx]) => idx === localIndex)
    return entry ? entry[0].toUpperCase() : ''
  }

  const handleTrigger = (padId: string) => {
    const pad = pads.find(p => p.id === padId)
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
    <div className="flex flex-col h-full p-4">
      {/* Bank selector */}
      <div className="flex gap-2 mb-4">
        {BANKS.map((bank) => (
          <BankButton
            key={bank}
            bank={bank}
            isActive={selectedBank === bank}
          />
        ))}
      </div>

      {/* Pad grid - 4x4 */}
      <div className="flex-1 grid grid-cols-4 gap-2">
        {bankPads.map((pad, localIndex) => (
          <Pad
            key={pad.id}
            pad={pad}
            isSelected={pad.id === activePadId}
            keyboardHint={getKeyboardHint(localIndex)}
            onTrigger={() => handleTrigger(pad.id)}
            onContextMenu={(e) => handleContextMenu(e, pad.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface BankButtonProps {
  bank: Bank
  isActive: boolean
}

function BankButton({ bank, isActive }: BankButtonProps) {
  const setActiveBank = usePadStore((state) => state.setActiveBank)

  return (
    <button
      onClick={() => setActiveBank(bank)}
      className={`
        px-4 py-2 rounded-md font-semibold text-sm
        transition-colors duration-150
        ${isActive
          ? 'bg-purple-600 text-white'
          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
        }
      `}
    >
      Bank {bank}
    </button>
  )
}
