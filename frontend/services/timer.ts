import { config } from "@/lib/config"
import { supabase } from "@/lib/supabase"
import type { TimerPhase, TimerState } from "@/types/timer"

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error("You must be logged in to do that.")
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.message || `Request failed (${response.status})`)
  }

  return body?.data as T
}

export async function getTimer(roomId: string): Promise<TimerState> {
  const response = await fetch(`${config.apiUrl}/rooms/${roomId}/timer`, {
    headers: await authHeaders(),
    cache: "no-store",
  })

  return parseJson<TimerState>(response)
}

export async function startTimer(
  roomId: string,
  phase: TimerPhase,
  durationMinutes?: number,
): Promise<TimerState> {
  const response = await fetch(`${config.apiUrl}/rooms/${roomId}/timer/start`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ phase, durationMinutes }),
  })

  return parseJson<TimerState>(response)
}

export async function pauseTimer(roomId: string): Promise<TimerState> {
  const response = await fetch(`${config.apiUrl}/rooms/${roomId}/timer/pause`, {
    method: "POST",
    headers: await authHeaders(),
  })

  return parseJson<TimerState>(response)
}

export async function resumeTimer(roomId: string): Promise<TimerState> {
  const response = await fetch(`${config.apiUrl}/rooms/${roomId}/timer/resume`, {
    method: "POST",
    headers: await authHeaders(),
  })

  return parseJson<TimerState>(response)
}

export async function resetTimer(roomId: string): Promise<void> {
  const response = await fetch(`${config.apiUrl}/rooms/${roomId}/timer/reset`, {
    method: "POST",
    headers: await authHeaders(),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || `Request failed (${response.status})`)
  }
}

export async function completeTimer(roomId: string): Promise<TimerState> {
  const response = await fetch(`${config.apiUrl}/rooms/${roomId}/timer/complete`, {
    method: "POST",
    headers: await authHeaders(),
  })

  return parseJson<TimerState>(response)
}