// YT Decks Content Script
console.log('YT Decks content script loaded')

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'toggle-overlay') {
    console.log('Toggle overlay command received')
    // TODO: Implement overlay toggle
  }
})

export {}
