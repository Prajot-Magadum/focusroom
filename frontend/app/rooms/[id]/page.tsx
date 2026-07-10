"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Globe, Lock, LogOut, Pause, Play, RotateCcw, Send, Users } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { useSocket } from "@/lib/socket"
import { useTimer } from "@/hooks/useTimer"
import * as roomService from "@/services/room"
import type { Room, RoomMembers } from "@/types/room"
import type { ChatMessage } from "@/types/chat"
import type { TimerState } from "@/types/timer"

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function initials(name: string | null) {
  if (!name) return "?"
  return name.slice(0, 2).toUpperCase()
}

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { socket, connected } = useSocket()

  const [room, setRoom] = useState<Room | null>(null)
  const [membersData, setMembersData] = useState<RoomMembers | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleTimerComplete = useCallback(
    (completedState: TimerState) => {
      if (completedState?.phase === "focus") {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            roomId: params.id,
            userId: "system",
            displayName: "FocusRoom",
            text: "🎉 Focus session complete! Great work, everyone.",
            sentAt: new Date().toISOString(),
          },
        ])
      }
    },
    [params.id],
  )

  const timer = useTimer(params.id, handleTimerComplete)

  const isMember = membersData?.members.some((m) => m.user?.id === user?.id) ?? false

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [roomData, members] = await Promise.all([
        roomService.getRoom(params.id),
        roomService.getRoomMembers(params.id),
      ])
      setRoom(roomData)
      setMembersData(members)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room")
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    load()
  }, [load])

  // Subscribe to this room's live channel for member updates + chat.
  useEffect(() => {
    if (!socket || !connected) return

    socket.emit("room:subscribe", params.id)

    function onMembers(data: RoomMembers & { roomId?: string }) {
      setMembersData(data)
    }

    function onMessage(message: ChatMessage) {
      if (message.roomId !== params.id) return
      setMessages((prev) => [...prev, message])
    }

    socket.on("room:members", onMembers)
    socket.on("chat:message", onMessage)

    return () => {
      socket.emit("room:unsubscribe", params.id)
      socket.off("room:members", onMembers)
      socket.off("chat:message", onMessage)
    }
  }, [socket, connected, params.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleJoin() {
    setJoining(true)
    try {
      await roomService.joinRoom(params.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room")
    } finally {
      setJoining(false)
    }
  }

  async function handleLeave() {
    setJoining(true)
    try {
      await roomService.leaveRoom(params.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to leave room")
    } finally {
      setJoining(false)
    }
  }

  function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!socket || !connected || !draft.trim()) return

    socket.emit("chat:message", { roomId: params.id, text: draft.trim() })
    setDraft("")
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/rooms")}>
          <ArrowLeft className="size-4" />
          Back to rooms
        </Button>

        {loading ? (
          <Card className="border-border/60 bg-card/50 p-12 text-center">
            <p className="text-sm text-muted-foreground">Loading room…</p>
          </Card>
        ) : error ? (
          <Card className="border-border/60 bg-card/50 p-12 text-center">
            <p className="font-medium text-red-500">Something went wrong</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </Card>
        ) : room ? (
          <>
            <Card className="border-border/60 bg-card/50 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary">
                    {room.is_public ? (
                      <Globe className="size-3.5" />
                    ) : (
                      <Lock className="size-3.5" />
                    )}
                    {room.is_public ? "Public room" : "Private room"}
                  </span>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight">{room.name}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Created {new Date(room.created_at).toLocaleDateString()}
                  </p>
                </div>
                {isMember ? (
                  <Button variant="outline" onClick={handleLeave} disabled={joining}>
                    <LogOut className="size-4" />
                    {joining ? "Leaving..." : "Leave"}
                  </Button>
                ) : (
                  <Button onClick={handleJoin} disabled={joining}>
                    <Users className="size-4" />
                    {joining ? "Joining..." : "Join room"}
                  </Button>
                )}
              </div>
            </Card>

            {/* Pomodoro timer */}
            <Card className="border-border/60 bg-card/50 p-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {timer.state?.phase === "break" ? "Break" : "Focus"}
                  </p>
                  <p className="text-4xl font-bold tabular-nums tracking-tight">
                    {formatClock(timer.displaySeconds)}
                  </p>
                  {!isMember && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Join the room to control the timer
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {!timer.state ? (
                    <>
                      <Button
                        disabled={!isMember}
                        onClick={() => timer.start("focus")}
                      >
                        <Play className="size-4" />
                        Start focus (25m)
                      </Button>
                      <Button
                        variant="outline"
                        disabled={!isMember}
                        onClick={() => timer.start("break")}
                      >
                        <Play className="size-4" />
                        Start break (5m)
                      </Button>
                    </>
                  ) : (
                    <>
                      {timer.state.isRunning ? (
                        <Button variant="outline" disabled={!isMember} onClick={timer.pause}>
                          <Pause className="size-4" />
                          Pause
                        </Button>
                      ) : (
                        <Button disabled={!isMember} onClick={timer.resume}>
                          <Play className="size-4" />
                          Resume
                        </Button>
                      )}
                      <Button variant="ghost" disabled={!isMember} onClick={timer.reset}>
                        <RotateCcw className="size-4" />
                        Reset
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>

            <div className="grid gap-6 sm:grid-cols-5">
              {/* Members */}
              <Card className="border-border/60 bg-card/50 p-6 sm:col-span-2">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Users className="size-4" />
                  Live members
                  <span className="text-sm font-normal text-muted-foreground">
                    ({membersData?.members.length ?? 0})
                  </span>
                </h2>
                {membersData && membersData.members.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {membersData.members.map((m) => (
                      <li
                        key={m.user?.id ?? m.joined_at}
                        className="flex items-center gap-3"
                      >
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/20 text-xs text-primary">
                            {initials(m.user?.display_name ?? null)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {m.user?.display_name ?? "Someone"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(m.joined_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No one's focusing here yet — be the first to join.
                  </p>
                )}
              </Card>

              {/* Chat */}
              <Card className="flex flex-col border-border/60 bg-card/50 p-6 sm:col-span-3">
                <h2 className="font-semibold">Room chat</h2>
                <p className="text-xs text-muted-foreground">
                  Messages aren't saved — they disappear on refresh.
                </p>

                <div className="mt-4 flex-1 space-y-3 overflow-y-auto" style={{ maxHeight: 320 }}>
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No messages yet. Say hello!
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className="text-sm">
                        <span className="font-medium">{m.displayName}</span>{" "}
                        <span className="text-xs text-muted-foreground">
                          {new Date(m.sentAt).toLocaleTimeString()}
                        </span>
                        <p className="text-foreground/90">{m.text}</p>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className="mt-4 flex gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={connected ? "Send a message…" : "Connecting…"}
                    disabled={!connected}
                  />
                  <Button type="submit" size="icon" disabled={!connected || !draft.trim()}>
                    <Send className="size-4" />
                  </Button>
                </form>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  )
}