import React, { useState, useEffect, useRef, useCallback } from 'react'
import { usePadPlayback } from '../../hooks/usePadPlayback'
import type { Pad } from '../../domain/types'

interface PadContextMenuProps {
  pad: Pad
  position: { x: number; y: number }
  onClose: () => void
}

type InputMode = 'menu' | 'audio-url'

export function PadContextMenu({ pad, position, onClose }: PadContextMenuProps) {
  const [inputMode, setInputMode] = useState<InputMode>('menu')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { loadAudioUrl, clearPad } = usePadPlayback()

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inputMode !== 'menu') {
          setInputMode('menu')
          setError(null)
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, inputMode])

  // Focus input when shown
  useEffect(() => {
    if (inputMode !== 'menu' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputMode])

  const handleLoadAudioUrl = useCallback(() => {
    setInputMode('audio-url')
    setError(null)
    setUrl('')
  }, [])

  const handleSubmitAudioUrl = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!url.trim()) {
        setError('Please enter an audio URL')
        return
      }

      // Basic URL validation
      try {
        new URL(url)
      } catch {
        setError('Invalid URL format')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log('[PadContextMenu] Loading audio URL:', url)
        const success = await loadAudioUrl(pad.id, url, 'Audio Sample')
        if (success) {
          onClose()
        } else {
          setError('Failed to load audio')
        }
      } catch (err) {
        console.error('[PadContextMenu] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setIsLoading(false)
      }
    },
    [url, pad.id, loadAudioUrl, onClose]
  )

  const handleLoadTestSample = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    // Use a free sample audio for testing
    const testUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

    try {
      console.log('[PadContextMenu] Loading test sample')
      const success = await loadAudioUrl(pad.id, testUrl, 'Test Sample')
      if (success) {
        onClose()
      } else {
        setError('Failed to load test sample')
      }
    } catch (err) {
      console.error('[PadContextMenu] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setIsLoading(false)
    }
  }, [pad.id, loadAudioUrl, onClose])

  const handleClear = useCallback(() => {
    clearPad(pad.id)
    onClose()
  }, [pad.id, clearPad, onClose])

  const hasContent = pad.source !== null

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[220px] bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* URL Input Mode */}
      {inputMode === 'audio-url' ? (
        <form onSubmit={handleSubmitAudioUrl} className="p-3">
          <label className="block text-xs text-gray-400 mb-2">
            Direct Audio URL (MP3, WAV, etc.)
          </label>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/audio.mp3"
            disabled={isLoading}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          {error && (
            <p className="mt-2 text-xs text-red-400">{error}</p>
          )}
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                setInputMode('menu')
                setError(null)
              }}
              disabled={isLoading}
              className="flex-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-gray-800 rounded-md transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-3 py-1.5 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Loading...
                </>
              ) : (
                'Load'
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Menu Items */
        <div className="py-1">
          {/* Load test sample */}
          <MenuItem
            icon={<MusicIcon />}
            label="Load Test Sample"
            onClick={handleLoadTestSample}
            disabled={isLoading}
          />

          {/* Load from audio URL */}
          <MenuItem
            icon={<LinkIcon />}
            label="Load Audio URL..."
            onClick={handleLoadAudioUrl}
            disabled={isLoading}
          />

          {/* Divider */}
          {hasContent && <div className="my-1 border-t border-gray-700" />}

          {/* Clear pad */}
          {hasContent && (
            <MenuItem
              icon={<TrashIcon />}
              label="Clear Pad"
              onClick={handleClear}
              disabled={isLoading}
              destructive
            />
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
              <LoadingSpinner />
              Loading audio...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
}

function MenuItem({ icon, label, onClick, disabled, destructive }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-3 py-2 text-left text-sm flex items-center gap-3
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${destructive
          ? 'text-red-400 hover:bg-red-500/20'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
        }
      `}
    >
      <span className="w-4 h-4">{icon}</span>
      {label}
    </button>
  )
}

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function MusicIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}
