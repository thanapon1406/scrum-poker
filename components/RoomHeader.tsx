'use client'

import { useState } from 'react'
import { copyToClipboard } from '@/lib/utils'

interface RoomHeaderProps {
  inviteCode: string
  roomId: string
  isHost: boolean
  onLeave: () => void
}

export default function RoomHeader({
  inviteCode,
  roomId,
  isHost,
  onLeave,
}: RoomHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyInviteCode = async () => {
    const shareUrl = `${window.location.origin}/room/${inviteCode}`
    const success = await copyToClipboard(shareUrl)
    
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Room Info */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Planning Poker
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Room Code:</span>
            <code className="text-lg font-mono font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded">
              {inviteCode}
            </code>
            <button
              onClick={handleCopyInviteCode}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              title="Copy invite link"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          {isHost && (
            <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
              👑 You are the host
            </span>
          )}
        </div>

        {/* Leave Button */}
        <button onClick={onLeave} className="btn-secondary">
          🚪 Leave Room
        </button>
      </div>
    </div>
  )
}
