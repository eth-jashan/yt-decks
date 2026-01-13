import React from 'react'
import { useUIStore } from '../../stores'

export function OverlayContent() {
  const activeView = useUIStore((state) => state.activeView)

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white/80 capitalize">
            {activeView} View
          </h2>
          <p className="mt-2 text-gray-500">
            Content coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}
