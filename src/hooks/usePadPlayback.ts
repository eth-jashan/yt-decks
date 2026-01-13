import { useCallback } from 'react'
import { usePadStore } from '../stores'
import { useAudioBufferStore } from '../stores/audioBufferStore'
import { getAudioEngine } from '../services/AudioEngine'
import { YouTubeExtractor } from '../services/YouTubeExtractor'
import type { Pad } from '../domain/types'

/**
 * Hook for pad playback management
 *
 * Handles:
 * - Loading YouTube audio into pads
 * - Playing/stopping pads through AudioEngine
 * - Managing voice lifecycle
 */
export function usePadPlayback() {
  const updatePad = usePadStore((state) => state.updatePad)
  const setPadState = usePadStore((state) => state.setPadState)
  const pads = usePadStore((state) => state.pads)

  const setBuffer = useAudioBufferStore((state) => state.setBuffer)
  const getBuffer = useAudioBufferStore((state) => state.getBuffer)
  const setActiveVoice = useAudioBufferStore((state) => state.setActiveVoice)
  const getActiveVoice = useAudioBufferStore((state) => state.getActiveVoice)
  const clearActiveVoice = useAudioBufferStore((state) => state.clearActiveVoice)

  /**
   * Load a YouTube video into a pad
   */
  const loadYouTube = useCallback(
    async (padId: string, youtubeUrl: string) => {
      const pad = pads.find((p) => p.id === padId)
      if (!pad) {
        console.error('[usePadPlayback] Pad not found:', padId)
        return false
      }

      // Validate URL
      const videoId = YouTubeExtractor.parseVideoId(youtubeUrl)
      if (!videoId) {
        console.error('[usePadPlayback] Invalid YouTube URL:', youtubeUrl)
        setPadState(padId, 'error')
        return false
      }

      // Set loading state
      setPadState(padId, 'loading')

      try {
        // Initialize audio engine if needed
        const engine = getAudioEngine()
        if (!engine.isInitialized()) {
          await engine.initialize()
        }

        // Extract audio from YouTube
        console.log('[usePadPlayback] Extracting audio for pad:', padId)
        const { metadata, audioBuffer } = await YouTubeExtractor.extract(youtubeUrl)

        // Decode audio
        console.log('[usePadPlayback] Decoding audio...')
        const decodedBuffer = await engine.decodeAudioData(audioBuffer)

        // Store the buffer
        setBuffer(padId, decodedBuffer)

        // Update pad with metadata
        updatePad(padId, {
          source: {
            type: 'youtube',
            youtubeId: videoId,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            title: metadata.title,
            duration: decodedBuffer.duration,
            thumbnail: metadata.thumbnail,
          },
          visual: {
            ...pad.visual,
            label: metadata.title.slice(0, 20),
          },
          playback: {
            ...pad.playback,
            outPoint: decodedBuffer.duration,
          },
          state: 'ready',
        })

        console.log('[usePadPlayback] Pad loaded successfully:', padId)
        return true
      } catch (error) {
        console.error('[usePadPlayback] Failed to load pad:', error)
        setPadState(padId, 'error')
        updatePad(padId, {
          errorMessage: error instanceof Error ? error.message : 'Failed to load audio',
        })
        return false
      }
    },
    [pads, updatePad, setPadState, setBuffer]
  )

  /**
   * Play a pad
   */
  const playPad = useCallback(
    (padId: string) => {
      const pad = pads.find((p) => p.id === padId)
      if (!pad) {
        console.error('[usePadPlayback] Pad not found:', padId)
        return
      }

      const buffer = getBuffer(padId)
      if (!buffer) {
        console.warn('[usePadPlayback] No audio buffer for pad:', padId)
        return
      }

      const engine = getAudioEngine()
      if (!engine.isInitialized()) {
        console.warn('[usePadPlayback] Audio engine not initialized')
        return
      }

      // Stop any existing voice for this pad
      const existingVoice = getActiveVoice(padId)
      if (existingVoice) {
        engine.stopVoice(existingVoice, pad.playback.fadeOut)
        clearActiveVoice(padId)
      }

      // Play the buffer
      const voiceId = engine.playBuffer(buffer, {
        volume: pad.audio.volume,
        pan: pad.audio.pan,
        playbackRate: pad.playback.halfSpeed ? 0.5 : 1,
        loop: pad.playback.mode === 'loop',
        offset: pad.playback.inPoint,
        duration:
          pad.playback.outPoint > 0
            ? pad.playback.outPoint - pad.playback.inPoint
            : undefined,
        fadeIn: pad.playback.fadeIn,
        fadeOut: pad.playback.fadeOut,
        onEnded: () => {
          clearActiveVoice(padId)
          // Only set to ready if still showing as playing
          const currentPad = usePadStore.getState().pads.find((p) => p.id === padId)
          if (currentPad?.state === 'playing') {
            setPadState(padId, 'ready')
          }
        },
      })

      setActiveVoice(padId, voiceId)
      setPadState(padId, 'playing')

      console.log('[usePadPlayback] Playing pad:', padId, 'voice:', voiceId)
    },
    [pads, getBuffer, getActiveVoice, clearActiveVoice, setActiveVoice, setPadState]
  )

  /**
   * Stop a pad
   */
  const stopPad = useCallback(
    (padId: string, fadeOut?: number) => {
      const pad = pads.find((p) => p.id === padId)
      const voiceId = getActiveVoice(padId)

      if (voiceId) {
        const engine = getAudioEngine()
        engine.stopVoice(voiceId, fadeOut ?? pad?.playback.fadeOut)
        clearActiveVoice(padId)
      }

      setPadState(padId, pad?.source ? 'ready' : 'empty')
      console.log('[usePadPlayback] Stopped pad:', padId)
    },
    [pads, getActiveVoice, clearActiveVoice, setPadState]
  )

  /**
   * Toggle pad playback
   */
  const togglePad = useCallback(
    (padId: string) => {
      const pad = pads.find((p) => p.id === padId)
      if (!pad) return

      if (pad.state === 'playing') {
        stopPad(padId)
      } else if (pad.state === 'ready') {
        playPad(padId)
      }
    },
    [pads, playPad, stopPad]
  )

  /**
   * Stop all playing pads
   */
  const stopAll = useCallback(
    (fadeOut?: number) => {
      const engine = getAudioEngine()
      engine.stopAll(fadeOut)

      // Clear all active voices and reset states
      pads.forEach((pad) => {
        if (pad.state === 'playing') {
          clearActiveVoice(pad.id)
          setPadState(pad.id, pad.source ? 'ready' : 'empty')
        }
      })

      console.log('[usePadPlayback] Stopped all pads')
    },
    [pads, clearActiveVoice, setPadState]
  )

  /**
   * Clear a pad (remove audio and reset)
   */
  const clearPad = useCallback(
    (padId: string) => {
      // Stop if playing
      stopPad(padId)

      // Remove buffer
      useAudioBufferStore.getState().removeBuffer(padId)

      // Reset pad to empty
      const pad = pads.find((p) => p.id === padId)
      if (pad) {
        updatePad(padId, {
          source: null,
          visual: {
            ...pad.visual,
            label: '',
            waveformData: null,
          },
          state: 'empty',
          errorMessage: undefined,
        })
      }

      console.log('[usePadPlayback] Cleared pad:', padId)
    },
    [pads, stopPad, updatePad]
  )

  /**
   * Load audio from a direct URL into a pad
   */
  const loadAudioUrl = useCallback(
    async (padId: string, audioUrl: string, title: string = 'Audio Sample') => {
      const pad = pads.find((p) => p.id === padId)
      if (!pad) {
        console.error('[usePadPlayback] Pad not found:', padId)
        return false
      }

      // Set loading state
      setPadState(padId, 'loading')

      try {
        // Initialize audio engine if needed
        const engine = getAudioEngine()
        if (!engine.isInitialized()) {
          console.log('[usePadPlayback] Initializing audio engine...')
          await engine.initialize()
        }
        await engine.resume()

        // Fetch audio from URL
        console.log('[usePadPlayback] Fetching audio from:', audioUrl)
        const response = await fetch(audioUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        console.log('[usePadPlayback] Fetched audio, size:', arrayBuffer.byteLength)

        // Decode audio
        console.log('[usePadPlayback] Decoding audio...')
        const decodedBuffer = await engine.decodeAudioData(arrayBuffer)
        console.log('[usePadPlayback] Decoded audio, duration:', decodedBuffer.duration)

        // Store the buffer
        setBuffer(padId, decodedBuffer)

        // Update pad with metadata
        updatePad(padId, {
          source: {
            type: 'audio-buffer',
            youtubeId: null,
            youtubeUrl: null,
            title: title,
            duration: decodedBuffer.duration,
            thumbnail: null,
          },
          visual: {
            ...pad.visual,
            label: title.slice(0, 20),
          },
          playback: {
            ...pad.playback,
            outPoint: decodedBuffer.duration,
          },
          state: 'ready',
        })

        console.log('[usePadPlayback] Pad loaded successfully:', padId)
        return true
      } catch (error) {
        console.error('[usePadPlayback] Failed to load audio:', error)
        setPadState(padId, 'error')
        updatePad(padId, {
          errorMessage: error instanceof Error ? error.message : 'Failed to load audio',
        })
        return false
      }
    },
    [pads, updatePad, setPadState, setBuffer]
  )

  return {
    loadYouTube,
    loadAudioUrl,
    playPad,
    stopPad,
    togglePad,
    stopAll,
    clearPad,
  }
}
