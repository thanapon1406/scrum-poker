'use client'

import { useState } from 'react'
import { copyToClipboard } from '@/lib/utils'

interface RoomHeaderProps {
  inviteCode: string
  roomId: string
  isHost: boolean
  isObserver?: boolean
  displayName?: string
  onLeave: () => void
}

export default function RoomHeader({
  inviteCode,
  roomId,
  isHost,
  isObserver = false,
  displayName = '',
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
    <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 mb-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Side - Room Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900">
              Planning Poker
            </h1>
            {isObserver && (
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-md">
                👁️ Observer
              </span>
            )}
            {isHost && !isObserver && (
              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-md">
                👑 Host
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Room:</span>
              <code className="font-mono font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded text-sm">
                {inviteCode}
              </code>
              <button
                onClick={handleCopyInviteCode}
                className="text-slate-400 hover:text-primary-600 transition-colors ml-1"
                title="Copy invite link"
              >
                {copied ? (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            
            {displayName && (
              <div className="text-slate-600 border-l border-slate-300 pl-3">
                {displayName}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Leave Button */}
        <button 
          onClick={onLeave} 
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
        >
          Leave
        </button>
      </div>
    </div>
  )
}
