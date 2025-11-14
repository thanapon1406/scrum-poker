'use client'

import { Participant } from '@/types'
import clsx from 'clsx'

interface ParticipantListProps {
  participants: Participant[]
  votedParticipantIds: Set<string>
  currentUserId?: string
}

export default function ParticipantList({
  participants,
  votedParticipantIds,
  currentUserId,
}: ParticipantListProps) {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        Participants ({participants.length})
      </h2>
      <div className="space-y-2">
        {participants.map((participant) => {
          const hasVoted = votedParticipantIds.has(participant.id)
          const isCurrentUser = participant.id === currentUserId

          return (
            <div
              key={participant.id}
              className={clsx(
                'flex items-center justify-between p-3 rounded-lg transition-colors',
                isCurrentUser
                  ? 'bg-primary-50 border border-primary-200'
                  : 'bg-slate-50'
              )}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white',
                    hasVoted ? 'bg-green-500' : 'bg-slate-400'
                  )}
                >
                  {participant.display_name.charAt(0).toUpperCase()}
                </div>

                {/* Name */}
                <div>
                  <p className="font-medium text-slate-900">
                    {participant.display_name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-primary-600 font-normal">
                        (You)
                      </span>
                    )}
                  </p>
                  {participant.is_host && (
                    <p className="text-xs text-slate-500">👑 Host</p>
                  )}
                </div>
              </div>

              {/* Vote Status */}
              <div>
                {hasVoted ? (
                  <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Voted
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">
                    Waiting...
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
