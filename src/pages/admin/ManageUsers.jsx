import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Users,
  AlertCircle,
  Trash2,
  ShieldOff,
  ShieldCheck,
  Archive,
  RotateCcw,
  Search,
  Filter
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import AdminShell from '../../components/AdminShell'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'

export default function ManageUsers() {
  const { user, isSuperAdmin, selectedAdminId } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active') // 'active' | 'archived'
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(null) // { title, message, onConfirm, danger, confirmLabel }

  async function load() {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .order('created_at', { ascending: false })

    if (!isSuperAdmin) {
      if (user?.id) {
        query = query.eq('created_by_admin_id', user.id)
      }
    } else {
      if (selectedAdminId === 'mine') {
        query = query.eq('created_by_admin_id', user?.id)
      } else if (selectedAdminId && selectedAdminId !== 'all') {
        query = query.eq('created_by_admin_id', selectedAdminId)
      }
    }

    const { data, error: fetchErr } = await query
    if (fetchErr) console.error('Error fetching users:', fetchErr)
    setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [isSuperAdmin, user?.id, selectedAdminId])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        'https://putsxlospdobnwigjgza.supabase.co/functions/v1/admin-create-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(form),
        }
      )
      const data = await res.json()
      if (!res.ok || data?.error) {
        setError(data?.error ?? 'Could not create the account.')
        setSaving(false)
        return
      }

      // Associate the new student/user with the creator admin who created them
      if (data?.id && user?.id) {
        await supabase
          .from('profiles')
          .update({ created_by_admin_id: user.id })
          .eq('id', data.id)
      }
    } catch (err) {
      setError(err.message ?? 'Could not create the account.')
      setSaving(false)
      return
    }
    setSaving(false)
    setModalOpen(false)
    setForm({ name: '', email: '', password: '', role: 'user' })
    load()
  }

  async function handleBanToggle(u) {
    const banning = !u.banned
    setConfirm({
      title: banning ? `Ban ${u.name}?` : `Unban ${u.name}?`,
      message: banning
        ? 'They will be immediately signed out and blocked from logging in. Once banned, you can archive/delete their account if desired.'
        : 'They will be granted permission to sign in again.',
      danger: banning,
      confirmLabel: banning ? 'Ban user' : 'Unban user',
      onConfirm: async () => {
        await supabase.from('profiles').update({ banned: banning }).eq('id', u.id)
        load()
      },
    })
  }

  // Deleting a banned user moves them to Archive
  async function handleArchiveDelete(u) {
    setConfirm({
      title: `Archive & Delete ${u.name}?`,
      message:
        'This account is banned. Deleting it will move it to the "Archived Accounts" vault, permanently revoking dashboard and platform access.',
      danger: true,
      confirmLabel: 'Archive & Delete',
      onConfirm: async () => {
        const { error: err } = await supabase
          .from('profiles')
          .update({
            is_archived: true,
            archived_at: new Date().toISOString(),
          })
          .eq('id', u.id)

        if (err) {
          // If is_archived column is missing or fails, fall back to permanent delete
          console.warn('Archive column issue, falling back to delete:', err)
          await supabase.from('profiles').delete().eq('id', u.id)
        }
        load()
      },
    })
  }

  // Restore an archived account back to active
  async function handleRestore(u) {
    setConfirm({
      title: `Restore ${u.name}?`,
      message: 'This will bring the account back to the Active user list. (Note: Account will remain banned until unbanned).',
      danger: false,
      confirmLabel: 'Restore Account',
      onConfirm: async () => {
        await supabase
          .from('profiles')
          .update({ is_archived: false, archived_at: null })
          .eq('id', u.id)
        load()
      },
    })
  }

  // Permanent purge from archived list
  async function handlePermanentDelete(u) {
    setConfirm({
      title: `Permanently Erase ${u.name}?`,
      message: 'This will permanently erase their profile record from the database. This action cannot be undone.',
      danger: true,
      confirmLabel: 'Permanently Erase',
      onConfirm: async () => {
        await supabase.from('profiles').delete().eq('id', u.id)
        load()
      },
    })
  }

  async function handleRoleToggle(u) {
    const next = u.role === 'admin' ? 'user' : 'admin'
    setConfirm({
      title: `Change role to ${next}?`,
      message: `${u.name} will ${next === 'admin' ? 'gain admin access' : 'lose admin access'}.`,
      danger: false,
      confirmLabel: 'Change role',
      onConfirm: async () => {
        await supabase.from('profiles').update({ role: next }).eq('id', u.id)
        load()
      },
    })
  }

  // Filter based on active vs archived
  const activeUsers = users.filter((u) => !u.is_archived)
  const archivedUsers = users.filter((u) => !!u.is_archived)

  const displayedUsers = (activeTab === 'active' ? activeUsers : archivedUsers).filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminShell
      eyebrow="Admin"
      title="Manage Users"
      description="Manage active members, roles, bans, and archived accounts."
      actions={
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Create account
        </Button>
      }
    >
      {/* Navigation tabs & Search bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tab pills */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-orange-500 text-void shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Users size={14} />
            <span>Active Users</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                activeTab === 'active' ? 'bg-void/20 text-void' : 'bg-surface-2 text-text-faint'
              }`}
            >
              {activeUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'archived'
                ? 'bg-orange-500 text-void shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Archive size={14} />
            <span>Archived Accounts</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                activeTab === 'archived' ? 'bg-void/20 text-void' : 'bg-surface-2 text-text-faint'
              }`}
            >
              {archivedUsers.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <Loader label="Loading users" />
      ) : displayedUsers.length === 0 ? (
        <EmptyState
          icon={activeTab === 'active' ? Users : Archive}
          title={activeTab === 'active' ? 'No active users found' : 'No archived accounts'}
          description={
            activeTab === 'active'
              ? searchQuery
                ? 'No users match your search query.'
                : 'Create an account to grant someone access to the platform.'
              : 'Banned accounts that you delete will be safely kept in this archive.'
          }
          action={
            activeTab === 'active' && !searchQuery ? (
              <Button onClick={() => setModalOpen(true)} className="mt-2">
                <Plus size={16} /> Create account
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <AnimatePresence>
            {displayedUsers.map((u) => (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border-b border-border-soft px-5 py-4 last:border-0 transition-colors duration-200 hover:bg-surface-2"
              >
                {/* User avatar and info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-3 font-display text-xs font-semibold text-orange-500">
                    {u.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-text-primary">{u.name}</p>
                      {u.banned && (
                        <span className="rounded-full bg-danger/10 px-2 py-0.5 font-mono text-[10px] text-danger border border-danger/20">
                          Banned
                        </span>
                      )}
                      {u.is_archived && (
                        <span className="rounded-full bg-surface-3 px-2 py-0.5 font-mono text-[10px] text-text-faint border border-border">
                          Archived
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-text-faint">{u.email}</p>
                  </div>
                </div>

                {/* Status info & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden font-mono text-[11px] text-text-faint md:block">
                    {u.is_archived && u.archived_at
                      ? `Archived ${new Date(u.archived_at).toLocaleDateString()}`
                      : u.last_active
                      ? `Active ${new Date(u.last_active).toLocaleDateString()}`
                      : 'Never active'}
                  </span>

                  {/* Role Button (Active tab only) */}
                  {!u.is_archived && (
                    <button
                      onClick={() => handleRoleToggle(u)}
                      className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-all hover:scale-105 ${
                        u.role === 'admin'
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                          : 'bg-surface-2 text-text-muted border border-border'
                      }`}
                      title="Click to toggle Admin / User role"
                    >
                      {u.role}
                    </button>
                  )}

                  {/* ACTIVE TAB ACTIONS */}
                  {!u.is_archived && u.role !== 'admin' && (
                    <div className="flex items-center gap-1.5">
                      {/* Ban / Unban Toggle */}
                      <button
                        onClick={() => handleBanToggle(u)}
                        title={u.banned ? 'Unban user' : 'Ban user'}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                          u.banned
                            ? 'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25'
                            : 'bg-surface-2 text-text-muted hover:text-orange-400 hover:bg-surface-3'
                        }`}
                      >
                        {u.banned ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                        <span className="hidden sm:inline">{u.banned ? 'Unban' : 'Ban'}</span>
                      </button>

                      {/* Delete to Archive (Available once banned) */}
                      {u.banned && (
                        <button
                          onClick={() => handleArchiveDelete(u)}
                          title="Delete banned user to Archive"
                          className="flex items-center gap-1.5 rounded-lg bg-danger/10 px-2.5 py-1.5 text-xs font-semibold text-danger border border-danger/30 transition-all hover:bg-danger/20 active:scale-95"
                        >
                          <Trash2 size={14} />
                          <span>Delete to Archive</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* ARCHIVED TAB ACTIONS */}
                  {u.is_archived && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore(u)}
                        title="Restore account to Active list"
                        className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-medium text-text-primary border border-border hover:border-orange-500/40 hover:bg-surface-3 transition-all"
                      >
                        <RotateCcw size={14} className="text-orange-400" />
                        <span>Restore</span>
                      </button>

                      <button
                        onClick={() => handlePermanentDelete(u)}
                        title="Permanently erase from database"
                        className="flex items-center gap-1.5 rounded-lg bg-danger/10 px-2.5 py-1.5 text-xs font-medium text-danger border border-danger/20 hover:bg-danger/20 transition-all"
                      >
                        <Trash2 size={14} />
                        <span>Erase</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Account Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create account">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary focus:border-orange-500 focus:outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Temporary password</label>
            <input
              required
              minLength={6}
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Share this with the user securely"
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create account'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={confirm?.onConfirm ?? (() => {})}
        title={confirm?.title ?? ''}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger}
      />
    </AdminShell>
  )
}
