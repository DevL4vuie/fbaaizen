import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, LogOut, Film, Menu, X, MessageSquare, Megaphone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ConfirmModal from './ConfirmModal'

const userLinks = [
  { to: '/dashboard', label: 'Watch', icon: LayoutGrid },
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/support', label: 'Support', icon: MessageSquare },
]

function NavLinks({ links, onClick }) {
  return (
    <nav className="flex-1 space-y-1 px-3">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          onClick={onClick}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-surface-2 text-text-primary ring-1 ring-orange-500/30'
                : 'text-text-muted hover:bg-surface-2/60 hover:text-text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={17} className={`transition-colors duration-200 ${isActive ? 'text-orange-500' : 'group-hover:text-orange-500'}`} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function UserFooter({ profile, onLogout }) {
  return (
    <div className="mx-3 mb-3 flex items-center gap-3 rounded-lg border border-border-soft bg-surface-2/60 px-3 py-3 transition-colors duration-200 hover:bg-surface-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 font-display text-xs font-semibold text-orange-500">
        {profile?.name?.[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-text-primary">{profile?.name ?? 'Loading…'}</p>
        <p className="truncate font-mono text-[10px] text-text-faint">{profile?.email}</p>
      </div>
      <button
        onClick={onLogout}
        aria-label="Sign out"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-faint transition-all duration-200 hover:bg-danger/10 hover:text-danger active:scale-90"
      >
        <LogOut size={14} />
      </button>
    </div>
  )
}

function SidebarContent({ onClose }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-glow">
            <Film size={18} className="text-void" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display text-[15px] font-semibold leading-tight text-text-primary">Azein Studio</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">Creator Hub</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-md p-1.5 text-text-faint transition-all duration-200 hover:bg-surface-2 hover:text-text-primary lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      <NavLinks links={userLinks} onClick={onClose} />

      {profile?.role === 'admin' && (
        <div className="px-3 pb-3">
          <NavLink
            to="/admin"
            className="flex items-center justify-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-500 transition-colors hover:bg-orange-500/20"
          >
            Switch to Admin Console
          </NavLink>
        </div>
      )}

      <UserFooter profile={profile} onLogout={() => setConfirmOpen(true)} />

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSignOut}
        title="Log out?"
        message="Are you sure you want to log out of Azein Studio?"
        confirmLabel="Log out"
        danger
      />
    </>
  )
}

export default function UserSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border-soft bg-surface/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-glow">
            <Film size={14} className="text-void" strokeWidth={2.5} />
          </div>
          <span className="font-display text-sm font-semibold text-text-primary">Azein Studio</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-text-muted transition-all duration-200 hover:bg-surface-2 hover:text-text-primary"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border-soft bg-surface/60 backdrop-blur-xl lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-void/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border-soft bg-surface backdrop-blur-xl lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
