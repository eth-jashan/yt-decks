import React from 'react'
import { usePadStore } from '../../stores'
import { useClockStore } from '../../stores'
import { QUANTIZE_OPTIONS } from '../../domain'
import type { QuantizeValue } from '../../domain'

export function GridControls() {
  const stopAllPads = usePadStore((state) => state.stopAllPads)
  const quantize = useClockStore((state) => state.quantize)
  const setQuantize = useClockStore((state) => state.setQuantize)

  return (
    <div className="flex items-center justify-between gap-4 px-2 py-2 bg-white/5 rounded-lg">
      {/* Quantize dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400">Quantize:</label>
        <select
          value={quantize}
          onChange={(e) => setQuantize(e.target.value as QuantizeValue)}
          className="
            bg-gray-800 text-white text-sm rounded-md px-3 py-1.5
            border border-gray-700 focus:border-purple-500 focus:outline-none
            cursor-pointer
          "
        >
          {QUANTIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stop All button */}
      <button
        onClick={stopAllPads}
        className="
          px-4 py-1.5 rounded-md text-sm font-medium
          bg-red-600/20 text-red-400 border border-red-600/30
          hover:bg-red-600/30 hover:text-red-300
          transition-colors duration-150
          flex items-center gap-2
        "
      >
        <StopIcon />
        Stop All
      </button>
    </div>
  )
}

function StopIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <rect x="4" y="4" width="12" height="12" rx="1" />
    </svg>
  )
}
