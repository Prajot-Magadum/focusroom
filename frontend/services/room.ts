import { config } from "@/lib/config"
import { supabase } from "@/lib/supabase"
import type { CreateRoomInput, Room, RoomMembers } from "@/types/room"

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

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  const response = await fetch(`${config.apiUrl}/rooms`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ name: input.name, isPublic: input.isPublic }),
  })

  return parseJson<Room>(response)
}

export async function listRooms(): Promise<Room[]> {
  const response = await fetch(`${config.apiUrl}/rooms`, {
    headers: await authHeaders(),
    cache: "no-store",
  })

  return parseJson<Room[]>(response)
}

export async function getRoom(id: string): Promise<Room> {
  const response = await fetch(`${config.apiUrl}/rooms/${id}`, {
    headers: await authHeaders(),
    cache: "no-store",
  })

  return parseJson<Room>(response)
}

export async function deleteRoom(id: string): Promise<void> {
  const response = await fetch(`${config.apiUrl}/rooms/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || `Request failed (${response.status})`)
  }
}

export async function joinRoom(id: string) {
  const response = await fetch(`${config.apiUrl}/rooms/${id}/join`, {
    method: "POST",
    headers: await authHeaders(),
  })

  return parseJson(response)
}

export async function leaveRoom(id: string): Promise<void> {
  const response = await fetch(`${config.apiUrl}/rooms/${id}/leave`, {
    method: "POST",
    headers: await authHeaders(),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || `Request failed (${response.status})`)
  }
}

export async function getRoomMembers(id: string): Promise<RoomMembers> {
  const response = await fetch(`${config.apiUrl}/rooms/${id}/members`, {
    headers: await authHeaders(),
    cache: "no-store",
  })

  return parseJson<RoomMembers>(response)
}