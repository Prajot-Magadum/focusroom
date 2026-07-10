"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSocket } from "@/lib/socket"
import * as timerService from "@/services/timer"
import type { TimerPhase, TimerState } from "@/types/timer"

function computeRemaining(state: TimerState) {
  if (!state) return 0
  if (!state.isRunning || !state.startedAt) return state.remainingSeconds
  const elapsed = (Date.now() - new Date(state.startedAt).getTime()) / 1000
  return Math.max(0, Math.round(state.remainingSeconds - elapsed))
}

export function useTimer(roomId: string, onComplete?: (state: TimerState) => void) {
  const { socket, connected } = useSocket()
  const [state, setState] = useState<TimerState>(null)
  const [displaySeconds, setDisplaySeconds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const completingRef = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await timerService.getTimer(roomId)
      setState(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timer")
    } finally {
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!socket || !connected) return

    function onUpdate(data: TimerState) {
      setState(data)
      completingRef.current = false
    }

    function onCompleted(data: TimerState) {
      completingRef.current = false
      onComplete?.(data)
    }

    socket.on("timer:update", onUpdate)
    socket.on("timer:completed", onCompleted)
    return () => {
      socket.off("timer:update", onUpdate)
      socket.off("timer:completed", onCompleted)
    }
  }, [socket, connected, onComplete])

  useEffect(() => {
    function tick() {
      const remaining = computeRemaining(state)
      setDisplaySeconds(remaining)

      if (remaining <= 0 && state?.isRunning && !completingRef.current) {
        completingRef.current = true
        timerService
          .completeTimer(roomId)
          .then((data) => {
            setState(null)
            onComplete?.(data)
          })
          .catch(() => {
            completingRef.current = false
          })
      }
    }

    tick()

    if (!state?.isRunning) return

    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [state, roomId, onComplete])

  const start = useCallback(
    async (phase: TimerPhase, durationMinutes?: number) => {
      const data = await timerService.startTimer(roomId, phase, durationMinutes)
      setState(data)
    },
    [roomId],
  )

  const pause = useCallback(async () => {
    const data = await timerService.pauseTimer(roomId)
    setState(data)
  }, [roomId])

  const resume = useCallback(async () => {
    const data = await timerService.resumeTimer(roomId)
    setState(data)
  }, [roomId])

  const reset = useCallback(async () => {
    await timerService.resetTimer(roomId)
    setState(null)
  }, [roomId])

  return { state, displaySeconds, loading, error, start, pause, resume, reset }
}