export default function Popup() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-4">
          YT Decks
        </h1>
        <p className="text-white/80 mb-6">
          Manage your YouTube experience with decks.
        </p>

        <div className="space-y-4">
          <button className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors glow-primary">
            Primary Button
          </button>

          <button className="w-full px-4 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors">
            Secondary Button
          </button>

          <button className="w-full px-4 py-3 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-colors glow-accent">
            Accent Button
          </button>

          <div className="p-4 bg-surface rounded-lg hover:bg-surfaceHover transition-colors">
            <h3 className="text-white font-medium mb-2">Surface Card</h3>
            <p className="text-white/60 text-sm">
              This card demonstrates the surface colors.
            </p>
          </div>

          <div className="flex gap-2">
            <span className="px-3 py-1 bg-success/20 text-success rounded-full text-sm">
              Success
            </span>
            <span className="px-3 py-1 bg-warning/20 text-warning rounded-full text-sm">
              Warning
            </span>
            <span className="px-3 py-1 bg-error/20 text-error rounded-full text-sm">
              Error
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
