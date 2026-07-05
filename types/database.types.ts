export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          invite_code: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          invite_code: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          invite_code?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      participants: {
        Row: {
          id: string
          room_id: string
          display_name: string
          is_host: boolean
          joined_at: string
          last_seen_at: string
        }
        Insert: {
          id?: string
          room_id: string
          display_name: string
          is_host?: boolean
          joined_at?: string
          last_seen_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          display_name?: string
          is_host?: boolean
          joined_at?: string
          last_seen_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          room_id: string
          title: string
          description: string | null
          is_active: boolean
          is_revealed: boolean
          average_score: number | null
          created_at: string
          timer_enabled: boolean
          timer_seconds: number | null
          discussion_started_at: string | null
          completed_at: string | null
          discussion_duration_seconds: number | null
          is_overtime: boolean
        }
        Insert: {
          id?: string
          room_id: string
          title: string
          description?: string | null
          is_active?: boolean
          is_revealed?: boolean
          average_score?: number | null
          created_at?: string
          timer_enabled?: boolean
          timer_seconds?: number | null
          discussion_started_at?: string | null
          completed_at?: string | null
          discussion_duration_seconds?: number | null
          is_overtime?: boolean
        }
        Update: {
          id?: string
          room_id?: string
          title?: string
          description?: string | null
          is_active?: boolean
          is_revealed?: boolean
          average_score?: number | null
          created_at?: string
          timer_enabled?: boolean
          timer_seconds?: number | null
          discussion_started_at?: string | null
          completed_at?: string | null
          discussion_duration_seconds?: number | null
          is_overtime?: boolean
        }
      }
      votes: {
        Row: {
          id: string
          topic_id: string
          participant_id: string
          vote_value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          participant_id: string
          vote_value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          participant_id?: string
          vote_value?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_topic_average: {
        Args: { topic_uuid: string }
        Returns: number
      }
      cleanup_old_rooms: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
