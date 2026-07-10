import Link from "next/link"
import {
  Clock,
  Flame,
  Target,
  TrendingUp,
  Play,
  Plus,
  Users,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stats = [
  { label: "Focus today", value: "3h 42m", icon: Clock, hint: "+48m vs yesterday" },
  { label: "Current streak", value: "12 days", icon: Flame, hint: "Personal best: 21" },
  { label: "Weekly goal", value: "68%", icon: Target, hint: "17 of 25 hours" },
  { label: "Sessions", value: "9", icon: TrendingUp, hint: "This week" },
]

const activeRooms = [
  { name: "Deep Work Lounge", members: 12, tag: "Focus", color: "bg-primary/20 text-primary" },
  { name: "Med School Grind", members: 8, tag: "Study", color: "bg-chart-2/20 text-chart-2" },
  { name: "Late Night Coders", members: 15, tag: "Coding", color: "bg-chart-3/20 text-chart-3" },
]

const tasks = [
  { title: "Finish calculus problem set", done: true },
  { title: "Review organic chemistry notes", done: true },
  { title: "Draft history essay outline", done: false },
  { title: "Practice 20 flashcards", done: false },
]

const weeklyBars = [
  { day: "Mon", h: 55 },
  { day: "Tue", h: 80 },
  { day: "Wed", h: 40 },
  { day: "Thu", h: 95 },
  { day: "Fri", h: 70 },
  { day: "Sat", h: 30 },
  { day: "Sun", h: 60 },
]

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, Alex</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here{"\u2019"}s your focus snapshot for today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href="/rooms" />}>
              <Users className="size-4" />
              Browse rooms
            </Button>
            <Button>
              <Play className="size-4" />
              Start session
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/60 bg-card/50 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <stat.icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Weekly chart */}
          <Card className="border-border/60 bg-card/50 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Focus this week</h2>
                <p className="text-sm text-muted-foreground">Hours studied per day</p>
              </div>
              <Badge variant="secondary">17h total</Badge>
            </div>
            <div className="mt-8 flex h-48 items-end justify-between gap-3">
              {weeklyBars.map((bar) => (
                <div key={bar.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                      style={{ height: `${bar.h}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{bar.day}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Tasks */}
          <Card className="border-border/60 bg-card/50 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Today{"\u2019"}s tasks</h2>
              <Button variant="ghost" size="icon" aria-label="Add task">
                <Plus className="size-4" />
              </Button>
            </div>
            <ul className="mt-4 space-y-3">
              {tasks.map((task) => (
                <li key={task.title} className="flex items-center gap-3">
                  <span
                    className={
                      task.done
                        ? "flex size-5 shrink-0 items-center justify-center rounded border border-primary bg-primary"
                        : "size-5 shrink-0 rounded border border-border"
                    }
                  >
                    {task.done && (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="size-3 text-primary-foreground">
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    className={
                      task.done
                        ? "text-sm text-muted-foreground line-through"
                        : "text-sm text-foreground"
                    }
                  >
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Active rooms */}
        <Card className="border-border/60 bg-card/50 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Rooms you follow</h2>
            <Button variant="ghost" size="sm" render={<Link href="/rooms" />}>
              View all
            </Button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {activeRooms.map((room) => (
              <div
                key={room.name}
                className="rounded-lg border border-border/60 bg-secondary/30 p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${room.color}`}>
                    {room.tag}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Live
                  </span>
                </div>
                <p className="mt-3 font-medium">{room.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{room.members} studying now</p>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  Join room
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
