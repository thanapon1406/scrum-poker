'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load room data
  const loadRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single()

      if (error || !data) {
        setError('Room not found')
        return
      }

      setRoom(data)
      
      // Load participants immediately after room is loaded
      const { data: participantsData } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', data.id)
        .order('joined_at', { ascending: true })

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

    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', room.id)
      .order('joined_at', { ascending: true })

    if (data) setParticipants(data)
  }

  const loadTopics = async () => {
    if (!room) return

    const { data } = await supabase
      .from('topics')
      .select('*')
      .eq('room_id', room.id)
      .order('created_at', { ascending: false })

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
    const { data } = await supabase
      .from('votes')
      .select(`
        *,
        participant:participants(*)
      `)
      .eq('topic_id', topicId)

    if (data) setVotes(data as any)
  }

  // Restore participant from localStorage
  const restoreParticipant = async (participantId: string) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .single()

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

    const channel = supabase.channel(`room:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          console.log('Participants changed:', payload)
          loadParticipants()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'topics',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          console.log('Topics changed:', payload)
          loadTopics()
          // Clear selected vote when topic changes
          if (payload.eventType === 'UPDATE') {
            setSelectedVote(null)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
        },
        (payload) => {
          console.log('Votes changed:', payload)
          if (activeTopic) loadVotes(activeTopic.id)
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      console.log('Removing real-time subscriptions')
      supabase.removeChannel(channel)
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
      const { data: existing } = await supabase
        .from('participants')
        .select('id')
        .eq('room_id', room.id)
        .eq('display_name', displayName.trim())
        .maybeSingle()

      if (existing) {
        setError('This name is already taken. Please choose another.')
        setIsJoining(false)
        return
      }

      // Check if this is the first participant (will be host)
      // Query database directly to ensure accurate count
      const { data: existingParticipants, error: countError } = await supabase
        .from('participants')
        .select('id')
        .eq('room_id', room.id)

      if (countError) throw countError

      const isHost = !existingParticipants || existingParticipants.length === 0

      const { data: newParticipant, error } = await supabase
        .from('participants')
        .insert({
          room_id: room.id,
          display_name: displayName.trim(),
          is_host: isHost,
        })
        .select()
        .single()

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

  // Vote
  const handleVote = async (value: VoteValue) => {
    if (!currentUser || !activeTopic || activeTopic.is_revealed) return

    try {
      // Check if user already voted
      const existingVote = votes.find((v) => v.participant_id === currentUser.id)

      if (existingVote) {
        // Update vote
        await supabase
          .from('votes')
          .update({ vote_value: value })
          .eq('id', existingVote.id)
      } else {
        // Insert new vote
        await supabase.from('votes').insert({
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

      await supabase
        .from('topics')
        .update({
          is_revealed: true,
          average_score: average,
          completed_at: new Date().toISOString(),
        })
        .eq('id', activeTopic.id)

      loadTopics()
    } catch (error) {
      console.error('Error revealing votes:', error)
    }
  }

  const handleResetVotes = async () => {
    if (!activeTopic || !currentUser?.is_host) return

    try {
      await supabase.from('votes').delete().eq('topic_id', activeTopic.id)

      await supabase
        .from('topics')
        .update({
          is_revealed: false,
          average_score: null,
        })
        .eq('id', activeTopic.id)

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
      const { error: deactivateError } = await supabase
        .from('topics')
        .update({ is_active: false })
        .eq('room_id', room.id)

      if (deactivateError) {
        console.error('Error deactivating topics:', deactivateError)
        throw deactivateError
      }

      // Activate selected topic
      const { error: activateError } = await supabase
        .from('topics')
        .update({ is_active: true })
        .eq('id', topicId)

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

            <button
              type="submit"
              disabled={isJoining || !displayName.trim()}
              className="btn-primary w-full py-3"
            >
              {isJoining ? 'Joining...' : 'Join Room'}
            </button>
          </form>

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
          onLeave={handleLeaveRoom}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Participants & Topics */}
          <div className="space-y-6">
            <ParticipantList
              participants={participants}
              votedParticipantIds={votedParticipantIds}
              currentUserId={currentUser?.id}
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
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {activeTopic.title}
                  </h2>
                  {activeTopic.description && (
                    <p className="text-slate-600">{activeTopic.description}</p>
                  )}
                </div>

                {/* Voting Cards */}
                {!activeTopic.is_revealed && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">
                      Cast Your Vote
                    </h3>
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
                  </div>
                )}

                {/* Results */}
                {activeTopic.is_revealed && (
                  <ResultsPanel
                    votes={votesWithParticipants}
                    averageScore={activeTopic.average_score}
                    isRevealed={activeTopic.is_revealed}
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
          </div>
        </div>
      </div>
    </div>
  )
}
