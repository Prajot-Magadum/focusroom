"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Users, Lock, Globe, Trash2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { BackendStatus } from "@/components/backend-status"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { useRooms } from "@/hooks/useRooms"
import { cn } from "@/lib/utils"

const filters = ["All", "Public", "Private"] as const

export default function RoomsPage() {
  const [active, setActive] = useState<(typeof filters)[number]>("All")
  const [query, setQuery] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomIsPublic, setNewRoomIsPublic] = useState(true)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const router = useRouter()
  const { user } = useAuth()
  const { rooms, loading, error, create, remove } = useRooms()

  const filtered = useMemo(() => {
    return rooms.filter((room) => {
      const matchesFilter =
        active === "All" ||
        (active === "Public" && room.is_public) ||
        (active === "Private" && !room.is_public)
      const matchesQuery = room.name.toLowerCase().includes(query.toLowerCase())
      return matchesFilter && matchesQuery
    })
  }, [rooms, active, query])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newRoomName.trim()) return

    setCreating(true)
    setCreateError(null)
    try {
      await create({ name: newRoomName.trim(), isPublic: newRoomIsPublic })
      setNewRoomName("")
      setNewRoomIsPublic(true)
      setShowCreate(false)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create room")
    } finally {
      setCreating(false)
    }
  }

  function openRoom(roomId: string) {
    router.push(`/rooms/${roomId}`)
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Focus rooms</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Find a room that matches your vibe, or create your own.
            </p>
            <BackendStatus className="mt-3 sm:hidden" />
          </div>
          <Button onClick={() => setShowCreate((v) => !v)}>
            <Plus className="size-4" />
            Create room
          </Button>
        </div>

        {/* Create room form */}
        {showCreate && (
          <Card className="border-border/60 bg-card/50 p-5">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Room name</Label>
                <Input
                  id="room-name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Deep Work Room"
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewRoomIsPublic(true)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
                    newRoomIsPublic
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  <Globe className="size-3.5" />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setNewRoomIsPublic(false)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
                    !newRoomIsPublic
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  <Lock className="size-3.5" />
                  Private
                </button>
              </div>
              {createError && <p className="text-sm text-red-500">{createError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create room"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Search + filters */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rooms…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActive(f)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  active === f
                    ? "border-primary bg-primary/15 font-medium text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <Card className="border-border/60 bg-card/50 p-12 text-center">
            <p className="text-sm text-muted-foreground">Loading rooms…</p>
          </Card>
        ) : error ? (
          <Card className="border-border/60 bg-card/50 p-12 text-center">
            <p className="font-medium text-red-500">Couldn't load rooms</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </Card>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((room) => {
              const isOwner = user?.id === room.owner_id
              return (
                <Card
                  key={room.id}
                  className="flex flex-col border-border/60 bg-card/50 p-5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 rounded-md bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                      {room.is_public ? (
                        <Globe className="size-3.5" />
                      ) : (
                        <Lock className="size-3.5" />
                      )}
                      {room.is_public ? "Public" : "Private"}
                    </span>
                    {isOwner && (
                      <span className="text-xs text-muted-foreground">Owned by you</span>
                    )}
                  </div>
                  <h3 className="mt-3 font-semibold">{room.name}</h3>
                  <p className="mt-1 flex-1 text-xs text-muted-foreground">
                    Created {new Date(room.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      className="flex-1"
                      variant={room.is_public ? "default" : "outline"}
                      onClick={() => openRoom(room.id)}
                    >
                      <Users className="size-4" />
                      Open room
                    </Button>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete room"
                        onClick={() => remove(room.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-border/60 bg-card/50 p-12 text-center">
            <p className="font-medium">No rooms found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search or filter — or create your own room.
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  )
}