'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { config } from '@/lib/config'
import { supabase } from '@/lib/supabase'

type SocketContextValue = {
  socket: Socket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)

  const socket = useMemo(
    () =>
      io(config.socketUrl, {
        autoConnect: false,
        transports: ['websocket', 'polling'],
        auth: async (cb) => {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          cb({ token: session?.access_token ?? null })
        },
      }),
    [],
  )

  useEffect(() => {
    socket.connect()

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.disconnect()
    }
  }, [socket])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}