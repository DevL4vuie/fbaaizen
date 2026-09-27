import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Film, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, user, profile, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user && profile) {
      console.log('navigating, isAdmin:', isAdmin, 'profile:', profile)
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true })
    }
  }, [loading, user, profile, isAdmin, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { data, error: signInErr } = await signIn(email, password)
    setSubmitting(false)
    if (signInErr) {
      setError(signInErr.message || 'Failed to sign in')
    } else if (data?.user) {
      const destination = data?.profile?.role === 'admin' ? '/admin' : '/dashboard'
      navigate(destination, { replace: true })
    }
  }

  const shapes = [
    { w: 320, h: 320, top: '10%', left: '5%',  rx: 9,  ry: 7,  delay: 0,   dur: 12, opacity: 0.25, type: 'square' },
    { w: 180, h: 180, top: '60%', left: '15%', rx: -6, ry: 10, delay: 1.5, dur: 10, opacity: 0.20, type: 'square' },
    { w: 260, h: 260, top: '20%', left: '75%', rx: 7,  ry: -8, delay: 0.8, dur: 14, opacity: 0.22, type: 'square' },
    { w: 140, h: 140, top: '75%', left: '70%', rx: -9, ry: 6,  delay: 2,   dur: 9,  opacity: 0.28, type: 'square' },
    { w: 100, h: 100, top: '40%', left: '88%', rx: 5,  ry: -5, delay: 0.5, dur: 11, opacity: 0.24, type: 'square' },
    { w: 80,  h: 80,  top: '85%', left: '40%', rx: -4, ry: 8,  delay: 3,   dur: 8,  opacity: 0.30, type: 'square' },
    { w: 60,  h: 60,  top: '30%', left: '45%', rx: 6,  ry: -7, delay: 1,   dur: 13, opacity: 0.26, type: 'square' },
    { w: 50,  h: 50,  top: '55%', left: '55%', rx: -5, ry: 5,  delay: 2.5, dur: 10, opacity: 0.22, type: 'square' },
  ]

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {shapes.map((s, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              width: s.w,
              height: s.h,
              borderRadius: s.type === 'circle' ? '50%' : s.type === 'square' ? '18%' : '50%',
              background: `radial-gradient(circle at 40% 40%, rgba(251,146,60,${s.opacity + 0.05}), rgba(234,88,12,${s.opacity}), rgba(180,50,0,0))`,
              filter: 'blur(0px)',
            }}
            animate={{
              x: [0, s.rx * 8, 0],
              y: [0, s.ry * 8, 0],
              rotate: s.type === 'square' ? [0, 25, 0] : [0, 0, 0],
              scale: [1, 1.08, 1],
              opacity: [s.opacity, s.opacity + 0.08, s.opacity],
            }}
            transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
          />
        ))}
        {/* large ambient blobs */}
        <motion.div
          className="absolute -left-1/4 top-1/4 h-[36rem] w-[36rem] rounded-full bg-orange-500/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-1/4 bottom-1/4 h-[30rem] w-[30rem] rounded-full bg-orange-600/10 blur-3xl"
          animate={{ scale: [1.15, 1, 1.15], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-glow shadow-lg shadow-orange-500/30">
            <Film size={22} className="text-void" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Azein Studio</h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-text-faint">
            Creator Training Platform
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flame-border rounded-2xl border border-border p-7 shadow-2xl"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-text-muted">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint transition-colors duration-200 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-text-muted">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-faint transition-colors duration-200 focus:border-orange-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint transition-colors hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger"
            >
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={submitting}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 py-2.5 text-sm font-semibold text-void shadow-lg shadow-orange-500/20 transition-shadow duration-200 hover:shadow-orange-500/40 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
            {!submitting && <ArrowRight size={15} />}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-xs text-text-faint">
          Accounts are created by an admin. No public sign-up.
        </p>
      </motion.div>
    </div>
  )
}
