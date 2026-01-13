import React from 'react'
import { useUIStore } from '../../stores'
import { GridView } from '../GridView'

export function OverlayContent() {
  const activeView = useUIStore((state) => state.activeView)

  const renderContent = () => {
    switch (activeView) {
      case 'pads':
        return <GridView />
      case 'mixer':
        return <PlaceholderView title="Mixer" />
      case 'settings':
        return <PlaceholderView title="Settings" />
      case 'browser':
        return <PlaceholderView title="Browser" />
      default:
        return <PlaceholderView title={activeView} />
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      {renderContent()}
    </div>
  )
}

function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white/80 capitalize">
          {title} View
        </h2>
        <p className="mt-2 text-gray-500">
          Content coming soon...
        </p>
      </div>
    </div>
  )
}
