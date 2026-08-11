'use client'

import { useState } from 'react'
import { Eye, EyeOff, TrendingUp, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })
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
      {/* Left branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-foreground p-12 lg:flex">
        <div className="relative flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
            <TrendingUp className="size-5 text-background" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-background">Money Mind</span>
        </div>

        <div className="relative">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-background/40">
            Create Account
          </p>
          <h1 className="text-5xl font-semibold leading-[1.12] tracking-tight text-background">
            Start tracking<br />your wealth today.
          </h1>
          <p className="mt-5 max-w-xs text-base leading-7 text-background/55">
            Join thousands of users organizing their personal finances in one place.
          </p>
        </div>

        <p className="relative text-xs text-background/30">
          © {new Date().getFullYear()} Money Mind. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Create an account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your details to get started
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Full Name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Miller"
                className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground focus:ring-2 disabled:opacity-50"
                disabled={loading}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Email address</span>
              <input
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
              <span className="text-sm font-medium">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-11 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground focus:ring-2 disabled:opacity-50"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-all hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
