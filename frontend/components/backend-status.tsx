'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { checkHealth, type HealthResponse } from '@/lib/api'
import { useSocket } from '@/lib/socket'

type Status = 'checking' | 'online' | 'offline'

export function BackendStatus({ className }: { className?: string }) {
  const { connected } = useSocket()
  const [status, setStatus] = useState<Status>('checking')
  const [health, setHealth] = useState<HealthResponse | null>(null)

  useEffect(() => {
    let active = true

    async function poll() {
      try {
        const data = await checkHealth()
        if (!active) return
        setHealth(data)
        setStatus('online')
      } catch {
        if (!active) return
        setHealth(null)
        setStatus('offline')
      }
    }

    poll()
    const interval = setInterval(poll, 30000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  const label =
    status === 'checking'
      ? 'Checking server…'
      : status === 'online' && connected
        ? 'Live'
        : status === 'online'
          ? 'API online'
          : 'Server offline'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs text-muted-foreground',
        className,
      )}
      title={health ? `Uptime: ${Math.floor(health.uptime)}s` : undefined}
    >
      <span
        className={cn(
          'size-2 rounded-full',
          status === 'checking' && 'animate-pulse bg-chart-3',
          status === 'online' && connected && 'bg-primary',
          status === 'online' && !connected && 'bg-chart-3',
          status === 'offline' && 'bg-destructive',
        )}
      />
      {label}
    </span>
  )
}
