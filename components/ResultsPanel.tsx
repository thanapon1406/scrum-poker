'use client'

import { VoteWithParticipant } from '@/types'
import { getVoteCardColor } from '@/lib/utils'
import clsx from 'clsx'

interface ResultsPanelProps {
  votes: VoteWithParticipant[]
  averageScore: number | null
  isRevealed: boolean
}

export default function ResultsPanel({
  votes,
  averageScore,
  isRevealed,
}: ResultsPanelProps) {
  if (!isRevealed) {
    return (
      <div className="card text-center py-12">
        <div className="animate-pulse-soft mb-4">
          <svg
            className="w-16 h-16 mx-auto text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
        <p className="text-slate-500 text-lg">
          Votes are hidden. Waiting for reveal...
        </p>
      </div>
    )
  }

  // Calculate vote distribution
  const voteDistribution = votes.reduce((acc, vote) => {
    acc[vote.vote_value] = (acc[vote.vote_value] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedVotes = Object.entries(voteDistribution).sort(
    ([a], [b]) => {
      // Sort numerically, then special cards at the end
      const aNum = parseInt(a)
      const bNum = parseInt(b)
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
      if (!isNaN(aNum)) return -1
      if (!isNaN(bNum)) return 1
      return a.localeCompare(b)
    }
  )

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
        Results
      </h2>

      {/* Average Score */}
      {averageScore !== null && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl p-6 mb-6 text-center">
          <p className="text-sm font-medium opacity-90 mb-1">Average Score</p>
          <p className="text-5xl font-bold">{averageScore}</p>
        </div>
      )}

      {/* Vote Distribution */}
      <div className="space-y-3">
        {sortedVotes.map(([value, count]) => {
          const percentage = (count / votes.length) * 100
          const colorClass = getVoteCardColor(value)

          return (
            <div key={value}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700 text-lg">
                  {value}
                </span>
                <span className="text-sm text-slate-500">
                  {count} {count === 1 ? 'vote' : 'votes'}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={clsx(colorClass, 'h-full transition-all duration-500')}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Individual Votes */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Individual Votes
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {votes.map((vote) => (
            <div
              key={vote.id}
              className="flex items-center justify-between bg-slate-50 rounded-lg p-2"
            >
              <span className="text-sm text-slate-700 truncate">
                {vote.participant.display_name}
              </span>
              <span className={clsx(
                'text-white text-sm font-bold px-3 py-1 rounded',
                getVoteCardColor(vote.vote_value)
              )}>
                {vote.vote_value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
