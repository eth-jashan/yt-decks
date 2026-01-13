import React, { useCallback } from 'react'
import type { Pad as PadType } from '../../domain/types'
import { PadProgress } from './PadProgress'

export interface PadProps {
  pad: PadType
  onTrigger: () => void
  onContextMenu: (e: React.MouseEvent) => void
  isSelected: boolean
  keyboardHint: string
}

export function Pad({
  pad,
  onTrigger,
  onContextMenu,
  isSelected,
  keyboardHint,
}: PadProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onTrigger()
    },
    [onTrigger]
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onContextMenu(e)
    },
    [onContextMenu]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onTrigger()
      }
    },
    [onTrigger]
  )

  const isEmpty = pad.state === 'empty'
  const isLoading = pad.state === 'loading'
  const isReady = pad.state === 'ready'
  const isPlaying = pad.state === 'playing'
  const isQueued = pad.state === 'queued'
  const isError = pad.state === 'error'

  const padColor = pad.visual.color || '#8B5CF6'

  return (
    <button
      type="button"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      className={`
        pad
        relative
        aspect-square
        w-full
        rounded-lg
        border-2
        bg-[#1a1a1a]
        transition-all
        duration-150
        ease-out
        focus:outline-none
        focus:ring-2
        focus:ring-purple-500
        focus:ring-offset-2
        focus:ring-offset-[#0F0F0F]
        overflow-hidden
        group
        ${isEmpty ? 'border-dashed border-white/20 opacity-50 hover:opacity-70 hover:border-white/40' : ''}
        ${isLoading ? 'border-white/30' : ''}
        ${isReady ? 'border-white/40 hover:border-white/60' : ''}
        ${isPlaying ? 'pad-playing border-purple-500' : ''}
        ${isQueued ? 'pad-queued border-yellow-500/70' : ''}
        ${isError ? 'border-red-500/50' : ''}
        ${isSelected ? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-[#0F0F0F]' : ''}
      `}
      style={{
        '--pad-color': padColor,
        '--color-primary': padColor,
      } as React.CSSProperties}
      aria-label={pad.visual.label || `Pad ${pad.position.index + 1}`}
      aria-pressed={isPlaying}
    >
      {/* Background/Thumbnail */}
      {pad.source?.thumbnail && !isEmpty && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${pad.source.thumbnail})` }}
        />
      )}

      {/* Color overlay for non-empty pads */}
      {!isEmpty && (
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundColor: padColor }}
        />
      )}

      {/* Content based on state */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-1">
        {/* Empty state */}
        {isEmpty && (
          <svg
            className="h-6 w-6 text-white/40 group-hover:text-white/60 transition-colors duration-150"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="pad-loader">
            <svg
              className="h-6 w-6 text-white/70 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
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
          </div>
        )}

        {/* Ready/Playing state - Label */}
        {(isReady || isPlaying || isQueued) && pad.visual.label && (
          <span className="text-xs font-medium text-white/90 text-center truncate w-full px-1 drop-shadow-lg">
            {pad.visual.label}
          </span>
        )}

        {/* Error state */}
        {isError && (
          <svg
            className="h-5 w-5 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )}
      </div>

      {/* Hover overlay with play icon */}
      {!isEmpty && !isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {isPlaying ? (
            <svg
              className="h-8 w-8 text-white drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg
              className="h-8 w-8 text-white drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      )}

      {/* Keyboard hint */}
      {keyboardHint && (
        <span className="absolute bottom-1 left-1 z-30 text-[10px] font-mono text-white/50 uppercase">
          {keyboardHint}
        </span>
      )}

      {/* Progress bar */}
      {(isPlaying || isReady) && pad.source && (
        <PadProgress
          progress={isPlaying ? 0.5 : 0} // TODO: Get actual progress from audio engine
          color={padColor}
          isPlaying={isPlaying}
        />
      )}

      {/* Playing indicator dot */}
      {isPlaying && (
        <div
          className="absolute top-1 right-1 z-30 h-2 w-2 rounded-full animate-pulse"
          style={{ backgroundColor: padColor }}
        />
      )}

      {/* Queued indicator */}
      {isQueued && (
        <div className="absolute top-1 right-1 z-30 h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
      )}
    </button>
  )
}
