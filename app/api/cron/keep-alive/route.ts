import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const TABLES = ['rooms', 'participants', 'topics', 'votes'] as const
const REALTIME_PATH = '/realtime/v1/websocket'

type TableName = (typeof TABLES)[number]

const isAuthorized = (request: Request) => {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const header = request.headers.get('authorization') ?? ''
  const [scheme, token] = header.split(' ')

  if (scheme?.toLowerCase() !== 'bearer' || !token) return false

  const provided = Buffer.from(token)
  const expected = Buffer.from(secret)

  if (provided.length !== expected.length) return false

  return timingSafeEqual(provided, expected)
}

const countRows = async (table: TableName) => {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })

  if (error) {
    throw new Error(`count ${table}: ${error.message}`)
  }

  return count ?? 0
}

const getLatestRoom = async () => {
  const { data, error } = await supabase
    .from('rooms')
    .select('invite_code, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(`latest room: ${error.message}`)
  }

  if (!data) return null

  return {
    inviteCode: data.invite_code,
    createdAt: data.created_at,
  }
}

const checkRealtime = async (timeoutMs: number = 5000) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const startedAt = Date.now()

  if (!supabaseUrl || !supabaseAnonKey) {
    return { reachable: false, status: null, durationMs: 0 }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${supabaseUrl}${REALTIME_PATH}`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      signal: controller.signal,
      cache: 'no-store',
    })

    return {
      reachable: true,
      status: response.status,
      durationMs: Date.now() - startedAt,
    }
  } catch {
    return {
      reachable: false,
      status: null,
      durationMs: Date.now() - startedAt,
    }
  } finally {
    clearTimeout(timer)
  }
}

export const GET = async (request: Request) => {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 }
    )
  }

  const startedAt = Date.now()

  try {
    const counts = await Promise.all(TABLES.map(countRows))
    const latestRoom = await getLatestRoom()
    const realtime = await checkRealtime()

    const tables = Object.fromEntries(
      TABLES.map((table, index) => [table, counts[index]])
    ) as Record<TableName, number>

    return NextResponse.json(
      {
        ok: true,
        tables,
        latestRoom,
        realtime,
        durationMs: Date.now() - startedAt,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'

    return NextResponse.json(
      {
        ok: false,
        error: message,
        durationMs: Date.now() - startedAt,
      },
      { status: 500 }
    )
  }
}
