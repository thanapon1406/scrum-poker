import { supabase } from '@/lib/supabase'

export const getVotesByTopicId = async (topicId: string) => {
  return supabase
    .from('votes')
    .select(`
      *,
      participant:participants(*)
    `)
    .eq('topic_id', topicId)
}

export const createVote = async (data: { topic_id: string; participant_id: string; vote_value: string }) => {
  return supabase
    .from('votes')
    .insert(data)
}

export const updateVote = async (voteId: string, value: string) => {
  return supabase
    .from('votes')
    .update({ vote_value: value })
    .eq('id', voteId)
}

export const deleteVotesByTopicId = async (topicId: string) => {
  return supabase
    .from('votes')
    .delete()
    .eq('topic_id', topicId)
}
