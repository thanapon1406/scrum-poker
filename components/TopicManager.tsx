'use client'

import { useEffect, useState } from 'react'
import { createTopic, deleteTopic } from '@/services/topics.service'
import { Topic } from '@/types'
import { formatDuration } from '@/lib/utils'

interface TopicManagerProps {
  roomId: string
  topics: Topic[]
  activeTopic: Topic | null
  isHost: boolean
  onTopicCreated: () => void
  onTopicSelected: (topicId: string) => void
}

export default function TopicManager({
  roomId,
  topics,
  activeTopic,
  isHost,
  onTopicCreated,
  onTopicSelected,
}: TopicManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [newTopicDescription, setNewTopicDescription] = useState('')
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState('60')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!activeTopic?.timer_enabled || !activeTopic?.discussion_started_at || activeTopic.is_revealed) {
      return
    }

    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [activeTopic?.timer_enabled, activeTopic?.discussion_started_at, activeTopic?.is_revealed, activeTopic?.id])

  const getRemainingSeconds = (topic: Topic) => {
    if (!topic.timer_enabled || topic.timer_seconds === null || !topic.discussion_started_at) {
      return null
    }

    const elapsedSeconds = Math.max(
      0,
      Math.round((now - new Date(topic.discussion_started_at).getTime()) / 1000),
    )

    return Math.max(0, topic.timer_seconds - elapsedSeconds)
  }

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTopicTitle.trim()) return

    const parsedTimerSeconds = timerEnabled ? Number.parseInt(timerSeconds, 10) : null

    if (timerEnabled && (!parsedTimerSeconds || parsedTimerSeconds <= 0)) {
      alert('Please enter a timer value in seconds greater than 0.')
      return
    }

    setIsCreating(true)
    try {
      const { error } = await createTopic({
        room_id: roomId,
        title: newTopicTitle.trim(),
        description: newTopicDescription.trim() || null,
        is_active: false,
        timer_enabled: timerEnabled,
        timer_seconds: parsedTimerSeconds,
      })

      if (error) throw error

      setNewTopicTitle('')
      setNewTopicDescription('')
      setTimerEnabled(false)
      setTimerSeconds('60')
      onTopicCreated()
    } catch (error) {
      console.error('Error creating topic:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteTopic = async (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent selecting the topic when clicking delete
    
    if (!isHost) return
    
    if (!confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await deleteTopic(topicId)

      if (error) throw error

      onTopicCreated() // Reload topics
    } catch (error) {
      console.error('Error deleting topic:', error)
      alert('Failed to delete topic. Please try again.')
    }
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        Topics / Stories
      </h2>

      {/* Create New Topic (Host Only) */}
      {isHost && (
        <form onSubmit={handleCreateTopic} className="mb-6 space-y-3">
          <input
            type="text"
            placeholder="Story title (e.g., 'User Login')"
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            className="input"
            maxLength={200}
          />
          <textarea
            placeholder="Description (optional)"
            value={newTopicDescription}
            onChange={(e) => setNewTopicDescription(e.target.value)}
            className="input resize-none"
            rows={2}
            maxLength={500}
          />
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              Enable countdown timer
            </label>
            {timerEnabled && (
              <div className="space-y-1">
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Countdown seconds
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(e.target.value)}
                  placeholder="60"
                  className="input"
                />
                <p className="text-xs text-slate-500">
                  Enter seconds only. For example, 60 means 60 seconds.
                </p>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isCreating || !newTopicTitle.trim()}
            className="btn-primary w-full"
          >
            {isCreating ? 'Creating...' : '➕ Add Topic'}
          </button>
        </form>
      )}

      {/* Topics List */}
      <div className="space-y-2">
        {topics.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            {isHost
              ? 'Create your first topic to start voting'
              : 'Waiting for host to add topics...'}
          </p>
        ) : (
          topics.map((topic) => (
            <div
              key={topic.id}
              className={`p-3 rounded-lg border transition-colors ${
                topic.id === activeTopic?.id
                  ? topic.is_overtime && !topic.is_revealed
                    ? 'bg-red-50 border-red-300'
                    : 'bg-primary-50 border-primary-300'
                  : topic.is_revealed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div 
                className="flex items-start justify-between gap-2 cursor-pointer"
                onClick={() => isHost && onTopicSelected(topic.id)}
              >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 mb-1 break-words">
                    {topic.title}
                  </h3>
                  {topic.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 break-words">
                      {topic.description}
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex flex-col items-end gap-1">
                    {topic.is_revealed && topic.average_score !== null && (
                      <span className="text-lg font-bold text-primary-600">
                        {topic.average_score}
                      </span>
                    )}
                    {topic.id === activeTopic?.id && (
                      <span
                        className={`text-xs text-white px-2 py-0.5 rounded flex items-center gap-1 ${
                          topic.is_overtime && !topic.is_revealed ? 'bg-red-500' : 'bg-primary-500'
                        }`}
                      >
                        {topic.is_overtime && !topic.is_revealed ? 'Overtime' : 'Active'}
                        {topic.timer_enabled && topic.discussion_started_at && !topic.is_revealed && topic.timer_seconds !== null && (() => {
                          const remainingSeconds = getRemainingSeconds(topic)

                          return remainingSeconds !== null ? (
                            <span className="opacity-90">
                              · {formatDuration(remainingSeconds)}
                            </span>
                          ) : null
                        })()}
                        {topic.timer_enabled && topic.discussion_duration_seconds !== null && topic.is_revealed && (
                          <span className="opacity-90">
                            · {formatDuration(topic.discussion_duration_seconds)}
                          </span>
                        )}
                      </span>
                    )}
                    {topic.is_revealed && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                        ✓ Done
                      </span>
                    )}
                  </div>
                  {/* Delete button (Host only) */}
                  {isHost && (
                    <button
                      onClick={(e) => handleDeleteTopic(topic.id, e)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Delete topic"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
