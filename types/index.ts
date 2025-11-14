import { Database } from './database.types'

// Table types
export type Room = Database['public']['Tables']['rooms']['Row']
export type Participant = Database['public']['Tables']['participants']['Row']
export type Topic = Database['public']['Tables']['topics']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']

// Insert types
export type InsertRoom = Database['public']['Tables']['rooms']['Insert']
export type InsertParticipant = Database['public']['Tables']['participants']['Insert']
export type InsertTopic = Database['public']['Tables']['topics']['Insert']
export type InsertVote = Database['public']['Tables']['votes']['Insert']

// Update types
export type UpdateRoom = Database['public']['Tables']['rooms']['Update']
export type UpdateParticipant = Database['public']['Tables']['participants']['Update']
export type UpdateTopic = Database['public']['Tables']['topics']['Update']
export type UpdateVote = Database['public']['Tables']['votes']['Update']

// Vote card values - Story Points with Estimate Time
export const VOTE_VALUES = [
  '0',      // 0 hours
  '1/2',    // 0.5 hours
  '1',      // 1 hour
  '2',      // 2 hours
  '3',      // 3.5 hours
  '5',      // 5 hours
  '8',      // 7 hours
  '13',     // 14 hours (2 days)
  '20',     // 21 hours (3 days)
  '40',     // 35 hours (1 week)
  '100',    // 70 hours (2 weeks)
  '?',      // Unknown
  '☕',     // Break
] as const

export type VoteValue = (typeof VOTE_VALUES)[number]

// Helper type for votes with participant info
export type VoteWithParticipant = Vote & {
  participant: Participant
}

// Helper type for topics with votes
export type TopicWithVotes = Topic & {
  votes: VoteWithParticipant[]
}

// Realtime event types
export type RealtimeEvent =
  | 'participant_joined'
  | 'participant_left'
  | 'vote_submitted'
  | 'votes_revealed'
  | 'votes_reset'
  | 'topic_changed'
  | 'topic_created'

export interface RealtimePayload {
  event: RealtimeEvent
  timestamp: string
  data?: any
}

// Presence state for online participants
export interface PresenceState {
  participant_id: string
  display_name: string
  is_host: boolean
  online_at: string
}
