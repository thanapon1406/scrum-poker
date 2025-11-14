'use client'

import { VoteValue, VOTE_VALUES } from '@/types'
import { getVoteCardColor } from '@/lib/utils'
import clsx from 'clsx'

interface VotingCardProps {
  value: VoteValue
  isSelected: boolean
  isDisabled: boolean
  onClick: () => void
}

export default function VotingCard({
  value,
  isSelected,
  isDisabled,
  onClick,
}: VotingCardProps) {
  const colorClass = getVoteCardColor(value)

  // Map vote values to estimate time
  const getEstimateTime = (val: string) => {
    const timeMap: Record<string, string> = {
      '0': '0h',
      '1/2': '0.5h',
      '1': '1h',
      '2': '2h',
      '3.5': '3.5h',
      '5': '5h',
      '7': '7h',
      '10.5': '10.5h',
      '14': '14h',
      '21': '21h',
      '40': '40h',
      '?': '?',
      '☕': '☕',
    }
    return timeMap[val] || val
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={clsx(
        'relative w-full aspect-[2/3] rounded-xl font-bold text-2xl transition-all duration-200',
        'hover:scale-105 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        'flex flex-col items-center justify-center gap-1',
        'bg-white text-slate-700 border-2 shadow-sm',
        isSelected
          ? 'border-primary-500 border-4 shadow-lg scale-105'
          : 'border-slate-300 hover:border-primary-400'
      )}
    >
      <span className="text-3xl">{value}</span>
      {value !== '?' && value !== '☕' && (
        <span className="text-xs font-normal text-slate-500">
          {getEstimateTime(value)}
        </span>
      )}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  )
}
