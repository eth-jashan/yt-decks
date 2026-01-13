import { useState, useCallback, useEffect } from 'react'

interface Position {
  x: number
  y: number
}

interface UseDraggableOptions {
  storageKey?: string
  initialPosition?: Position
  bounds?: {
    minX?: number
    maxX?: number
    minY?: number
    maxY?: number
  }
}

interface UseDraggableReturn {
  position: Position
  onMouseDown: (e: React.MouseEvent) => void
  setPosition: (pos: Position) => void
}

const STORAGE_KEY_PREFIX = 'yt-decks-position-'

function getStoredPosition(key: string): Position | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore storage errors
  }
  return null
}

function savePosition(key: string, position: Position): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(position))
  } catch {
    // Ignore storage errors
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function useDraggable(options: UseDraggableOptions = {}): UseDraggableReturn {
  const {
    storageKey = 'overlay',
    initialPosition = { x: 0, y: 0 },
  } = options

  const [position, setPositionState] = useState<Position>(() => {
    return getStoredPosition(storageKey) || initialPosition
  })

  const setPosition = useCallback((newPosition: Position) => {
    setPositionState(newPosition)
    if (storageKey) {
      savePosition(storageKey, newPosition)
    }
  }, [storageKey])

  const constrainToViewport = useCallback((pos: Position): Position => {
    const maxX = window.innerWidth - 600 // min overlay width
    const maxY = window.innerHeight - 400 // min overlay height

    return {
      x: clamp(pos.x, 0, Math.max(0, maxX)),
      y: clamp(pos.y, 0, Math.max(0, maxY)),
    }
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()

    const startX = e.clientX - position.x
    const startY = e.clientY - position.y

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newPosition = constrainToViewport({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      })
      setPosition(newPosition)
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [position, constrainToViewport, setPosition])

  // Re-constrain on window resize
  useEffect(() => {
    const handleResize = () => {
      setPositionState((prev) => constrainToViewport(prev))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [constrainToViewport])

  return {
    position,
    onMouseDown,
    setPosition,
  }
}
