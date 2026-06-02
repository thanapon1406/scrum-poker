'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getRoomByInviteCode, subscribeToRoomEvents, unsubscribeFromRoomEvents } from '@/services/rooms.service'
import { getParticipantsByRoomId, getParticipantById, getParticipantByRoomAndName, countParticipantsByRoomId, createParticipant } from '@/services/participants.service'
import { getTopicsByRoomId, updateTopic, deactivateAllTopics } from '@/services/topics.service'
import { getVotesByTopicId, createVote, updateVote, deleteVotesByTopicId } from '@/services/votes.service'
import { calculateAverage } from '@/lib/utils'
import {
  Room,
  Participant,
  Topic,
  Vote,
  VoteValue,
  VOTE_VALUES,
  VoteWithParticipant,
} from '@/types'
import RoomHeader from '@/components/RoomHeader'
import ParticipantList from '@/components/ParticipantList'
import TopicManager from '@/components/TopicManager'
import VotingCard from '@/components/VotingCard'
import ResultsPanel from '@/components/ResultsPanel'
import HostControls from '@/components/HostControls'
import SessionSummary from '@/components/SessionSummary'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const inviteCode = params.inviteCode as string

  // State
  const [room, setRoom] = useState<Room | null>(null)
  const [currentUser, setCurrentUser] = useState<Participant | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const [selectedVote, setSelectedVote] = useState<VoteValue | null>(null)
  
  const [displayName, setDisplayName] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [isObserver, setIsObserver] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSummary, setShowSummary] = useState(false)

  // Load room data
  const loadRoom = async () => {
    try {
      const { data, error } = await getRoomByInviteCode(inviteCode)

      if (error || !data) {
        setError('Room not found')
        return
      }

      setRoom(data)
      
      // Load participants immediately after room is loaded
      const { data: participantsData } = await getParticipantsByRoomId(data.id)

      if (participantsData) setParticipants(participantsData)
    } catch (err) {
      console.error('Error loading room:', err)
      setError('Failed to load room')
    } finally {
      setLoading(false)
    }
  }

  const loadParticipants = async () => {
    if (!room) return

    const { data } = await getParticipantsByRoomId(room.id)

    if (data) setParticipants(data)
  }

  const loadTopics = async () => {
    if (!room) return

    const { data } = await getTopicsByRoomId(room.id)

    if (data) {
      console.log('Loaded topics:', data)
      setTopics(data)
      const active = data.find((t: any) => t.is_active)
      console.log('Active topic:', active)
      setActiveTopic(active || null)
      if (active) loadVotes(active.id)
    }
  }

  const loadVotes = async (topicId: string) => {
    const { data } = await getVotesByTopicId(topicId)

    if (data) setVotes(data as any)
  }

  // Restore participant from localStorage
  const restoreParticipant = async (participantId: string) => {
    try {
      const { data, error } = await getParticipantById(participantId)

      if (data && !error) {
        setCurrentUser(data)
        setHasJoined(true)
        // Load topics after participant is restored
        if (room) {
          loadTopics()
        }
      } else {
        // Participant not found, clear localStorage
        localStorage.removeItem(`participant_${inviteCode}`)
      }
    } catch (err) {
      console.error('Error restoring participant:', err)
      localStorage.removeItem(`participant_${inviteCode}`)
    }
  }

  // Initialize room and restore participant from localStorage
  useEffect(() => {
    const initializeRoom = async () => {
      await loadRoom()
      
      // Try to restore participant from localStorage after room loads
      const savedParticipantId = localStorage.getItem(`participant_${inviteCode}`)
      if (savedParticipantId) {
        await restoreParticipant(savedParticipantId)
      }
    }
    
    initializeRoom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteCode])

  // Load topics when room changes
  useEffect(() => {
    if (room && hasJoined) {
      loadTopics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, hasJoined])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!room || !hasJoined) return

    console.log('Setting up real-time subscriptions for room:', room.id)
    
    // Load initial data for observers too
    if (isObserver) {
      loadParticipants()
      loadTopics()
    }

    const channel = subscribeToRoomEvents(
      room.id,
      (payload) => {
        console.log('Participants changed:', payload)
        loadParticipants()
      },
      (payload) => {
        console.log('Topics changed:', payload)
        loadTopics()
        // Clear selected vote when topic changes
        if (payload.eventType === 'UPDATE') {
          setSelectedVote(null)
        }
      },
      (payload) => {
        console.log('Votes changed:', payload)
        if (activeTopic) loadVotes(activeTopic.id)
      }
    )

    return () => {
      console.log('Removing real-time subscriptions')
      unsubscribeFromRoomEvents(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, hasJoined, activeTopic])

  // Join room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim() || !room) return

    setIsJoining(true)
    setError('')

    try {
      // Check if name is already taken
      const { data: existing } = await getParticipantByRoomAndName(room.id, displayName.trim())

      if (existing) {
        setError('This name is already taken. Please choose another.')
        setIsJoining(false)
        return
      }

      // Check if this is the first participant (will be host)
      // Query database directly to ensure accurate count
      const { data: existingParticipants, error: countError } = await countParticipantsByRoomId(room.id)

      if (countError) throw countError

      const isHost = !existingParticipants || existingParticipants.length === 0

      const { data: newParticipant, error } = await createParticipant({
        room_id: room.id,
        display_name: displayName.trim(),
        is_host: isHost,
      })

      if (error) throw error

      // Save participant ID to localStorage
      localStorage.setItem(`participant_${inviteCode}`, newParticipant.id)

      setCurrentUser(newParticipant)
      setHasJoined(true)
      loadParticipants()
      loadTopics()
    } catch (err: any) {
      console.error('Error joining room:', err)
      setError('Failed to join room. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  // Join as Observer (no database save)
  const handleJoinAsObserver = async () => {
    if (!displayName.trim() || !room) return

    setIsJoining(true)
    setError('')

    try {
      // Create a fake participant object for observer (not saved to DB)
      const observerParticipant = {
        id: 'observer-' + Date.now(),
        room_id: room.id,
        display_name: displayName.trim() + ' (Observer)',
        is_host: false,
        joined_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString()
      }

      setCurrentUser(observerParticipant as Participant)
      setHasJoined(true)
      setIsObserver(true)
      loadParticipants()
      loadTopics()
    } catch (err: any) {
      console.error('Error joining as observer:', err)
      setError('Failed to join as observer. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  // Vote
  const handleVote = async (value: VoteValue) => {
    if (!currentUser || !activeTopic || activeTopic.is_revealed || isObserver) return

    try {
      // Check if user already voted
      const existingVote = votes.find((v) => v.participant_id === currentUser.id)

      if (existingVote) {
        // Update vote
        await updateVote(existingVote.id, value)
      } else {
        // Insert new vote
        await createVote({
          topic_id: activeTopic.id,
          participant_id: currentUser.id,
          vote_value: value,
        })
      }

      setSelectedVote(value)
      loadVotes(activeTopic.id)
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  // Host actions
  const handleRevealVotes = async () => {
    if (!activeTopic || !currentUser?.is_host) return

    try {
      const average = calculateAverage(votes.map((v) => v.vote_value))

      await updateTopic(activeTopic.id, {
        is_revealed: true,
        average_score: average,
        completed_at: new Date().toISOString(),
      })

      loadTopics()
    } catch (error) {
      console.error('Error revealing votes:', error)
    }
  }

  const handleResetVotes = async () => {
    if (!activeTopic || !currentUser?.is_host) return

    try {
      await deleteVotesByTopicId(activeTopic.id)

      await updateTopic(activeTopic.id, {
        is_revealed: false,
        average_score: null,
      })

      setSelectedVote(null)
      loadVotes(activeTopic.id)
      loadTopics()
    } catch (error) {
      console.error('Error resetting votes:', error)
    }
  }

  const handleTopicSelected = async (topicId: string) => {
    if (!currentUser?.is_host || !room) return

    console.log('Host selecting topic:', topicId)

    try {
      // Deactivate all topics
      const { error: deactivateError } = await deactivateAllTopics(room.id)

      if (deactivateError) {
        console.error('Error deactivating topics:', deactivateError)
        throw deactivateError
      }

      // Activate selected topic
      const { error: activateError } = await updateTopic(topicId, { is_active: true })

      if (activateError) {
        console.error('Error activating topic:', activateError)
        throw activateError
      }

      console.log('Topic selection completed successfully')
      setSelectedVote(null)
      loadTopics()
    } catch (error) {
      console.error('Error selecting topic:', error)
    }
  }

  const handleLeaveRoom = () => {
    // Clear participant from localStorage
    localStorage.removeItem(`participant_${inviteCode}`)
    router.push('/')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading room...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Room Not Found
          </h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  // Join screen
  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
            Join Planning Poker
          </h1>
          <p className="text-slate-600 mb-6 text-center">
            Room Code: <code className="font-mono font-bold text-primary-600">{inviteCode}</code>
          </p>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., John Doe"
                className="input"
                maxLength={50}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isJoining || !displayName.trim()}
                className="btn-primary w-full py-3"
              >
                {isJoining ? 'Joining...' : '👤 Join as Participant'}
              </button>
              
              <button
                type="button"
                onClick={handleJoinAsObserver}
                disabled={isJoining || !displayName.trim()}
                className="w-full py-3 px-4 border-2 border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Joining...' : '👁️ Join as Observer (View Only)'}
              </button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Observer mode:</strong> You can see everything but cannot vote or take actions. Perfect for stakeholders or managers who want to watch the session.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500 mb-3">
              {participants.length === 0
                ? 'Be the first to join!'
                : `${participants.length} ${
                    participants.length === 1 ? 'person' : 'people'
                  } already in room`}
            </p>
            <button onClick={() => router.push('/')} className="text-sm text-primary-600 hover:text-primary-700">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main room interface
  const votedParticipantIds = new Set(votes.map((v) => v.participant_id))
  const votesWithParticipants: VoteWithParticipant[] = votes.map((vote: any) => ({
    ...vote,
    participant: vote.participant || participants.find((p) => p.id === vote.participant_id)!,
  }))

  const myVote = votes.find((v) => v.participant_id === currentUser?.id)
  const currentVoteValue = myVote?.vote_value as VoteValue | undefined

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <RoomHeader
          inviteCode={inviteCode}
          roomId={room!.id}
          isHost={currentUser?.is_host || false}
          isObserver={isObserver}
          displayName={currentUser?.display_name || ''}
          onLeave={() => router.push('/')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Participants & Topics */}
          <div className="space-y-6">
            <ParticipantList
              participants={participants}
              votedParticipantIds={votedParticipantIds}
              currentUserId={currentUser?.id}
              onParticipantUpdated={loadParticipants}
            />

            <TopicManager
              roomId={room!.id}
              topics={topics}
              activeTopic={activeTopic}
              isHost={currentUser?.is_host || false}
              onTopicCreated={loadTopics}
              onTopicSelected={handleTopicSelected}
            />
          </div>

          {/* Middle Column - Voting */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Topic */}
            {activeTopic ? (
              <div className="card">

                {/* Voting Cards */}
                {!activeTopic.is_revealed && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">
                      {isObserver ? 'Waiting for Votes (Observer Mode)' : 'Cast Your Vote'}
                    </h3>
                    {isObserver ? (
                      <div className="text-center py-8 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-4xl mb-3">👁️</div>
                        <p className="text-blue-800 font-medium">Observer Mode</p>
                        <p className="text-sm text-blue-600 mt-1">
                          You can watch the voting but cannot participate
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                        {VOTE_VALUES.map((value) => (
                          <VotingCard
                            key={value}
                            value={value}
                            isSelected={currentVoteValue === value}
                            isDisabled={activeTopic.is_revealed}
                            onClick={() => handleVote(value)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Results */}
                {activeTopic.is_revealed && (
                  <ResultsPanel
                    votes={votesWithParticipants}
                    averageScore={activeTopic.average_score}
                    isRevealed={activeTopic.is_revealed}
                    topic={activeTopic}
                    isHost={currentUser?.is_host || false}
                    onTopicUpdated={loadTopics}
                  />
                )}

                {/* Waiting state */}
                {!activeTopic.is_revealed && votes.length === 0 && (
                  <div className="text-center py-12 mt-6 bg-slate-50 rounded-lg">
                    <p className="text-slate-500">
                      Waiting for participants to vote...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">🃏</div>
                <p className="text-xl text-slate-600">
                  {currentUser?.is_host
                    ? 'Create a topic to start estimating'
                    : 'Waiting for host to select a topic...'}
                </p>
              </div>
            )}

            {/* Host Controls */}
            {currentUser?.is_host && (
              <HostControls
                hasActiveTopic={!!activeTopic}
                isRevealed={activeTopic?.is_revealed || false}
                hasVotes={votes.length > 0}
                onReveal={handleRevealVotes}
                onReset={handleResetVotes}
              />
            )}

            {/* Session Summary Button */}
            {currentUser?.is_host && topics.some(t => t.is_revealed) && (
              <div className="mt-4">
                <button
                  onClick={() => setShowSummary(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  📊 View Session Summary
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Summary Modal */}
      <SessionSummary
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        roomId={room!.id}
      />
    </div>
  )
}
