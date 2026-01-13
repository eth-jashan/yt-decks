import React from 'react'
import { usePadStore } from '../../stores'
import { BANKS, PADS_PER_BANK, type Bank } from '../../domain'

interface BankButtonProps {
  bank: Bank
  isActive: boolean
  loadedCount: number
  onClick: () => void
}

function BankButton({ bank, isActive, loadedCount, onClick }: BankButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-4 py-2 rounded-md font-semibold text-sm
        transition-all duration-150 min-w-[60px]
        ${
          isActive
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
        }
      `}
    >
      {bank}
      {loadedCount > 0 && (
        <span
          className={`
            absolute -top-1 -right-1 min-w-[18px] h-[18px]
            rounded-full text-xs font-bold flex items-center justify-center
            ${isActive ? 'bg-white text-purple-600' : 'bg-purple-600 text-white'}
          `}
        >
          {loadedCount}
        </span>
      )}
    </button>
  )
}

export function BankSelector() {
  const pads = usePadStore((state) => state.pads)
  const selectedBank = usePadStore((state) => state.selectedBank)
  const setActiveBank = usePadStore((state) => state.setActiveBank)

  // Count loaded pads per bank
  const getLoadedCount = (bank: Bank): number => {
    const bankIndex = BANKS.indexOf(bank)
    const startIndex = bankIndex * PADS_PER_BANK
    const bankPads = pads.slice(startIndex, startIndex + PADS_PER_BANK)
    return bankPads.filter((pad) => pad.source !== null).length
  }

  return (
    <div className="flex gap-2">
      {BANKS.map((bank) => (
        <BankButton
          key={bank}
          bank={bank}
          isActive={selectedBank === bank}
          loadedCount={getLoadedCount(bank)}
          onClick={() => setActiveBank(bank)}
        />
      ))}
      <span className="ml-2 text-xs text-gray-500 self-center">
        Tab to cycle
      </span>
    </div>
  )
}
