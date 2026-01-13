import React from 'react'

export interface PadProgressProps {
  progress: number // 0-1
  color: string
  isPlaying: boolean
}

export function PadProgress({ progress, color, isPlaying }: PadProgressProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const percentage = clampedProgress * 100

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-black/50 overflow-hidden">
      <div
        className={`
          h-full
          transition-all
          ${isPlaying ? 'duration-100' : 'duration-300'}
          ease-linear
        `}
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
          boxShadow: isPlaying ? `0 0 4px ${color}` : 'none',
        }}
      />
    </div>
  )
}
