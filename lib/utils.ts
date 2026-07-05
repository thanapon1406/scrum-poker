import { nanoid } from 'nanoid'

/**
 * Generates a unique, URL-friendly invite code for a room
 * @param length - Length of the code (default: 8)
 * @returns A unique uppercase invite code (e.g., "A1B2C3D4")
 */
export function generateInviteCode(length: number = 8): string {
  // Using nanoid with custom alphabet for better readability
  // Excludes confusing characters like 0, O, I, l
  // Using uppercase only for consistency
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  return nanoid(length).split('').map(c => alphabet[Math.abs(c.charCodeAt(0)) % alphabet.length]).join('')
}

/**
 * Calculates the mode (most frequently selected card) from votes
 * If there's a tie, returns all tied values separated by " or "
 * Ignores special cards (? and ☕)
 * @param votes - Array of vote values
 * @returns Most selected numeric value(s), or null if no numeric votes
 */
export function calculateAverage(votes: string[]): number | null {
  // Filter to only numeric votes (including decimals like "1/2")
  const numericVotes = votes.filter(vote => 
    vote !== '?' && vote !== '☕'
  )
  
  if (numericVotes.length === 0) return null
  
  // Count frequency of each vote
  const frequencyMap: Record<string, number> = {}
  
  numericVotes.forEach(vote => {
    frequencyMap[vote] = (frequencyMap[vote] || 0) + 1
  })
  
  // Find the maximum frequency
  let maxFrequency = 0
  Object.values(frequencyMap).forEach(frequency => {
    if (frequency > maxFrequency) {
      maxFrequency = frequency
    }
  })
  
  // Get all votes with max frequency
  const mostFrequentVotes = Object.keys(frequencyMap).filter(
    vote => frequencyMap[vote] === maxFrequency
  )
  
  // If only one winner, return its value
  if (mostFrequentVotes.length === 1) {
    return parseVoteValue(mostFrequentVotes[0])
  }
  
  // If multiple winners (tie), return as string with " or "
  // Sort them numerically first
  const sortedVotes = mostFrequentVotes.sort((a, b) => 
    parseVoteValue(a) - parseVoteValue(b)
  )
  
  // Return as a formatted string (will be stored as string in DB)
  // The number type allows this through our type system
  return parseFloat(sortedVotes.join(' or ')) || parseVoteValue(sortedVotes[0])
}

/**
 * Formats the result to show tied values
 * @param votes - Array of vote values
 * @returns Formatted string showing result or tie
 */
export function formatAverageResult(votes: string[]): string | null {
  const numericVotes = votes.filter(vote => 
    vote !== '?' && vote !== '☕'
  )
  
  if (numericVotes.length === 0) return null
  
  // Count frequency of each vote
  const frequencyMap: Record<string, number> = {}
  
  numericVotes.forEach(vote => {
    frequencyMap[vote] = (frequencyMap[vote] || 0) + 1
  })
  
  // Find the maximum frequency
  let maxFrequency = 0
  Object.values(frequencyMap).forEach(frequency => {
    if (frequency > maxFrequency) {
      maxFrequency = frequency
    }
  })
  
  // Get all votes with max frequency
  const mostFrequentVotes = Object.keys(frequencyMap).filter(
    vote => frequencyMap[vote] === maxFrequency
  )
  
  // If only one winner, return it
  if (mostFrequentVotes.length === 1) {
    return mostFrequentVotes[0]
  }
  
  // If multiple winners (tie), return formatted with " or "
  const sortedVotes = mostFrequentVotes.sort((a, b) => 
    parseVoteValue(a) - parseVoteValue(b)
  )
  
  return sortedVotes.join(' or ')
}

/**
 * Converts vote string to numeric value for comparison
 * @param vote - Vote value string
 * @returns Numeric representation
 */
function parseVoteValue(vote: string): number {
  if (vote === '1/2') return 0.5
  return parseFloat(vote) || 0
}

/**
 * Formats a timestamp to a human-readable date string
 * @param timestamp - ISO timestamp string
 * @returns Formatted date (e.g., "Jan 15, 2024 at 3:45 PM")
 */
export function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Formats a duration in seconds into a compact human-readable string.
 * @param seconds - Duration in seconds
 * @returns Formatted duration (e.g., "4m 12s", "1h 03m")
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
    return '—'
  }

  const totalSeconds = Math.max(0, Math.round(seconds))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainingSeconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`
  }

  return `${minutes}m ${String(remainingSeconds).padStart(2, '0')}s`
}

/**
 * Formats a timestamp to a relative time string
 * @param timestamp - ISO timestamp string
 * @returns Relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

/**
 * Copies text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves to true if successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Gets the vote card display color based on value
 * @param value - Vote value
 * @returns Tailwind color class
 */
export function getVoteCardColor(value: string): string {
  if (value === '?') return 'bg-gray-500'
  if (value === '☕') return 'bg-amber-600'
  
  const numValue = parseVoteValue(value)
  
  if (numValue === 0) return 'bg-green-500'
  if (numValue <= 2) return 'bg-blue-500'
  if (numValue <= 5) return 'bg-cyan-500'
  if (numValue <= 10.5) return 'bg-yellow-500'
  if (numValue <= 21) return 'bg-orange-500'
  return 'bg-red-500'
}

/**
 * Get progress bar color (using custom blue #0284c7)
 * @param value - Vote value
 * @returns Custom style for progress bars
 */
export function getProgressBarColor(value: string): string {
  // Use primary-600 which is #0284c7 (defined in tailwind.config.js)
  return 'bg-primary-600'
}
