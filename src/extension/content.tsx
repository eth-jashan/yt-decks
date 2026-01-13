import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Overlay } from '../components/Overlay'
import { useUIStore } from '../stores'

const CONTAINER_ID = 'yt-decks-root'
const KEYBOARD_SHORTCUT = { key: 'd', altKey: true }

function App() {
  const toggleOverlay = useUIStore((state) => state.toggleOverlay)
  const isVisible = useUIStore((state) => state.isOverlayVisible)

  useEffect(() => {
    console.log('[YT Decks] App mounted, overlay visible:', isVisible)

    const handleKeyDown = (e: KeyboardEvent) => {
      // Log all key presses for debugging
      if (e.altKey) {
        console.log('[YT Decks] Alt key pressed with:', e.key)
      }

      if (
        e.key.toLowerCase() === KEYBOARD_SHORTCUT.key &&
        e.altKey === KEYBOARD_SHORTCUT.altKey &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        console.log('[YT Decks] Shortcut matched! Toggling overlay...')
        e.preventDefault()
        toggleOverlay()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleOverlay, isVisible])

  return <Overlay />
}

function init() {
  console.log('[YT Decks] init() called')

  // Check if already initialized
  if (document.getElementById(CONTAINER_ID)) {
    console.log('[YT Decks] Already initialized, skipping')
    return
  }

  // Create container
  const container = document.createElement('div')
  container.id = CONTAINER_ID

  // Reset all inherited styles
  container.style.cssText = `
    all: initial;
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    z-index: 2147483647;
    pointer-events: none;
  `

  document.body.appendChild(container)

  // Create shadow root for style isolation
  const shadowRoot = container.attachShadow({ mode: 'open' })

  // Create inner container for React
  const appContainer = document.createElement('div')
  appContainer.id = 'yt-decks-app'
  appContainer.style.cssText = `
    pointer-events: auto;
  `
  shadowRoot.appendChild(appContainer)

  // Inject Tailwind styles into shadow root
  const styleSheet = document.createElement('style')
  styleSheet.textContent = getTailwindStyles()
  shadowRoot.appendChild(styleSheet)

  // Render React app
  const root = createRoot(appContainer)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

function getTailwindStyles(): string {
  // Minimal Tailwind-like utility styles for the overlay
  // In production, this would be replaced with actual Tailwind CSS build
  return `
    *, *::before, *::after {
      box-sizing: border-box;
      border-width: 0;
      border-style: solid;
    }

    .fixed { position: fixed; }
    .absolute { position: absolute; }
    .relative { position: relative; }

    .inset-0 { inset: 0; }
    .inset-x-0 { left: 0; right: 0; }
    .top-0 { top: 0; }
    .bottom-0 { bottom: 0; }
    .left-0 { left: 0; }
    .right-0 { right: 0; }

    .z-\\[2147483647\\] { z-index: 2147483647; }

    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-1 { flex: 1 1 0%; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }

    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }

    .h-12 { height: 3rem; }
    .h-8 { height: 2rem; }
    .h-px { height: 1px; }
    .h-full { height: 100%; }
    .w-8 { width: 2rem; }
    .w-0 { width: 0; }

    .p-4 { padding: 1rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }

    .mt-2 { margin-top: 0.5rem; }

    .overflow-auto { overflow: auto; }

    .rounded-md { border-radius: 0.375rem; }
    .rounded-t-2xl { border-top-left-radius: 1rem; border-top-right-radius: 1rem; }

    .border { border-width: 1px; }
    .border-b { border-bottom-width: 1px; }
    .border-purple-500\\/30 { border-color: rgb(168 85 247 / 0.3); }
    .border-white\\/10 { border-color: rgb(255 255 255 / 0.1); }

    .bg-\\[\\#0F0F0F\\]\\/95 { background-color: rgb(15 15 15 / 0.95); }
    .bg-purple-600 { background-color: rgb(147 51 234); }

    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .tracking-wider { letter-spacing: 0.05em; }
    .capitalize { text-transform: capitalize; }

    .text-white { color: rgb(255 255 255); }
    .text-white\\/80 { color: rgb(255 255 255 / 0.8); }
    .text-gray-400 { color: rgb(156 163 175); }
    .text-gray-500 { color: rgb(107 114 128); }
    .text-purple-500 { color: rgb(168 85 247); }

    .text-center { text-align: center; }

    .shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
    .shadow-purple-500\\/10 { --tw-shadow-color: rgb(168 85 247 / 0.1); }
    .shadow-purple-500\\/25 { --tw-shadow-color: rgb(168 85 247 / 0.25); }

    .backdrop-blur-xl { backdrop-filter: blur(24px); }

    .cursor-move { cursor: move; }
    .select-none { user-select: none; }
    .pointer-events-none { pointer-events: none; }
    .pointer-events-auto { pointer-events: auto; }

    .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-colors { transition-property: color, background-color, border-color; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .duration-150 { transition-duration: 150ms; }
    .ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }

    .translate-y-0 { transform: translateY(0); }
    .translate-y-full { transform: translateY(100%); }

    .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
    .from-transparent { --tw-gradient-from: transparent; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
    .via-purple-500\\/50 { --tw-gradient-stops: var(--tw-gradient-from), rgb(168 85 247 / 0.5), var(--tw-gradient-to); }
    .to-transparent { --tw-gradient-to: transparent; }

    /* Grid */
    .grid { display: grid; }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

    /* Aspect ratio */
    .aspect-square { aspect-ratio: 1 / 1; }

    /* More sizing */
    .w-full { width: 100%; }
    .h-1 { height: 0.25rem; }
    .h-0\\.5 { height: 0.125rem; }
    .min-h-0 { min-height: 0; }

    /* More spacing */
    .p-2 { padding: 0.5rem; }
    .p-1 { padding: 0.25rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }

    /* More colors */
    .bg-white\\/5 { background-color: rgb(255 255 255 / 0.05); }
    .bg-white\\/10 { background-color: rgb(255 255 255 / 0.1); }
    .bg-black\\/50 { background-color: rgb(0 0 0 / 0.5); }
    .bg-red-500 { background-color: rgb(239 68 68); }
    .bg-yellow-500 { background-color: rgb(234 179 8); }
    .bg-green-500 { background-color: rgb(34 197 94); }
    .border-dashed { border-style: dashed; }
    .border-white\\/20 { border-color: rgb(255 255 255 / 0.2); }
    .border-2 { border-width: 2px; }

    /* Text */
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-\\[10px\\] { font-size: 10px; }
    .font-mono { font-family: ui-monospace, monospace; }
    .uppercase { text-transform: uppercase; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* Opacity */
    .opacity-0 { opacity: 0; }
    .opacity-50 { opacity: 0.5; }
    .opacity-70 { opacity: 0.7; }
    .opacity-100 { opacity: 1; }

    /* Cursor */
    .cursor-pointer { cursor: pointer; }

    /* Overflow */
    .overflow-hidden { overflow: hidden; }

    /* Object fit */
    .object-cover { object-fit: cover; }

    /* Rounded */
    .rounded { border-radius: 0.25rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-full { border-radius: 9999px; }

    /* Inset */
    .inset-0 { inset: 0; }

    /* Z-index */
    .z-10 { z-index: 10; }
    .z-20 { z-index: 20; }

    /* Group hover */
    .group:hover .group-hover\\:opacity-100 { opacity: 1; }

    /* Hover states */
    .hover\\:text-white:hover { color: rgb(255 255 255); }
    .hover\\:text-red-400:hover { color: rgb(248 113 113); }
    .hover\\:bg-white\\/5:hover { background-color: rgb(255 255 255 / 0.05); }
    .hover\\:bg-white\\/10:hover { background-color: rgb(255 255 255 / 0.1); }
    .hover\\:bg-red-500\\/10:hover { background-color: rgb(239 68 68 / 0.1); }
    .hover\\:opacity-100:hover { opacity: 1; }
    .hover\\:border-purple-500\\/50:hover { border-color: rgb(168 85 247 / 0.5); }

    /* More sizing for icons */
    .h-2 { height: 0.5rem; }
    .w-2 { width: 0.5rem; }
    .h-5 { height: 1.25rem; }
    .w-5 { width: 1.25rem; }
    .h-6 { height: 1.5rem; }
    .w-6 { width: 1.5rem; }

    /* Backgrounds */
    .bg-\\[\\#1a1a1a\\] { background-color: #1a1a1a; }
    .bg-cover { background-size: cover; }
    .bg-center { background-position: center; }
    .bg-black\\/40 { background-color: rgb(0 0 0 / 0.4); }

    /* Borders */
    .border-purple-500 { border-color: rgb(168 85 247); }
    .border-yellow-500\\/70 { border-color: rgb(234 179 8 / 0.7); }
    .border-red-500\\/50 { border-color: rgb(239 68 68 / 0.5); }
    .border-white\\/30 { border-color: rgb(255 255 255 / 0.3); }
    .border-white\\/40 { border-color: rgb(255 255 255 / 0.4); }

    /* Text colors */
    .text-white\\/40 { color: rgb(255 255 255 / 0.4); }
    .text-white\\/50 { color: rgb(255 255 255 / 0.5); }
    .text-white\\/60 { color: rgb(255 255 255 / 0.6); }
    .text-white\\/70 { color: rgb(255 255 255 / 0.7); }
    .text-white\\/90 { color: rgb(255 255 255 / 0.9); }
    .text-red-400 { color: rgb(248 113 113); }

    /* Opacity */
    .opacity-20 { opacity: 0.2; }
    .opacity-25 { opacity: 0.25; }
    .opacity-60 { opacity: 0.6; }
    .opacity-75 { opacity: 0.75; }

    /* Focus states */
    .focus\\:outline-none:focus { outline: none; }
    .focus\\:ring-2:focus { box-shadow: 0 0 0 2px var(--ring-color, rgb(168 85 247)); }
    .focus\\:ring-purple-500:focus { --ring-color: rgb(168 85 247); }

    /* Hover states for pads */
    .hover\\:opacity-70:hover { opacity: 0.7; }
    .hover\\:border-white\\/40:hover { border-color: rgb(255 255 255 / 0.4); }
    .hover\\:border-white\\/60:hover { border-color: rgb(255 255 255 / 0.6); }
    .group:hover .group-hover\\:text-white\\/60 { color: rgb(255 255 255 / 0.6); }

    /* Drop shadow */
    .drop-shadow-lg { filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1)); }

    /* Ring */
    .ring-2 { box-shadow: 0 0 0 2px var(--ring-color, rgb(168 85 247)); }
    .ring-purple-500 { --ring-color: rgb(168 85 247); }
    .ring-offset-1 { box-shadow: 0 0 0 1px var(--ring-offset-color, #0F0F0F), 0 0 0 3px var(--ring-color, rgb(168 85 247)); }
    .ring-offset-2 { box-shadow: 0 0 0 2px var(--ring-offset-color, #0F0F0F), 0 0 0 4px var(--ring-color, rgb(168 85 247)); }
    .ring-offset-\\[\\#0F0F0F\\] { --ring-offset-color: #0F0F0F; }

    /* Transition */
    .transition-opacity { transition-property: opacity; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }

    /* Z-index */
    .z-30 { z-index: 30; }

    /* Animations */
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 10px rgb(168 85 247); }
      50% { box-shadow: 0 0 25px rgb(168 85 247), 0 0 40px rgb(168 85 247); }
    }
    @keyframes blink-border {
      0%, 100% { border-color: rgba(234, 179, 8, 0.7); }
      50% { border-color: rgba(234, 179, 8, 0.3); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .animate-spin { animation: spin 1s linear infinite; }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    .pad-playing { animation: pulse-glow 1s ease-in-out infinite; }
    .pad-queued { animation: blink-border 0.5s ease-in-out infinite; }
  `
}

// Initialize when DOM is ready
console.log('[YT Decks] Content script loaded, readyState:', document.readyState)

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[YT Decks] DOMContentLoaded, initializing...')
    init()
  })
} else {
  console.log('[YT Decks] DOM ready, initializing...')
  init()
}
