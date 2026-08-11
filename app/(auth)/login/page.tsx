'use client'

import { useState } from 'react'
import { Eye, EyeOff, TrendingUp, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const handleDemoLogin = async () => {
    setError('')
    setDemoLoading(true)
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        setError(data.error || 'Failed to create demo session')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Left panel: branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-foreground p-12 lg:flex">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, oklch(0.7 0.15 260) 0%, transparent 55%), radial-gradient(circle at 80% 80%, oklch(0.6 0.12 320) 0%, transparent 55%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(oklch(1 0 0 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.3) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
            <TrendingUp className="size-5 text-background" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-background">Money Mind</span>
        </div>

        <div className="relative">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-background/40">
            Personal Finance Tracker
          </p>
          <h1 className="text-5xl font-semibold leading-[1.12] tracking-tight text-background">
            Your money,<br />made clear.
          </h1>
          <p className="mt-5 max-w-xs text-base leading-7 text-background/55">
            Track spending, set budgets, build financial goals, and see interactive analytics — per user.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { label: 'Transactions tracked', value: '10k+' },
              { label: 'Avg. savings increase', value: '23%' },
              { label: 'Active Users', value: '5,000+' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-background/10 bg-background/5 px-4 py-3 backdrop-blur-xs"
              >
                <p className="text-xl font-semibold text-background">{value}</p>
                <p className="mt-0.5 text-xs text-background/45">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-background/30">
          © {new Date().getFullYear()} Money Mind. All rights reserved.
        </p>
      </div>

      {/* Right panel: form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mb-10 flex items-center gap-2 lg:hidden">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground">
            <TrendingUp className="size-4 text-background" />
          </div>
          <span className="text-base font-semibold">Money Mind</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/20 disabled:opacity-50"
          >
            {demoLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Setting up demo session...
              </>
            ) : (
              <>
                <Sparkles className="size-4 text-primary" />
                Try Instant Demo Login
              </>
            )}
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or sign in with password</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form id="login-form" onSubmit={handleLogin} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Email address</span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground focus:ring-2 disabled:opacity-50"
                disabled={loading}
              />
            </label>

            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Password</span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-11 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground focus:ring-2 disabled:opacity-50"
                  disabled={loading}
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            <button
              id="login-submit"
              type="submit"
              disabled={loading || demoLoading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-all hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/sign-up"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
