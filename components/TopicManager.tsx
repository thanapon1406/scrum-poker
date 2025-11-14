'use client'

import { useState } from 'react'
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
      const { supabase } = await import('@/lib/supabase')
      
      const { error } = await supabase.from('topics').insert({
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
              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                topic.id === activeTopic?.id
                  ? 'bg-primary-50 border-primary-300'
                  : topic.is_revealed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => isHost && onTopicSelected(topic.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 mb-1">
                    {topic.title}
                  </h3>
                  {topic.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {topic.description}
                    </p>
                  )}
                </div>
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
