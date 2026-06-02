'use client'

import { useState, useEffect } from 'react'
import { getRevealedTopicsWithVotes } from '@/services/topics.service'
import { Topic } from '@/types'
import { formatAverageResult } from '@/lib/utils'

interface SessionSummaryProps {
  roomId: string
  isOpen: boolean
  onClose: () => void
}

interface TopicWithVotes extends Topic {
  votes: {
    participant: {
      display_name: string
    }
    vote_value: string
  }[]
}

export default function SessionSummary({
  roomId,
  isOpen,
  onClose,
}: SessionSummaryProps) {
  const [topics, setTopics] = useState<TopicWithVotes[]>([])
  const [loading, setLoading] = useState(true)

  const loadSummary = async () => {
    setLoading(true)
    try {
      // Load all revealed topics with their votes
      const { data: topicsData, error } = await getRevealedTopicsWithVotes(roomId)

      if (error) throw error

      setTopics((topicsData as any) || [])
    } catch (error) {
      console.error('Error loading summary:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && roomId) {
      loadSummary()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, roomId])

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const content = generatePrintHTML()
    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.focus()
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const generatePrintHTML = () => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Session Summary</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            padding: 20px;
            color: #1e293b;
          }
          h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #cbd5e1;
          }
          .topic {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .topic-header {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #0f172a;
          }
          .topic-description {
            background: #fef3c7;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 10px;
            font-size: 14px;
            color: #92400e;
          }
          .result {
            font-size: 16px;
            font-weight: 600;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .votes {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 8px;
            margin-top: 10px;
          }
          .vote-item {
            padding: 8px 12px;
            background: #f1f5f9;
            border-radius: 6px;
            font-size: 14px;
          }
          .vote-name {
            font-weight: 500;
            color: #475569;
          }
          .vote-value {
            color: #0f172a;
            font-weight: 600;
          }
          @page {
            margin: 1.5cm;
            size: A4;
          }
        </style>
      </head>
      <body>
        <h1>📊 Session Summary</h1>
    `

    topics.forEach((topic, index) => {
      html += `<div class="topic">`
      html += `<div class="topic-header">${index + 1}. ${topic.title}</div>`
      
      if (topic.description) {
        html += `<div class="topic-description">${topic.description}</div>`
      }

      const voteValues = topic.votes.map(v => v.vote_value)
      const result = formatAverageResult(voteValues)
      html += `<div class="result">Final Result: ${result}</div>`

      html += `<div class="votes">`
      topic.votes.forEach(vote => {
        html += `<div class="vote-item">
          <span class="vote-name">${vote.participant.display_name}:</span> 
          <span class="vote-value">${vote.vote_value}</span>
        </div>`
      })
      html += `</div></div>`
    })

    html += `</body></html>`
    return html
  }

  const handleCopyToClipboard = () => {
    const summary = generateTextSummary()
    navigator.clipboard.writeText(summary)
    alert('Summary copied to clipboard!')
  }

  const generateTextSummary = () => {
    let text = '📊 Planning Poker Session Summary\n'
    text += '='.repeat(50) + '\n\n'

    topics.forEach((topic, index) => {
      text += `${index + 1}. ${topic.title}\n`
      text += '-'.repeat(50) + '\n'
      
      if (topic.description) {
        text += `Description: ${topic.description}\n\n`
      }

      const voteValues = topic.votes.map(v => v.vote_value)
      const result = formatAverageResult(voteValues)
      text += `Final Result: ${result}\n\n`

      text += 'Individual Votes:\n'
      topic.votes.forEach(vote => {
        text += `  • ${vote.participant.display_name}: ${vote.vote_value}\n`
      })
      text += '\n'
    })

    return text
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            📊 Session Summary
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading summary...</p>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No completed topics yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {topics.map((topic, index) => {
                const voteValues = topic.votes.map(v => v.vote_value)
                const result = formatAverageResult(voteValues)

                return (
                  <div
                    key={topic.id}
                    className="bg-slate-50 rounded-lg p-5 border border-slate-200 print:border print:border-slate-300 print:mb-4"
                  >
                    {/* Topic Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {index + 1}. {topic.title}
                        </h3>
                        {topic.description && (
                          <p className="text-sm text-slate-600 mb-2 whitespace-pre-wrap">
                            {topic.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg px-4 py-2 text-center">
                          <p className="text-xs opacity-90">Result</p>
                          <p className="text-2xl font-bold">{result}</p>
                        </div>
                      </div>
                    </div>

                    {/* Individual Votes */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        Individual Votes:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {topic.votes.map((vote, voteIndex) => (
                          <div
                            key={voteIndex}
                            className="bg-white rounded px-3 py-2 flex items-center justify-between border border-slate-200"
                          >
                            <span className="text-sm text-slate-700">
                              {vote.participant.display_name}
                            </span>
                            <span className="font-semibold text-primary-600">
                              {vote.vote_value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Completed Time */}
                    {topic.completed_at && (
                      <p className="text-xs text-slate-500 mt-3">
                        Completed: {new Date(topic.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && topics.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
            <button
              onClick={handleCopyToClipboard}
              className="btn-secondary flex-1"
            >
              📋 Copy to Clipboard
            </button>
            <button
              onClick={handlePrint}
              className="btn-secondary flex-1"
            >
              🖨️ Print
            </button>
            <button
              onClick={onClose}
              className="btn-primary flex-1"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
