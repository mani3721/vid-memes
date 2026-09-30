import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('role, display_name, email')
      .eq('id', userId)
      .single()
    setProfile(data ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) fetchProfile(s.user.id)
      else setSession(null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user) fetchProfile(s.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const loading = session === undefined
  const user = session?.user ?? null
  const isLoopbackHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
  // Local development lets any authenticated developer open the admin tools.
  // import.meta.env.DEV is compiled to false in production builds, where the
  // profile role remains the only way to gain admin access.
  const isAdmin = profile?.role === 'admin' || Boolean(import.meta.env.DEV && isLoopbackHost && user)

  return (
    <AuthContext.Provider value={{ session, user, profile, isAdmin, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
