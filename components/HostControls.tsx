'use client'

interface HostControlsProps {
  hasActiveTopic: boolean
  isRevealed: boolean
  hasVotes: boolean
  onReveal: () => void
  onReset: () => void
}

export default function HostControls({
  hasActiveTopic,
  isRevealed,
  hasVotes,
  onReveal,
  onReset,
}: HostControlsProps) {
  if (!hasActiveTopic) {
    return (
      <div className="card text-center py-8">
        <p className="text-slate-500">
          Select or create a topic to start voting
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        Host Controls
      </h2>
      <div className="flex gap-3">
        <button
          onClick={onReveal}
          disabled={isRevealed || !hasVotes}
          className="btn-primary flex-1 py-3"
        >
          {isRevealed ? '✓ Votes Revealed' : '👁️ Reveal Votes'}
        </button>
        <button
          onClick={onReset}
          disabled={!hasVotes}
          className="btn-secondary flex-1 py-3"
        >
          🔄 Reset Votes
        </button>
      </div>
      {!hasVotes && !isRevealed && (
        <p className="text-xs text-slate-500 text-center mt-2">
          Waiting for participants to vote...
        </p>
      )}
    </div>
  )
}
