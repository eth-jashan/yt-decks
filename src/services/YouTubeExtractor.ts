import { parseYouTubeId } from '../domain/helpers'

/**
 * YouTube video metadata
 */
export interface YouTubeMetadata {
  videoId: string
  title: string
  duration: number
  thumbnail: string
  channelName: string
}

/**
 * Audio extraction result
 */
export interface ExtractionResult {
  metadata: YouTubeMetadata
  audioBuffer: ArrayBuffer
}

/**
 * YouTube audio extractor service
 *
 * Uses cobalt.tools API for audio extraction (free, no API key required)
 * Fallback to other methods if needed
 */
export class YouTubeExtractor {
  private static readonly COBALT_API = 'https://api.cobalt.tools/api/json'

  /**
   * Extract video ID from various YouTube URL formats
   */
  static parseVideoId(input: string): string | null {
    return parseYouTubeId(input)
  }

  /**
   * Get video metadata from YouTube oEmbed API
   */
  static async getMetadata(videoId: string): Promise<YouTubeMetadata> {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`)
      }

      const data = await response.json()

      return {
        videoId,
        title: data.title || 'Unknown Title',
        duration: 0, // oEmbed doesn't provide duration, will get from audio
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channelName: data.author_name || 'Unknown Channel',
      }
    } catch (error) {
      console.error('[YouTubeExtractor] Failed to get metadata:', error)
      // Return basic metadata if oEmbed fails
      return {
        videoId,
        title: 'YouTube Video',
        duration: 0,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channelName: 'Unknown',
      }
    }
  }

  /**
   * Extract audio URL using Cobalt API
   */
  static async getAudioUrl(videoId: string): Promise<string> {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`

    try {
      const response = await fetch(this.COBALT_API, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: youtubeUrl,
          vCodec: 'h264',
          vQuality: '720',
          aFormat: 'mp3',
          isAudioOnly: true,
          filenamePattern: 'basic',
        }),
      })

      if (!response.ok) {
        throw new Error(`Cobalt API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'error') {
        throw new Error(data.text || 'Extraction failed')
      }

      if (data.status === 'redirect' || data.status === 'stream') {
        return data.url
      }

      throw new Error('Unexpected response format')
    } catch (error) {
      console.error('[YouTubeExtractor] Cobalt extraction failed:', error)
      throw error
    }
  }

  /**
   * Fetch audio data as ArrayBuffer
   */
  static async fetchAudio(audioUrl: string): Promise<ArrayBuffer> {
    const response = await fetch(audioUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`)
    }

    return await response.arrayBuffer()
  }

  /**
   * Full extraction: get metadata and audio buffer
   */
  static async extract(input: string): Promise<ExtractionResult> {
    const videoId = this.parseVideoId(input)
    if (!videoId) {
      throw new Error('Invalid YouTube URL or video ID')
    }

    console.log('[YouTubeExtractor] Extracting video:', videoId)

    // Get metadata and audio URL in parallel
    const [metadata, audioUrl] = await Promise.all([
      this.getMetadata(videoId),
      this.getAudioUrl(videoId),
    ])

    console.log('[YouTubeExtractor] Got audio URL, fetching...')

    // Fetch audio data
    const audioBuffer = await this.fetchAudio(audioUrl)

    console.log('[YouTubeExtractor] Extraction complete, size:', audioBuffer.byteLength)

    return {
      metadata,
      audioBuffer,
    }
  }

  /**
   * Quick validate if input is a valid YouTube URL/ID
   */
  static isValidInput(input: string): boolean {
    return this.parseVideoId(input) !== null
  }
}

// Singleton instance for convenience
export const youtubeExtractor = new YouTubeExtractor()
