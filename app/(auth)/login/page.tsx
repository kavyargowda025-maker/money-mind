'use client'

import { useState } from 'react'
import { Eye, EyeOff, TrendingUp, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
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

  return (
    <div className="relative flex min-h-screen overflow-hidden">

      {/* ── Left panel: branding ── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-foreground p-12 lg:flex">
        {/* Background decoration */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, oklch(0.7 0.15 260) 0%, transparent 55%), radial-gradient(circle at 80% 80%, oklch(0.6 0.12 320) 0%, transparent 55%)',
          }}
        />
        {/* Grid lines */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(oklch(1 0 0 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.3) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
            <TrendingUp className="size-5 text-background" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-background">Money Mind</span>
        </div>

        {/* Hero copy */}
        <div className="relative">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-background/40">
            Personal Finance
          </p>
          <h1 className="text-5xl font-semibold leading-[1.12] tracking-tight text-background">
            Your money,<br />made clear.
          </h1>
          <p className="mt-5 max-w-xs text-base leading-7 text-background/55">
            Track spending, hit your goals, and understand your finances — all in one calm workspace.
          </p>

          {/* Stat pills */}
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { label: 'Transactions tracked', value: '10k+' },
              { label: 'Avg. savings increase', value: '23%' },
              { label: 'Users', value: '5,000+' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-background/10 bg-background/5 px-4 py-3 backdrop-blur-sm"
              >
                <p className="text-xl font-semibold text-background">{value}</p>
                <p className="mt-0.5 text-xs text-background/45">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p className="relative text-xs text-background/30">
          © {new Date().getFullYear()} Money Mind. All rights reserved.
        </p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16">

        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-2 lg:hidden">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground">
            <TrendingUp className="size-4 text-background" />
          </div>
          <span className="text-base font-semibold">Money Mind</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form id="login-form" onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email */}
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

            {/* Password */}
            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Password</span>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
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

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google OAuth */}
          <button
            id="google-login"
            type="button"
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${location.origin}/` },
              })
            }}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            {/* Google icon */}
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

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
