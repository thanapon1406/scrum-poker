import { supabase } from '@/lib/supabase'

export const getTopicsByRoomId = async (roomId: string) => {
  return supabase
    .from('topics')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
}

export const getRevealedTopicsWithVotes = async (roomId: string) => {
  return supabase
    .from('topics')
    .select(`
      *,
      votes (
        vote_value,
        participant:participants (
          display_name
        )
      )
    `)
    .eq('room_id', roomId)
    .eq('is_revealed', true)
    .order('completed_at', { ascending: true })
}

export const createTopic = async (data: {
  room_id: string
  title: string
  description: string | null
  is_active: boolean
  timer_enabled: boolean
  timer_seconds: number | null
}) => {
  return supabase
    .from('topics')
    .insert(data)
}

export const updateTopic = async (topicId: string, data: any) => {
  return supabase
    .from('topics')
    .update(data)
    .eq('id', topicId)
}

export const deactivateAllTopics = async (roomId: string) => {
  return supabase
    .from('topics')
    .update({ is_active: false })
    .eq('room_id', roomId)
}

export const deleteTopic = async (topicId: string) => {
  return supabase
    .from('topics')
    .delete()
    .eq('id', topicId)
}
