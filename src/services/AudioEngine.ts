/**
 * Audio voice - represents an active playing sound
 */
interface AudioVoice {
  source: AudioBufferSourceNode
  gain: GainNode
  panner: StereoPannerNode
  startTime: number
}

/**
 * Playback options for playing a buffer
 */
export interface PlaybackOptions {
  voiceId?: string
  volume?: number
  pan?: number
  playbackRate?: number
  loop?: boolean
  offset?: number
  duration?: number
  fadeIn?: number
  fadeOut?: number
  onEnded?: () => void
}

/**
 * Audio Engine - Web Audio API wrapper for sample playback
 *
 * Features:
 * - Master volume and analyzer for visualization
 * - Per-voice gain, pan, and playback rate
 * - Fade in/out support
 * - Voice management for stopping individual or all sounds
 */
export class AudioEngine {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null
  private masterAnalyzer: AnalyserNode | null = null
  private activeVoices: Map<string, AudioVoice> = new Map()
  private initialized = false

  /**
   * Initialize the audio context and master chain
   * Must be called after a user interaction (click, key press)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    this.context = new AudioContext()
    this.masterGain = this.context.createGain()
    this.masterAnalyzer = this.context.createAnalyser()

    // Configure analyzer for visualization
    this.masterAnalyzer.fftSize = 256
    this.masterAnalyzer.smoothingTimeConstant = 0.8

    // Connect master chain: gain -> analyzer -> destination
    this.masterGain.connect(this.masterAnalyzer)
    this.masterAnalyzer.connect(this.context.destination)

    this.initialized = true
    console.log('[AudioEngine] Initialized with sample rate:', this.context.sampleRate)
  }

  /**
   * Resume the audio context if suspended
   * Browsers suspend AudioContext until user interaction
   */
  async resume(): Promise<void> {
    if (this.context?.state === 'suspended') {
      await this.context.resume()
      console.log('[AudioEngine] Resumed')
    }
  }

  /**
   * Check if engine is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Check if context is running
   */
  isRunning(): boolean {
    return this.context?.state === 'running'
  }

  /**
   * Play an AudioBuffer with options
   * Returns a voice ID that can be used to stop the sound
   */
  playBuffer(buffer: AudioBuffer, options: PlaybackOptions = {}): string {
    if (!this.context || !this.masterGain) {
      throw new Error('AudioEngine not initialized')
    }

    const voiceId = options.voiceId || crypto.randomUUID()
    const now = this.context.currentTime

    // Create audio nodes
    const source = this.context.createBufferSource()
    const gain = this.context.createGain()
    const panner = this.context.createStereoPanner()

    // Configure source
    source.buffer = buffer
    source.loop = options.loop ?? false
    source.playbackRate.value = options.playbackRate ?? 1

    // Configure gain with optional fade in
    const volume = options.volume ?? 1
    if (options.fadeIn && options.fadeIn > 0) {
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(volume, now + options.fadeIn / 1000)
    } else {
      gain.gain.value = volume
    }

    // Configure panner (-1 = left, 0 = center, 1 = right)
    panner.pan.value = options.pan ?? 0

    // Connect: source -> gain -> panner -> master
    source.connect(gain)
    gain.connect(panner)
    panner.connect(this.masterGain)

    // Handle fade out if duration is specified
    const offset = options.offset ?? 0
    const duration = options.duration

    if (duration && options.fadeOut && options.fadeOut > 0) {
      const fadeOutStart = now + duration / 1000 - options.fadeOut / 1000
      gain.gain.setValueAtTime(volume, fadeOutStart)
      gain.gain.linearRampToValueAtTime(0, now + duration / 1000)
    }

    // Start playback
    if (duration) {
      source.start(0, offset, duration)
    } else {
      source.start(0, offset)
    }

    // Handle end event
    source.onended = () => {
      this.activeVoices.delete(voiceId)
      options.onEnded?.()
    }

    // Store voice
    this.activeVoices.set(voiceId, {
      source,
      gain,
      panner,
      startTime: now,
    })

    return voiceId
  }

