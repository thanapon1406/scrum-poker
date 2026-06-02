import { supabase } from '@/lib/supabase'

export const createRoom = async (inviteCode: string) => {
  return supabase
    .from('rooms')
    .insert({ invite_code: inviteCode })
    .select()
    .single()
}

export const getRoomByInviteCode = async (inviteCode: string) => {
  return supabase
    .from('rooms')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single()
}

export const subscribeToRoomEvents = (
  roomId: string,
  onParticipantChange: (payload: any) => void,
  onTopicChange: (payload: any) => void,
  onVoteChange: (payload: any) => void
) => {
  return supabase.channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `room_id=eq.${roomId}`,
      },
      onParticipantChange
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'topics',
        filter: `room_id=eq.${roomId}`,
      },
      onTopicChange
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'votes',
      },
      onVoteChange
    )
    .subscribe((status) => {
      console.log('Subscription status:', status)
    })
}

export const unsubscribeFromRoomEvents = (channel: any) => {
  supabase.removeChannel(channel)
}
