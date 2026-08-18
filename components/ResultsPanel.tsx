'use client'

import { useState, useRef } from 'react'
import * as htmlToImage from 'html-to-image'
import { updateTopic } from '@/services/topics.service'
import { VoteWithParticipant, Topic } from '@/types'
import { getVoteCardColor, getProgressBarColor, formatAverageResult, formatDuration } from '@/lib/utils'
import clsx from 'clsx'

interface ResultsPanelProps {
  votes: VoteWithParticipant[]
  averageScore: number | null
  isRevealed: boolean
  topic: Topic
  isHost: boolean
  isHideTimer?: boolean
  onTopicUpdated?: () => void
}

export default function ResultsPanel({
  votes,
  averageScore,
  isRevealed,
  topic,
  isHost,
  isHideTimer = false,
  onTopicUpdated,
}: ResultsPanelProps) {
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [description, setDescription] = useState(topic.description || '')
  const [isSaving, setIsSaving] = useState(false)
  
  const panelRef = useRef<HTMLDivElement>(null)
  const [isCopying, setIsCopying] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopyImage = async () => {
    if (!panelRef.current) return
    setIsCopying(true)
    setCopySuccess(false)
    try {
      const blob = await htmlToImage.toBlob(panelRef.current, {
        backgroundColor: '#ffffff',
        filter: (node: HTMLElement) => {
          // exclude the copy button itself
          return !node.classList?.contains('exclude-from-capture')
        }
      })
      if (!blob) throw new Error('Failed to capture image')
      
      const item = new ClipboardItem({ 'image/png': blob })
      await navigator.clipboard.write([item])
      
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Error copying image:', err)
      alert('Failed to copy image. Your browser might not support Clipboard API.')
    } finally {
      setIsCopying(false)
    }
  }

  const handleSaveDescription = async () => {
    if (!isHost) return

    setIsSaving(true)
    try {
      const { error } = await updateTopic(topic.id, { description: description.trim() || null })

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

  const discussionTimeSeconds = (() => {
    if (topic.discussion_duration_seconds !== null) {
      return topic.discussion_duration_seconds
    }

    if (!topic.discussion_started_at || !topic.completed_at) {
      return null
    }

    return Math.max(
      0,
      Math.round(
        (new Date(topic.completed_at).getTime() - new Date(topic.discussion_started_at).getTime()) / 1000,
      ),
    )
  })()

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

  // Find the highest vote count for bold styling
  const maxVoteCount = Math.max(...Object.values(voteDistribution))

  return (
    <div className="card relative" ref={panelRef}>
      <div className="flex justify-end mb-2">
        <button
          onClick={handleCopyImage}
          disabled={isCopying}
          className="exclude-from-capture text-slate-500 hover:text-primary-600 bg-white rounded-md p-1.5 border border-slate-200 text-xs flex items-center gap-1 hover:bg-slate-50 transition-colors shadow-sm"
          title="Copy as image"
        >
          {copySuccess ? (
            <>
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : isCopying ? (
            <>
              <svg className="w-4 h-4 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Copying...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Image
            </>
          )}
        </button>
      </div>

      <div className="mb-6 text-center px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 break-all">
          {topic.title}
        </h2>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
          Results
        </p>
      </div>

      {/* Final Result (Mode) */}
      {resultText && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl p-6 mb-6 text-center">
          <p className="text-sm font-medium opacity-90 mb-1">Final Result</p>
          <p className="text-5xl font-bold">{resultText}</p>
        </div>
      )}

      {!isHideTimer && (
        <div className="mb-6 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-slate-200 px-3 py-1 font-medium text-slate-700">
            Time used: {formatDuration(discussionTimeSeconds)}
          </span>
          {topic.is_overtime && (
            <span className="rounded-full bg-red-600 px-3 py-1 font-medium text-white">
              Overtime
            </span>
          )}
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-900 mb-1">
                        📝 Host Notes
                      </p>
                      <p className="text-sm text-amber-800 whitespace-pre-wrap break-words">
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
          <p className="text-sm text-amber-800 whitespace-pre-wrap break-words">
            {topic.description}
          </p>
        </div>
      )}

      {/* Vote Distribution */}
      <div className="space-y-4">
        {sortedVotes.map(([value, count]) => {
          const percentage = Math.round((count / votes.length) * 100)
          const progressBarColorClass = getProgressBarColor(value)
          const cardColorClass = getVoteCardColor(value)
          const isHighestVoted = count === maxVoteCount

          return (
            <div key={value} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={clsx(
                  'text-lg',
                  isHighestVoted 
                    ? 'font-bold text-slate-900' 
                    : 'font-semibold text-slate-700'
                )}>
                  {value}
                </span>
                <span className={clsx(
                  'text-sm',
                  isHighestVoted
                    ? 'font-bold text-slate-800'
                    : 'text-slate-500'
                )}>
                  {count} {count === 1 ? 'vote' : 'votes'} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden border border-slate-300">
                <div
                  className={clsx(
                    'h-full transition-all duration-700 flex items-center justify-end pr-2',
                    isHighestVoted && 'shadow-lg ring-2 ring-inset'
                  )}
                  style={{ 
                    width: `${Math.max(percentage, 8)}%`,
                    backgroundColor: '#0284c7'
                  }}
                >
                  {percentage > 15 && (
                    <span className="text-xs font-bold text-white drop-shadow">
                      {percentage}%
                    </span>
                  )}
                </div>
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
