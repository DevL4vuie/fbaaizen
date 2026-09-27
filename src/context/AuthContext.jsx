import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { logActivity, ACTIONS } from '../lib/activityLogger'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId, userEmail = '', userMetadata = {}) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (data) {
        localStorage.setItem(`azein_role_${userId}`, data.role)
        return data
      }

      // If user row does not exist in profiles table yet:
      // Check if we previously cached their role or check metadata
      const cachedRole = localStorage.getItem(`azein_role_${userId}`)
      const metaRole = userMetadata?.role
      const assignedRole = cachedRole || metaRole || 'user'

      const name = userMetadata?.name || userEmail.split('@')[0] || 'User'
      const newProfile = {
        id: userId,
        name,
        email: userEmail,
        role: assignedRole,
        created_by_admin: true,
        last_active: new Date().toISOString(),
      }

      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .upsert(newProfile, { onConflict: 'id' })
        .select('*')
        .single()

      if (insertError) {
        console.warn('Auto profile create error (table/RLS issue):', insertError)
        return newProfile
      }
      if (inserted) {
        localStorage.setItem(`azein_role_${userId}`, inserted.role)
        return inserted
      }
      return newProfile
    } catch (err) {
      console.error('Error loading profile:', err)
      const cachedRole = localStorage.getItem(`azein_role_${userId}`) || 'user'
      return {
        id: userId,
        name: userEmail.split('@')[0] || 'User',
        email: userEmail,
        role: cachedRole,
      }
    }
  }

  useEffect(() => {
    let mounted = true

    // Initial session check on page load or refresh
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const p = await loadProfile(currentUser.id, currentUser.email, currentUser.user_metadata)
        if (mounted) setProfile(p)
      } else {
        setProfile(null)
      }
      if (mounted) setLoading(false)
    })

    // Listen for auth events
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          const p = await loadProfile(currentUser.id, currentUser.email, currentUser.user_metadata)
          if (mounted) {
            setProfile(p)
            supabase.from('profiles').update({ last_active: new Date().toISOString() }).eq('id', currentUser.id).then(() => {})
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error }
    }
    if (data?.user) {
      const p = await loadProfile(data.user.id, data.user.email, data.user.user_metadata)
      setProfile(p)
      setUser(data.user)
      if (p?.banned) {
        await supabase.auth.signOut()
        return { error: { message: 'Your account has been banned. Contact an admin.' } }
      }
      logActivity(data.user.id, ACTIONS.LOGIN, { email: data.user.email })
      return { data: { ...data, profile: p }, error: null }
    }
    return { data, error: null }
  }

  async function signOut() {
    if (user?.id) {
      logActivity(user.id, ACTIONS.LOGOUT)
      localStorage.removeItem(`azein_role_${user.id}`)
    }
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const role = profile?.role || 'user'
  const isAdmin = role === 'admin'
  const isUser = role === 'user'

  const hasRole = (requiredRole) => {
    if (!profile) return false
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(profile.role)
    }
    return profile.role === requiredRole
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      role,
      isAdmin,
      isUser,
      hasRole,
      loading,
      signIn,
      signOut,
      refreshProfile: async () => {
        if (user) {
          const p = await loadProfile(user.id, user.email, user.user_metadata)
          setProfile(p)
        }
      }
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
