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
          completed_at: string | null
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
          completed_at?: string | null
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
          completed_at?: string | null
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
