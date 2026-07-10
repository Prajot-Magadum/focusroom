"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";


import Link from "next/link"

import {
  ArrowRight,
  Users,
  Timer,
  ListChecks,
  MessageSquare,
  BarChart3,
  Music,
  Sparkles,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Users,
    title: "Live focus rooms",
    desc: "Join public or private rooms and study alongside others in real time. Presence keeps you accountable.",
  },
  {
    icon: Timer,
    title: "Pomodoro timers",
    desc: "Synced session timers keep the whole room in rhythm through focus sprints and shared breaks.",
  },
  {
    icon: ListChecks,
    title: "Shared task boards",
    desc: "Plan your session with a Notion-style checklist and watch your progress tick up as you go.",
  },
  {
    icon: MessageSquare,
    title: "Low-noise chat",
    desc: "Discord-style channels for quick questions without derailing anyone's deep work.",
  },
  {
    icon: BarChart3,
    title: "Focus analytics",
    desc: "Track streaks, total hours, and session history so you always know your momentum.",
  },
  {
    icon: Music,
    title: "Ambient sounds",
    desc: "Lo-fi, rain, and cafe soundscapes built in — set the mood without leaving the room.",
  },
]

const stats = [
  { value: "40k+", label: "Students focusing" },
  { value: "1.2M", label: "Hours studied" },
  { value: "8,500", label: "Active rooms" },
  { value: "96%", label: "Feel more focused" },
]

export default function HomePage() {
  const router = useRouter();

const { user, loading } = useAuth();

useEffect(() => {
  if (!loading && user) {
    router.replace("/dashboard");
  }
}, [user, loading, router]);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-[500px] bg-[radial-gradient(ellipse_at_top,theme(colors.primary/25%),transparent_60%)]"
          />
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Study together, stay in flow
              </span>
              <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                The focus room where students get real work done
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                FocusRoom blends the energy of Discord with the structure of Notion. Join a
                room, start a timer, and study with people who keep you accountable.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" render={<Link href="/signup" />}>
  Start focusing free
  <ArrowRight className="size-4" />
</Button>
               <Button size="lg" variant="outline" render={<Link href="/rooms" />}>
  Browse rooms
</Button> 
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required. Free forever for solo studying.
              </p>
            </div>

            {/* Preview mock */}
            <div className="mx-auto mt-16 max-w-4xl">
              <Card className="overflow-hidden border-border/60 bg-card/60 p-0 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                  <span className="size-3 rounded-full bg-destructive/70" />
                  <span className="size-3 rounded-full bg-chart-3/70" />
                  <span className="size-3 rounded-full bg-primary/70" />
                  <span className="ml-3 text-xs text-muted-foreground">
                    focusroom.app/rooms/deep-work
                  </span>
                </div>
                <div className="grid gap-4 p-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                    <p className="text-xs font-medium text-muted-foreground">Session timer</p>
                    <p className="mt-2 font-mono text-3xl font-bold tabular-nums">24:59</p>
                    <p className="mt-1 text-xs text-primary">Focus sprint · 3 of 4</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                    <p className="text-xs font-medium text-muted-foreground">In this room</p>
                    <div className="mt-3 flex -space-x-2">
                      {["A", "M", "K", "R", "+"].map((i) => (
                        <span
                          key={i}
                          className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary/20 text-xs font-medium text-primary"
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">12 studying now</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                    <p className="text-xs font-medium text-muted-foreground">My tasks</p>
                    <ul className="mt-3 space-y-2 text-xs">
                      <li className="flex items-center gap-2 text-muted-foreground line-through">
                        <span className="size-3.5 rounded border border-primary bg-primary" />
                        Read chapter 4
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-3.5 rounded border border-border" />
                        Practice problems
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-3.5 rounded border border-border" />
                        Write summary
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-border/60 bg-card/30">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold tracking-tight sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to focus, together
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Thoughtful tools that keep distractions out and momentum in — designed for the
              way students actually study.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border/60 bg-card/50 p-6 transition-colors hover:border-primary/40"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="pricing" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <Card className="relative overflow-hidden border-border/60 bg-gradient-to-b from-primary/15 to-card/40 p-10 text-center md:p-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.primary/20%),transparent_65%)]"
            />
            <div className="relative">
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to find your flow?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
                Join thousands of students who study smarter in FocusRoom. Create your first
                room in seconds.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
               <Button size="lg" render={<Link href="/signup" />}>
                  Get started free
                  <ArrowRight className="size-4" />
                </Button>
                <Button size="lg" variant="outline" render={<Link href="/login" />}>
                  Log in
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  )
}