import { supabase } from '@/lib/supabase'

export const getParticipantsByRoomId = async (roomId: string) => {
  return supabase
    .from('participants')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true })
}

export const getParticipantById = async (participantId: string) => {
  return supabase
    .from('participants')
    .select('*')
    .eq('id', participantId)
    .single()
}

export const getParticipantByRoomAndName = async (roomId: string, displayName: string) => {
  return supabase
    .from('participants')
    .select('id')
    .eq('room_id', roomId)
    .eq('display_name', displayName)
    .maybeSingle()
}

export const countParticipantsByRoomId = async (roomId: string) => {
  return supabase
    .from('participants')
    .select('id')
    .eq('room_id', roomId)
}

export const createParticipant = async (data: { room_id: string; display_name: string; is_host: boolean }) => {
  return supabase
    .from('participants')
    .insert(data)
    .select()
    .single()
}

export const updateParticipantName = async (participantId: string, displayName: string) => {
  return supabase
    .from('participants')
    .update({ display_name: displayName })
    .eq('id', participantId)
}
