import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ID, OAuthProvider } from 'appwrite'
import { account, apiFetch, clearJwt } from './appwriteClient'

const AuthContext = createContext(null)

/** Fired on window whenever sign-in state changes (ConsentProvider listens). */
export const AUTH_EVENT = 'videsaur:auth'

function toUser(u) {
  return u ? { id: u.$id, email: u.email, name: u.name } : null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  const refresh = useCallback(async () => {
    clearJwt()
    let u = null
    try {
      u = toUser(await account.get())
    } catch {
      u = null
    }
    setUser(u)
    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { userId: u?.id ?? null } }))

    if (u) {
      try {
        const { profile: p } = await apiFetch('/api/me')
        setProfile(p ?? null)
      } catch {
        setProfile(null)
      }
    } else {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    // Deferred so the initial check does not set state synchronously in the effect.
    Promise.resolve().then(refresh)
  }, [refresh])

  async function signIn(email, password) {
    await account.createEmailPasswordSession({ email, password })
    await refresh()
  }

  async function signUp(email, password) {
    await account.create({ userId: ID.unique(), email, password })
    await account.createEmailPasswordSession({ email, password })
    await refresh()
  }

  async function signInWithGoogle() {
    // Redirects away; the session exists when the browser comes back.
    account.createOAuth2Session({
      provider: OAuthProvider.Google,
      success: window.location.origin,
      failure: `${window.location.origin}/?auth=failed`,
    })
  }

  async function signOut() {
    try {
      await account.deleteSession({ sessionId: 'current' })
    } catch {
      // Already signed out.
    }
    await refresh()
  }

  const loading = user === undefined
  const session = user ? { user } : user // kept for older call sites
  const isLoopbackHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
  // Local development lets any authenticated developer open the admin tools.
  // import.meta.env.DEV is false in production builds, where the profile role
  // remains the only way to gain admin access.
  const isAdmin = profile?.role === 'admin' || Boolean(import.meta.env.DEV && isLoopbackHost && user)

  return (
    <AuthContext.Provider
      value={{ session, user: user ?? null, profile, isAdmin, loading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
