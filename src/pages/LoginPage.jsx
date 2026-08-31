import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/authContext'
import SEO from '../components/SEO'
import Logo from '../components/Logo'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin'

  const [tab, setTab] = useState(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | google | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const { signIn, signUp, signInWithGoogle, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect away if already signed in
  useEffect(() => {
    if (!authLoading && user) navigate('/', { replace: true })
  }, [user, authLoading])

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      if (tab === 'signin') {
        await signIn(email, password)
        navigate('/')
      } else {
        await signUp(email, password)
        setStatus('success')
      }
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message ?? 'Something went wrong. Please try again.')
    }
  }

  async function handleGoogle() {
    setStatus('google')
    setErrorMsg('')
    try {
      await signInWithGoogle()
      // Page will redirect to Google — nothing else to do here
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message ?? 'Google sign-in failed. Please try again.')
    }
  }

  function switchTab(t) {
    setTab(t)
    setStatus('idle')
    setErrorMsg('')
  }

  return (
    <>
      <SEO
        title="Sign in — Videsaur"
        description="Sign in or create a Videsaur account to download memes and manage content."
        canonicalPath="/login"
      />

      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-5">
          {/* Logo */}
          <div className="flex justify-center pb-1">
            <Logo />
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl border border-edge bg-panel p-1">
            <button
              type="button"
              onClick={() => switchTab('signin')}
              className={[
                'flex-1 rounded-lg py-2 text-sm font-semibold transition-colors',
                tab === 'signin' ? 'bg-brand text-ink' : 'text-mid hover:text-hi',
              ].join(' ')}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchTab('signup')}
              className={[
                'flex-1 rounded-lg py-2 text-sm font-semibold transition-colors',
                tab === 'signup' ? 'bg-brand text-ink' : 'text-mid hover:text-hi',
              ].join(' ')}
            >
              Sign up
            </button>
          </div>

          {status === 'success' ? (
            <div className="rounded-2xl border border-brand/30 bg-brand/10 p-5 text-center text-sm text-hi">
              <p className="font-semibold">Check your email!</p>
              <p className="mt-1 text-mid">
                We sent a confirmation link to <span className="text-hi">{email}</span>.
                Click it to activate your account, then sign in.
              </p>
              <button
                type="button"
                onClick={() => switchTab('signin')}
                className="mt-3 text-xs font-semibold text-brand hover:underline"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              {/* Google OAuth */}
              <button
                type="button"
                disabled={status === 'loading' || status === 'google'}
                onClick={handleGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-edge bg-white/5 py-2.5 text-sm font-semibold text-hi transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'google' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-edge" />
                <span className="text-xs text-mid/60">or continue with email</span>
                <div className="flex-1 border-t border-edge" />
              </div>

              {/* Email / password form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="mb-1 block text-xs font-semibold text-hi">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-hi placeholder-mist/50 outline-none transition-colors focus:border-brand"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-1 block text-xs font-semibold text-hi">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-hi placeholder-mist/50 outline-none transition-colors focus:border-brand"
                    placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'}
                  />
                </div>

                {status === 'error' && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'google'}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-ink transition-colors hover:bg-brand-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'loading' ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : tab === 'signin' ? (
                    <><LogIn className="size-4" /> Sign in</>
                  ) : (
                    <><UserPlus className="size-4" /> Create account</>
                  )}
                </button>

                {tab === 'signup' && (
                  <p className="text-center text-xs text-mid">
                    By signing up you agree to our{' '}
                    <a href="/terms" className="text-hi underline-offset-2 hover:underline">Terms</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-hi underline-offset-2 hover:underline">Privacy Policy</a>.
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
