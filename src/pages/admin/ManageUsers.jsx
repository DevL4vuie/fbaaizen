import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users, AlertCircle, Trash2, ShieldOff, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import AdminShell from '../../components/AdminShell'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(null) // { title, message, onConfirm, danger }

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

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
        ? 'They will be signed out and blocked from logging in.'
        : 'They will be able to log in again.',
      danger: banning,
      confirmLabel: banning ? 'Ban user' : 'Unban user',
      onConfirm: async () => {
        await supabase.from('profiles').update({ banned: banning }).eq('id', u.id)
        load()
      },
    })
  }

  async function handleDelete(userId, name) {
    setConfirm({
      title: `Delete ${name}?`,
      message: 'This will permanently remove their account and access.',
      danger: true,
      confirmLabel: 'Delete account',
      onConfirm: async () => {
        await supabase.from('profiles').delete().eq('id', userId)
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

  return (
    <AdminShell
      eyebrow="Admin"
      title="Manage Users"
      description="Accounts are created here only — there's no public sign-up."
      actions={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> Create account</Button>}
    >
      {loading ? (
        <Loader label="Loading users" />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users yet" description="Create the first account to get someone into the platform." action={<Button onClick={() => setModalOpen(true)} className="mt-2"><Plus size={16} /> Create account</Button>} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <AnimatePresence>
            {users.map((u) => (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 border-b border-border-soft px-5 py-4 last:border-0 transition-colors duration-200 hover:bg-surface-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-3 font-display text-xs font-semibold text-orange-500">
                  {u.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-text-primary">{u.name}</p>
                    {u.banned && <span className="rounded-full bg-danger/10 px-2 py-0.5 font-mono text-[10px] text-danger">Banned</span>}
                  </div>
                  <p className="truncate text-xs text-text-faint">{u.email}</p>
                </div>
                <span className={`rounded-full px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${
                  u.role === 'admin' ? 'bg-orange-500/10 text-orange-500' : 'bg-surface-2 text-text-faint'
                }`}>
                  {u.role}
                </span>
                <span className="hidden font-mono text-[11px] text-text-faint sm:block">
                  {u.last_active ? `Active ${new Date(u.last_active).toLocaleDateString()}` : 'Never active'}
                </span>
                <button
                  onClick={() => handleRoleToggle(u)}
                  className={`rounded-full px-2 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors duration-200 hover:opacity-80 ${
                    u.role === 'admin' ? 'bg-orange-500/10 text-orange-500' : 'bg-surface-2 text-text-faint'
                  }`}
                  title="Click to toggle role"
                >
                  {u.role}
                </button>
                {u.role !== 'admin' && (
                  <button
                    onClick={() => handleBanToggle(u)}
                    title={u.banned ? 'Unban user' : 'Ban user'}
                    className={`shrink-0 rounded-md p-1.5 transition-all duration-200 active:scale-90 ${
                      u.banned ? 'text-danger hover:bg-danger/10' : 'text-text-faint hover:bg-surface-2 hover:text-orange-500'
                    }`}
                  >
                    {u.banned ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                  </button>
                )}
                {u.role !== 'admin' && u.banned && (
                  <button onClick={() => handleDelete(u.id, u.name)} className="shrink-0 rounded-md p-1.5 text-text-faint transition-all duration-200 hover:bg-danger/10 hover:text-danger active:scale-90">
                    <Trash2 size={14} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

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

          <p className="text-xs text-text-faint">
            This calls the <code className="font-mono text-text-muted">admin-create-user</code> Edge Function —
            see the README to deploy it before this works.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create account'}</Button>
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
