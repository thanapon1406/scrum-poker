'use client'

import { useState } from 'react'
import { createTopic, deleteTopic } from '@/services/topics.service'
import { Topic } from '@/types'

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

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTopicTitle.trim()) return

    setIsCreating(true)
    try {
      const { error } = await createTopic({
        room_id: roomId,
        title: newTopicTitle.trim(),
        description: newTopicDescription.trim() || null,
        is_active: false,
      })

      if (error) throw error

      setNewTopicTitle('')
      setNewTopicDescription('')
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
                  ? 'bg-primary-50 border-primary-300'
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
                      <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded">
                        Active
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
