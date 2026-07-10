export type TimerPhase = "focus" | "break"

export type TimerState = {
  roomId: string
  phase: TimerPhase
  durationSeconds: number
  remainingSeconds: number
  startedAt: string | null
  isRunning: boolean
  updatedAt: string
} | null