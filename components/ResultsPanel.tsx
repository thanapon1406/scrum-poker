'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { VoteWithParticipant, Topic } from '@/types'
import { getVoteCardColor, formatAverageResult } from '@/lib/utils'
import clsx from 'clsx'

interface ResultsPanelProps {
  votes: VoteWithParticipant[]
  averageScore: number | null
  isRevealed: boolean
  topic: Topic
  isHost: boolean
  onTopicUpdated?: () => void
}

export default function ResultsPanel({
  votes,
  averageScore,
  isRevealed,
  topic,
  isHost,
  onTopicUpdated,
}: ResultsPanelProps) {
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [description, setDescription] = useState(topic.description || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveDescription = async () => {
    if (!isHost) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('topics')
        .update({ description: description.trim() || null })
        .eq('id', topic.id)

      if (error) throw error

      setIsEditingDescription(false)
      onTopicUpdated?.()
    } catch (error) {
      console.error('Error updating description:', error)
      alert('Failed to update description. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setDescription(topic.description || '')
    setIsEditingDescription(false)
  }
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

  // Get formatted result (handles ties)
  const resultText = formatAverageResult(votes.map(v => v.vote_value))

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

      {/* Final Result (Mode) */}
      {resultText && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl p-6 mb-6 text-center">
          <p className="text-sm font-medium opacity-90 mb-1">Final Result</p>
          <p className="text-5xl font-bold">{resultText}</p>
        </div>
      )}

      {/* Host Description Section */}
      {isHost && (
        <div className="mb-6">
          {isEditingDescription ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Add Notes/Explanation (optional)
                <span className="text-xs text-slate-500 ml-2">
                  e.g., why there was a conflict, what was decided
                </span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this estimation..."
                className="input resize-none"
                rows={3}
                maxLength={500}
                disabled={isSaving}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDescription}
                  disabled={isSaving}
                  className="btn-primary flex-1"
                >
                  {isSaving ? 'Saving...' : '💾 Save Notes'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {topic.description ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900 mb-1">
                        📝 Host Notes
                      </p>
                      <p className="text-sm text-amber-800 whitespace-pre-wrap">
                        {topic.description}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditingDescription(true)}
                      className="text-amber-600 hover:text-amber-700 p-1"
                      title="Edit notes"
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
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="w-full text-left border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-primary-400 hover:bg-primary-50 transition-colors"
                >
                  <p className="text-sm text-slate-600">
                    ✏️ Add notes or explanation for this estimation
                    <span className="block text-xs text-slate-500 mt-1">
                      Helpful for conflicts or important decisions
                    </span>
                  </p>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Non-host view of description */}
      {!isHost && topic.description && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-amber-900 mb-1">
            📝 Host Notes
          </p>
          <p className="text-sm text-amber-800 whitespace-pre-wrap">
            {topic.description}
          </p>
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
                'text-slate-700 text-sm font-bold px-3 py-1 rounded',
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
