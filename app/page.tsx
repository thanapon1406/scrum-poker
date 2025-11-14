'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateInviteCode } from '@/lib/utils'

export default function HomePage() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleCreateRoom = async () => {
    setIsCreating(true)
    setError('')

    try {
      const inviteCode = generateInviteCode()

      const { data, error } = await supabase
        .from('rooms')
        .insert({
          invite_code: inviteCode,
        })
        .select()
        .single()

      if (error) throw error

      // Redirect to the new room
      router.push(`/room/${inviteCode}`)
    } catch (err: any) {
      console.error('Error creating room:', err)
      setError('Failed to create room. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) {
      setError('Please enter an invite code')
      return
    }
    router.push(`/room/${joinCode.trim()}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-slate-900 mb-3">
            Planning Poker
          </h1>
          <p className="text-slate-600 text-lg">
            Fast, simple, and free estimation for your team
          </p>
        </div>

        {/* Main Card */}
        <div className="card space-y-6">
          {/* Create Room */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-3">
              Start a New Session
            </h2>
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="btn-primary w-full text-lg py-3"
            >
              {isCreating ? 'Creating...' : '🎲 Create Room'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">or</span>
            </div>
          </div>

          {/* Join Room */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-3">
              Join Existing Session
            </h2>
            <form onSubmit={handleJoinRoom} className="space-y-3">
              <input
                type="text"
                placeholder="Enter invite code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="input text-center text-lg tracking-wider"
                maxLength={12}
              />
              <button type="submit" className="btn-secondary w-full text-lg py-3">
                🚪 Join Room
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>No sign-up required • Works on any device</p>
        </div>
      </div>
    </div>
  )
}
