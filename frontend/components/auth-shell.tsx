import Link from "next/link"
import { Waves } from "lucide-react"

const highlights = [
  "Join live focus rooms in one click",
  "Synced Pomodoro timers and breaks",
  "Shared task boards to stay on track",
  "Streaks and analytics that motivate",
]

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden border-r border-border/60 bg-card/40 lg:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.primary/25%),transparent_60%)]"
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Waves className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">FocusRoom</span>
          </Link>
          <div>
            <h2 className="text-balance text-3xl font-bold tracking-tight">
              Deep focus is better with company.
            </h2>
            <ul className="mt-8 space-y-4">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="size-3">
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            {"\u201C"}I finally stopped procrastinating. Studying with a room keeps me honest.
            {"\u201D"} — Priya, medical student
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Waves className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">FocusRoom</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
