import React from 'react'
import ReactDOM from 'react-dom/client'

function Popup() {
  return (
    <div style={{
      width: '300px',
      padding: '20px',
      backgroundColor: '#0F0F0F',
      color: '#FFFFFF',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <h1 style={{
        margin: 0,
        fontSize: '24px',
        fontWeight: 'bold',
        background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        YT Decks
      </h1>
      <p style={{
        marginTop: '12px',
        fontSize: '14px',
        color: '#888888',
      }}>
        Turn YouTube into a performance instrument
      </p>
      <p style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#666666',
      }}>
        Press <kbd style={{
          backgroundColor: '#1A1A1A',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid #333',
        }}>Alt+D</kbd> to toggle the overlay on YouTube
      </p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
)
