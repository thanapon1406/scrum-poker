'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Participant } from '@/types'
import clsx from 'clsx'

interface ParticipantListProps {
  participants: Participant[]
  votedParticipantIds: Set<string>
  currentUserId?: string
  onParticipantUpdated?: () => void
}

export default function ParticipantList({
  participants,
  votedParticipantIds,
  currentUserId,
  onParticipantUpdated,
}: ParticipantListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStartEdit = (participant: Participant) => {
    setEditingId(participant.id)
    setEditingName(participant.display_name)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleSaveName = async (participantId: string) => {
    if (!editingName.trim() || editingName.trim().length < 2) {
      alert('Name must be at least 2 characters long')
      return
    }

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('participants')
        .update({ display_name: editingName.trim() })
        .eq('id', participantId)

      if (error) throw error

      // Update localStorage if this is the current user
      if (participantId === currentUserId) {
        const inviteCode = window.location.pathname.split('/').pop()
        if (inviteCode) {
          localStorage.setItem(`participant_${inviteCode}`, participantId)
        }
      }

      setEditingId(null)
      setEditingName('')
      onParticipantUpdated?.()
    } catch (error) {
      console.error('Error updating name:', error)
      alert('Failed to update name. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }
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
                <div className="flex-1">
                  {editingId === participant.id ? (
                    // Edit mode
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="input text-sm py-1 px-2"
                        maxLength={50}
                        autoFocus
                        disabled={isUpdating}
                      />
                      <button
                        onClick={() => handleSaveName(participant.id)}
                        disabled={isUpdating}
                        className="text-green-600 hover:text-green-700 p-1"
                        title="Save"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="Cancel"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    // Display mode
                    <div className="flex items-center gap-2">
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
                      {isCurrentUser && (
                        <button
                          onClick={() => handleStartEdit(participant)}
                          className="text-slate-400 hover:text-primary-600 transition-colors p-1"
                          title="Edit name"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
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