  /**
   * Stop a specific voice
   */
  stopVoice(voiceId: string, fadeOut?: number): void {
    const voice = this.activeVoices.get(voiceId)
    if (!voice || !this.context) return

    if (fadeOut && fadeOut > 0) {
      const now = this.context.currentTime
      voice.gain.gain.setValueAtTime(voice.gain.gain.value, now)
      voice.gain.gain.linearRampToValueAtTime(0, now + fadeOut / 1000)
      voice.source.stop(now + fadeOut / 1000)
    } else {
      voice.source.stop()
    }

    this.activeVoices.delete(voiceId)
  }

  /**
   * Stop all active voices
   */
  stopAll(fadeOut?: number): void {
    this.activeVoices.forEach((_, voiceId) => {
      this.stopVoice(voiceId, fadeOut)
    })
    this.activeVoices.clear()
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value))
    }
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterGain?.gain.value ?? 1
  }

  /**
   * Update voice volume
   */
  setVoiceVolume(voiceId: string, value: number): void {
    const voice = this.activeVoices.get(voiceId)
    if (voice) {
      voice.gain.gain.value = Math.max(0, Math.min(1, value))
    }
  }

  /**
   * Update voice pan
   */
  setVoicePan(voiceId: string, value: number): void {
    const voice = this.activeVoices.get(voiceId)
    if (voice) {
      voice.panner.pan.value = Math.max(-1, Math.min(1, value))
    }
  }

  /**
   * Update voice playback rate
   */
  setVoicePlaybackRate(voiceId: string, value: number): void {
    const voice = this.activeVoices.get(voiceId)
    if (voice) {
      voice.source.playbackRate.value = Math.max(0.1, Math.min(4, value))
    }
  }

  /**
   * Check if a voice is active
   */
  isVoiceActive(voiceId: string): boolean {
    return this.activeVoices.has(voiceId)
  }

  /**
   * Get number of active voices
   */
  getActiveVoiceCount(): number {
    return this.activeVoices.size
  }

  /**
   * Get audio context
   */
  getContext(): AudioContext | null {
    return this.context
  }

  /**
   * Get master analyzer for visualization
   */
  getMasterAnalyzer(): AnalyserNode | null {
    return this.masterAnalyzer
  }

  /**
   * Get frequency data from analyzer
   */
  getFrequencyData(): Uint8Array | null {
    if (!this.masterAnalyzer) return null

    const data = new Uint8Array(this.masterAnalyzer.frequencyBinCount)
    this.masterAnalyzer.getByteFrequencyData(data)
    return data
  }

  /**
   * Get time domain data from analyzer (waveform)
   */
  getTimeDomainData(): Uint8Array | null {
    if (!this.masterAnalyzer) return null

    const data = new Uint8Array(this.masterAnalyzer.frequencyBinCount)
    this.masterAnalyzer.getByteTimeDomainData(data)
    return data
  }

  /**
   * Decode audio data from ArrayBuffer
   */
  async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    if (!this.context) {
      throw new Error('AudioEngine not initialized')
    }

    return await this.context.decodeAudioData(arrayBuffer)
  }

  /**
   * Cleanup and dispose
   */
  async dispose(): Promise<void> {
    this.stopAll()

    if (this.context) {
      await this.context.close()
      this.context = null
    }

    this.masterGain = null
    this.masterAnalyzer = null
    this.initialized = false

    console.log('[AudioEngine] Disposed')
  }
}

// Singleton instance
let audioEngineInstance: AudioEngine | null = null

/**
 * Get the singleton AudioEngine instance
 */
export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine()
  }
  return audioEngineInstance
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetAudioEngine(): void {
  if (audioEngineInstance) {
    audioEngineInstance.dispose()
    audioEngineInstance = null
  }
}
