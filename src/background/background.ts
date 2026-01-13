/**
 * Background Service Worker for YT Decks
 *
 * Handles cross-origin requests that content scripts cannot make due to CORS.
 * Uses Chrome Extension's background script privileges to fetch from any URL.
 */

// Message types
interface ExtractYouTubeMessage {
  type: 'EXTRACT_YOUTUBE'
  videoId: string
}

interface FetchAudioMessage {
  type: 'FETCH_AUDIO'
  url: string
}

interface GetMetadataMessage {
  type: 'GET_METADATA'
  videoId: string
}

type Message = ExtractYouTubeMessage | FetchAudioMessage | GetMetadataMessage

interface YouTubeMetadata {
  videoId: string
  title: string
  duration: number
  thumbnail: string
  channelName: string
}

// Cobalt API for audio extraction
const COBALT_API = 'https://api.cobalt.tools/api/json'

/**
 * Get video metadata from YouTube oEmbed API
 */
async function getMetadata(videoId: string): Promise<YouTubeMetadata> {
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
      duration: 0,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      channelName: data.author_name || 'Unknown Channel',
    }
  } catch (error) {
    console.error('[Background] Failed to get metadata:', error)
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
async function getAudioUrl(videoId: string): Promise<string> {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`

  console.log('[Background] Requesting Cobalt API for:', videoId)

  const response = await fetch(COBALT_API, {
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
  console.log('[Background] Cobalt response:', data)

  if (data.status === 'error') {
    throw new Error(data.text || 'Extraction failed')
  }

  if (data.status === 'redirect' || data.status === 'stream') {
    return data.url
  }

  throw new Error('Unexpected response format from Cobalt')
}

/**
 * Fetch audio data from URL and return as base64
 */
async function fetchAudioAsBase64(audioUrl: string): Promise<string> {
  console.log('[Background] Fetching audio from:', audioUrl)

  const response = await fetch(audioUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  console.log('[Background] Fetched audio, size:', arrayBuffer.byteLength)

  // Convert ArrayBuffer to base64
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Full YouTube extraction: metadata + audio as base64
 */
async function extractYouTube(videoId: string): Promise<{
  metadata: YouTubeMetadata
  audioBase64: string
}> {
  console.log('[Background] Starting extraction for:', videoId)

  // Get metadata and audio URL
  const [metadata, audioUrl] = await Promise.all([
    getMetadata(videoId),
    getAudioUrl(videoId),
  ])

  console.log('[Background] Got audio URL:', audioUrl)

  // Fetch audio as base64
  const audioBase64 = await fetchAudioAsBase64(audioUrl)

  console.log('[Background] Extraction complete')

  return { metadata, audioBase64 }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  console.log('[Background] Received message:', message.type)

  if (message.type === 'EXTRACT_YOUTUBE') {
    extractYouTube(message.videoId)
      .then((result) => {
        console.log('[Background] Sending success response')
        sendResponse({ success: true, data: result })
      })
      .catch((error) => {
        console.error('[Background] Extraction error:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Keep channel open for async response
  }

  if (message.type === 'FETCH_AUDIO') {
    fetchAudioAsBase64(message.url)
      .then((audioBase64) => {
        sendResponse({ success: true, data: audioBase64 })
      })
      .catch((error) => {
        console.error('[Background] Fetch error:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  if (message.type === 'GET_METADATA') {
    getMetadata(message.videoId)
      .then((metadata) => {
        sendResponse({ success: true, data: metadata })
      })
      .catch((error) => {
        console.error('[Background] Metadata error:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  return false
})

console.log('[Background] YT Decks background script loaded')
