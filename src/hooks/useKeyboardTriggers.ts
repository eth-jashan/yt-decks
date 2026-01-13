import { useEffect, useCallback } from 'react'
import { usePadStore } from '../stores'
import { KEYBOARD_TO_PAD, isPadTriggerKey } from '../utils/keyboardMapping'
import { PADS_PER_BANK, BANKS, type Bank } from '../domain'

// Bank switching keys
const BANK_KEYS: Record<string, Bank> = {
  F1: 'A',
  F2: 'B',
  F3: 'C',
  F4: 'D',
}

/**
 * Check if the user is currently typing in an input field
 */
function isTypingInInput(): boolean {
  const activeElement = document.activeElement
  if (!activeElement) return false

  const tagName = activeElement.tagName.toLowerCase()
  if (tagName === 'input' || tagName === 'textarea') return true

  // Check for contenteditable
  if (activeElement.getAttribute('contenteditable') === 'true') return true

  return false
}

/**
 * Hook to handle keyboard triggers for pads
 * Maps keyboard keys to pad indices and triggers playback
 */
export function useKeyboardTriggers(enabled: boolean = true) {
  const triggerPad = usePadStore((state) => state.triggerPad)
  const stopPad = usePadStore((state) => state.stopPad)
  const pads = usePadStore((state) => state.pads)
  const selectedBank = usePadStore((state) => state.selectedBank)
  const setActiveBank = usePadStore((state) => state.setActiveBank)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (isTypingInInput()) return

      const key = event.key

      // Handle bank switching with F1-F4
      if (key in BANK_KEYS) {
        event.preventDefault()
        setActiveBank(BANK_KEYS[key])
        return
      }

      // Handle Tab to cycle banks
      if (key === 'Tab') {
        event.preventDefault()
        const currentIndex = BANKS.indexOf(selectedBank)
        const nextIndex = event.shiftKey
          ? (currentIndex - 1 + BANKS.length) % BANKS.length
          : (currentIndex + 1) % BANKS.length
        setActiveBank(BANKS[nextIndex])
        return
      }

      // Handle pad triggers
      if (isPadTriggerKey(key)) {
        event.preventDefault()

        const localPadIndex = KEYBOARD_TO_PAD[key.toLowerCase()]
        if (localPadIndex === undefined) return

        // Calculate global pad index based on current bank
        const bankIndex = BANKS.indexOf(selectedBank)
        const globalPadIndex = bankIndex * PADS_PER_BANK + localPadIndex

        const pad = pads[globalPadIndex]
        if (!pad) return

        // Toggle playback
        if (pad.state === 'playing') {
          stopPad(pad.id)
        } else {
          triggerPad(pad.id)
        }
      }
    },
    [pads, selectedBank, triggerPad, stopPad, setActiveBank]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])
}
