import { nanoid } from 'nanoid'

/**
 * Generates a unique, URL-friendly invite code for a room
 * @param length - Length of the code (default: 8)
 * @returns A unique invite code (e.g., "a1b2c3d4")
 */
export function generateInviteCode(length: number = 8): string {
  // Using nanoid with custom alphabet for better readability
  // Excludes confusing characters like 0, O, I, l
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz'
  return nanoid(length).split('').map(c => alphabet[Math.abs(c.charCodeAt(0)) % alphabet.length]).join('')
}

/**
 * Calculates the average of numeric votes, ignoring special cards (? and ☕)
 * @param votes - Array of vote values
 * @returns Average score rounded to 2 decimal places, or null if no numeric votes
 */
export function calculateAverage(votes: string[]): number | null {
  const numericVotes = votes
    .filter(vote => /^\d+$/.test(vote))
    .map(Number)
  
  if (numericVotes.length === 0) return null
  
  const sum = numericVotes.reduce((acc, vote) => acc + vote, 0)
  return Math.round((sum / numericVotes.length) * 100) / 100
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
  const numValue = parseInt(value, 10)
  
  if (value === '?') return 'bg-gray-500'
  if (value === '☕') return 'bg-amber-600'
  if (numValue === 0) return 'bg-green-500'
  if (numValue <= 3) return 'bg-blue-500'
  if (numValue <= 8) return 'bg-yellow-500'
  if (numValue <= 21) return 'bg-orange-500'
  return 'bg-red-500'
}
