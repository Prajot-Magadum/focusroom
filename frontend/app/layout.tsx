import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SocketProvider } from '@/lib/socket'
import './globals.css'
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'FocusRoom — Study together, stay in flow',
  description:
    'FocusRoom is a collaborative study platform where you can join focus rooms, track your goals, and stay accountable with others.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0f1420',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
  <AuthProvider>
    <SocketProvider>{children}</SocketProvider>
  </AuthProvider>

  {process.env.NODE_ENV === "production" && <Analytics />}
</body>
    </html>
  )
}
