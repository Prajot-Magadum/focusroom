"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Waves,
  LayoutDashboard,
  Users,
  Timer,
  BarChart3,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BackendStatus } from "@/components/backend-status"
import { signOut } from "@/services/auth"
import { cn } from "@/lib/utils"

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Rooms", href: "/rooms", icon: Users },
  { label: "Sessions", href: "/dashboard", icon: Timer },
  { label: "Analytics", href: "/dashboard", icon: BarChart3 },
  { label: "Settings", href: "/dashboard", icon: Settings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await signOut()
      router.push("/login")
    } catch (err) {
      console.error("Failed to log out", err)
      setLoggingOut(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 -translate-x-full border-r border-border/60 bg-sidebar transition-transform lg:static lg:translate-x-0",
          open && "translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Waves className="size-5" />
            </span>
            <span className="font-semibold tracking-tight">FocusRoom</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {nav.map((item, i) => {
            const active = pathname === item.href && (item.label === "Dashboard" || item.label === "Rooms")
            return (
              <Link
                key={item.label + i}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/15 font-medium text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="absolute inset-x-3 bottom-3 rounded-lg border border-border/60 bg-secondary/40 p-4">
          <p className="text-sm font-medium">Go Pro</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Unlimited private rooms and deeper analytics.
          </p>
          <Button size="sm" className="mt-3 w-full">
            Upgrade
          </Button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-muted-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search rooms, tasks, people…" className="pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <BackendStatus className="hidden sm:inline-flex" />
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="size-5" />
            </Button>
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary/20 text-primary">AR</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Log out"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="size-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}