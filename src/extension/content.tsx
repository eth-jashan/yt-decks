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

    /* Hover states */
    .hover\\:text-white:hover { color: rgb(255 255 255); }
    .hover\\:text-red-400:hover { color: rgb(248 113 113); }
    .hover\\:bg-white\\/5:hover { background-color: rgb(255 255 255 / 0.05); }
    .hover\\:bg-white\\/10:hover { background-color: rgb(255 255 255 / 0.1); }
    .hover\\:bg-red-500\\/10:hover { background-color: rgb(239 68 68 / 0.1); }
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
