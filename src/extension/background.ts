// YT Decks Background Service Worker
console.log('YT Decks background loaded')

// Listen for the toggle-overlay command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-overlay') {
    // Send message to content script to toggle overlay
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'toggle-overlay' })
      }
    })
  }
})

export {}
