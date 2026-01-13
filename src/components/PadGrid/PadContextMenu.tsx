import React, { useState, useEffect, useRef, useCallback } from 'react'
import { usePadPlayback } from '../../hooks/usePadPlayback'
import { YouTubeExtractor } from '../../services/YouTubeExtractor'
import type { Pad } from '../../domain/types'

interface PadContextMenuProps {
  pad: Pad
  position: { x: number; y: number }
  onClose: () => void
}

export function PadContextMenu({ pad, position, onClose }: PadContextMenuProps) {
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { loadYouTube, clearPad } = usePadPlayback()

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Focus input when shown
  useEffect(() => {
    if (showUrlInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showUrlInput])

  const handleLoadYouTube = useCallback(() => {
    setShowUrlInput(true)
    setError(null)
  }, [])

  const handleSubmitUrl = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!url.trim()) {
        setError('Please enter a YouTube URL')
        return
      }

      if (!YouTubeExtractor.isValidInput(url)) {
        setError('Invalid YouTube URL')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const success = await loadYouTube(pad.id, url)
        if (success) {
          onClose()
        } else {
          setError('Failed to load audio')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setIsLoading(false)
      }
    },
    [url, pad.id, loadYouTube, onClose]
  )

  const handleLoadCurrentVideo = useCallback(async () => {
    // Get current YouTube video URL from the page
    const currentUrl = window.location.href
    if (!YouTubeExtractor.isValidInput(currentUrl)) {
      setError('Not on a YouTube video page')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const success = await loadYouTube(pad.id, currentUrl)
      if (success) {
        onClose()
      } else {
        setError('Failed to load audio')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setIsLoading(false)
    }
  }, [pad.id, loadYouTube, onClose])

  const handleClear = useCallback(() => {
    clearPad(pad.id)
    onClose()
  }, [pad.id, clearPad, onClose])

  const isEmpty = pad.state === 'empty'
  const hasContent = pad.source !== null

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* URL Input Mode */}
      {showUrlInput ? (
        <form onSubmit={handleSubmitUrl} className="p-3">
          <label className="block text-xs text-gray-400 mb-2">
            YouTube URL or Video ID
          </label>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            disabled={isLoading}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          {error && (
            <p className="mt-2 text-xs text-red-400">{error}</p>
          )}
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              disabled={isLoading}
              className="flex-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-gray-800 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
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
          {/* Load from YouTube URL */}
          <MenuItem
            icon={<YouTubeIcon />}
            label="Load YouTube URL..."
            onClick={handleLoadYouTube}
            disabled={isLoading}
          />

          {/* Load current video (if on YouTube) */}
          {window.location.hostname.includes('youtube.com') && (
            <MenuItem
              icon={<DownloadIcon />}
              label="Load Current Video"
              onClick={handleLoadCurrentVideo}
              disabled={isLoading}
            />
          )}

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

function YouTubeIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
