/**
 * Messaging utilities for content script <-> background script communication
 */

export interface YouTubeMetadata {
  videoId: string
  title: string
  duration: number
  thumbnail: string
  channelName: string
}

export interface ExtractYouTubeResult {
  metadata: YouTubeMetadata
  audioBase64: string
}

interface MessageResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Send a message to the background script and wait for response
 */
function sendMessage<T>(message: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
      reject(new Error('Chrome runtime not available'))
      return
    }

    chrome.runtime.sendMessage(message, (response: MessageResponse<T>) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      if (!response) {
        reject(new Error('No response from background script'))
        return
      }

      if (response.success) {
        resolve(response.data as T)
      } else {
        reject(new Error(response.error || 'Unknown error'))
      }
    })
  })
}

/**
 * Extract YouTube audio via background script
 * Returns metadata and audio as base64 string
 */
export async function extractYouTubeViaBackground(
  videoId: string
): Promise<ExtractYouTubeResult> {
  console.log('[Messaging] Requesting YouTube extraction for:', videoId)

  const result = await sendMessage<ExtractYouTubeResult>({
    type: 'EXTRACT_YOUTUBE',
    videoId,
  })

  console.log('[Messaging] Extraction complete, metadata:', result.metadata.title)
  return result
}

/**
 * Fetch audio from URL via background script (bypasses CORS)
 * Returns audio as base64 string
 */
export async function fetchAudioViaBackground(url: string): Promise<string> {
  console.log('[Messaging] Requesting audio fetch for:', url)

  const audioBase64 = await sendMessage<string>({
    type: 'FETCH_AUDIO',
    url,
  })

  console.log('[Messaging] Audio fetch complete')
  return audioBase64
}

/**
 * Get YouTube metadata via background script
 */
export async function getYouTubeMetadataViaBackground(
  videoId: string
): Promise<YouTubeMetadata> {
  console.log('[Messaging] Requesting metadata for:', videoId)

  const metadata = await sendMessage<YouTubeMetadata>({
    type: 'GET_METADATA',
    videoId,
  })

  console.log('[Messaging] Got metadata:', metadata.title)
  return metadata
}

/**
 * Convert base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Check if background messaging is available
 */
export function isBackgroundMessagingAvailable(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.runtime?.sendMessage
}
