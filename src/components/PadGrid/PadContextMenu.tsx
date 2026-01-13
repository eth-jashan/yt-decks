import React, { useState, useEffect, useRef, useCallback } from 'react'
import { usePadPlayback } from '../../hooks/usePadPlayback'
import type { Pad } from '../../domain/types'

interface PadContextMenuProps {
  pad: Pad
  position: { x: number; y: number }
  onClose: () => void
}

type InputMode = 'menu' | 'audio-url'

// Inline styles for shadow DOM compatibility
const styles = {
  menu: {
    position: 'fixed' as const,
    zIndex: 9999,
    minWidth: '220px',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  menuItem: {
    width: '100%',
    padding: '10px 14px',
    textAlign: 'left' as const,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#d1d5db',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  menuItemHover: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuItemDestructive: {
    color: '#f87171',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '6px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '14px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  buttonPrimary: {
    backgroundColor: '#7c3aed',
    color: 'white',
  },
  buttonSecondary: {
    backgroundColor: '#374151',
    color: '#9ca3af',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '8px',
  },
  error: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#f87171',
  },
  loading: {
    padding: '10px 14px',
    fontSize: '12px',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  divider: {
    margin: '4px 0',
    borderTop: '1px solid #374151',
  },
  icon: {
    width: '16px',
    height: '16px',
    flexShrink: 0,
  },
}

export function PadContextMenu({ pad, position, onClose }: PadContextMenuProps) {
  const [inputMode, setInputMode] = useState<InputMode>('menu')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
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
      e.stopPropagation()

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
          setError('Failed to load audio - check console for details')
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

    // Use a CORS-friendly test audio
    const testUrl = 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg'

    try {
      console.log('[PadContextMenu] Loading test sample...')
      const success = await loadAudioUrl(pad.id, testUrl, 'Test Sound')
      if (success) {
        onClose()
      } else {
        setError('Failed to load - check console (F12)')
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

  // Adjust position to stay within viewport
  const menuStyle = {
    ...styles.menu,
    left: Math.min(position.x, window.innerWidth - 240),
    top: Math.min(position.y, window.innerHeight - 200),
  }

  return (
    <div ref={menuRef} style={menuStyle}>
      {/* URL Input Mode */}
      {inputMode === 'audio-url' ? (
        <form onSubmit={handleSubmitAudioUrl} style={{ padding: '12px' }}>
          <label style={styles.label}>
            Direct Audio URL (MP3, WAV, OGG)
          </label>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/audio.mp3"
            disabled={isLoading}
            style={{
              ...styles.input,
              opacity: isLoading ? 0.5 : 1,
            }}
          />
          {error && <p style={styles.error}>{error}</p>}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => {
                setInputMode('menu')
                setError(null)
              }}
              disabled={isLoading}
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {isLoading ? 'Loading...' : 'Load'}
            </button>
          </div>
        </form>
      ) : (
        /* Menu Items */
        <div style={{ padding: '4px 0' }}>
          {/* Load test sample */}
          <button
            onClick={handleLoadTestSample}
            disabled={isLoading}
            onMouseEnter={() => setHoveredItem('test')}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              ...styles.menuItem,
              ...(hoveredItem === 'test' ? styles.menuItemHover : {}),
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            <MusicIcon />
            Load Test Sample
          </button>

          {/* Load from audio URL */}
          <button
            onClick={handleLoadAudioUrl}
            disabled={isLoading}
            onMouseEnter={() => setHoveredItem('url')}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              ...styles.menuItem,
              ...(hoveredItem === 'url' ? styles.menuItemHover : {}),
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            <LinkIcon />
            Load Audio URL...
          </button>

          {/* Divider */}
          {hasContent && <div style={styles.divider} />}

          {/* Clear pad */}
          {hasContent && (
            <button
              onClick={handleClear}
              disabled={isLoading}
              onMouseEnter={() => setHoveredItem('clear')}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                ...styles.menuItem,
                ...styles.menuItemDestructive,
                ...(hoveredItem === 'clear' ? { backgroundColor: 'rgba(239,68,68,0.2)' } : {}),
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              <TrashIcon />
              Clear Pad
            </button>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div style={styles.loading}>
              <LoadingSpinner />
              Loading audio...
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ ...styles.error, padding: '8px 14px' }}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg style={{ ...styles.icon, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
      <circle
        style={{ opacity: 0.25 }}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        style={{ opacity: 0.75 }}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function MusicIcon() {
  return (
    <svg style={styles.icon} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg style={styles.icon} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg style={styles.icon} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}
