import { useEffect, useState, useCallback, useRef } from 'react'
import { getAudioEngine, type PlaybackOptions } from '../services/AudioEngine'

/**
 * Hook to access the singleton AudioEngine instance
 *
 * Handles:
 * - Lazy initialization on first user interaction
 * - Auto-resume on context suspend
 * - Cleanup on unmount
 */
export function useAudioEngine() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const initAttempted = useRef(false)

  const engine = getAudioEngine()

  // Initialize on user interaction
  const initialize = useCallback(async () => {
    if (initAttempted.current) return

    initAttempted.current = true

    try {
      await engine.initialize()
      await engine.resume()
      setIsInitialized(true)
      setIsRunning(engine.isRunning())
      console.log('[useAudioEngine] Engine initialized')
    } catch (error) {
      console.error('[useAudioEngine] Failed to initialize:', error)
      initAttempted.current = false
    }
  }, [engine])

  // Resume context if suspended
  const resume = useCallback(async () => {
    try {
      await engine.resume()
      setIsRunning(engine.isRunning())
    } catch (error) {
      console.error('[useAudioEngine] Failed to resume:', error)
    }
  }, [engine])

  // Play buffer wrapper
  const playBuffer = useCallback(
    (buffer: AudioBuffer, options?: PlaybackOptions) => {
      if (!engine.isInitialized()) {
        console.warn('[useAudioEngine] Engine not initialized')
        return null
      }
      return engine.playBuffer(buffer, options ?? {})
    },
    [engine]
  )

  // Stop voice wrapper
  const stopVoice = useCallback(
    (voiceId: string, fadeOut?: number) => {
      engine.stopVoice(voiceId, fadeOut)
    },
    [engine]
  )

  // Stop all wrapper
  const stopAll = useCallback(
    (fadeOut?: number) => {
      engine.stopAll(fadeOut)
    },
    [engine]
  )

  // Set master volume wrapper
  const setMasterVolume = useCallback(
    (value: number) => {
      engine.setMasterVolume(value)
    },
    [engine]
  )

  // Decode audio data wrapper
  const decodeAudioData = useCallback(
    async (arrayBuffer: ArrayBuffer) => {
      if (!engine.isInitialized()) {
        await initialize()
      }
      return engine.decodeAudioData(arrayBuffer)
    },
    [engine, initialize]
  )

  // Auto-initialize on first user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!engine.isInitialized()) {
        initialize()
      } else if (!engine.isRunning()) {
        resume()
      }
    }

    // Listen for user interactions to init/resume audio
    window.addEventListener('click', handleUserInteraction, { once: false })
    window.addEventListener('keydown', handleUserInteraction, { once: false })
    window.addEventListener('touchstart', handleUserInteraction, { once: false })

    return () => {
      window.removeEventListener('click', handleUserInteraction)
      window.removeEventListener('keydown', handleUserInteraction)
      window.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [engine, initialize, resume])

  // Update state when context state changes
  useEffect(() => {
    if (!engine.getContext()) return

    const context = engine.getContext()
    if (!context) return

    const handleStateChange = () => {
      setIsRunning(context.state === 'running')
    }

    context.addEventListener('statechange', handleStateChange)
    return () => {
      context.removeEventListener('statechange', handleStateChange)
    }
  }, [engine, isInitialized])

  return {
    // State
    isInitialized,
    isRunning,
    engine,

    // Methods
    initialize,
    resume,
    playBuffer,
    stopVoice,
    stopAll,
    setMasterVolume,
    decodeAudioData,

    // Direct access for advanced use
    getContext: () => engine.getContext(),
    getAnalyzer: () => engine.getMasterAnalyzer(),
    getFrequencyData: () => engine.getFrequencyData(),
    getTimeDomainData: () => engine.getTimeDomainData(),
  }
}
