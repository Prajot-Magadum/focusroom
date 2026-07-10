"use client"

import { useCallback, useEffect, useState } from "react"
import * as roomService from "@/services/room"
import type { CreateRoomInput, Room } from "@/types/room"

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await roomService.listRooms()
      setRooms(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rooms")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(async (input: CreateRoomInput) => {
    const room = await roomService.createRoom(input)
    setRooms((prev) => [room, ...prev])
    return room
  }, [])

  const remove = useCallback(async (id: string) => {
    await roomService.deleteRoom(id)
    setRooms((prev) => prev.filter((room) => room.id !== id))
  }, [])

  return { rooms, loading, error, refresh, create, remove }
}