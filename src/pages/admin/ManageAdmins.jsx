import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown,
  Plus,
  Users,
  AlertCircle,
  Trash2,
  ShieldOff,
  ShieldCheck,
  Search,
  CheckCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Eye
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import AdminShell from '../../components/AdminShell'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'

export default function ManageAdmins() {
  const { setSelectedAdminId } = useAuth()
  const navigate = useNavigate()
  const [admins, setAdmins] = useState([])
  const [adminStats, setAdminStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', studio_name: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(null)

  async function load() {
    setLoading(true)
    // Fetch all admins and superadmins
    const { data: adminUsers, error: adminsErr } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'superadmin'])
      .order('created_at', { ascending: false })

    if (adminsErr) {
      console.error('Error fetching admins:', adminsErr)
    }

    const list = adminUsers ?? []
    setAdmins(list)

    // Calculate tenant counts for each admin (their niches & their students)
    const [nichesRes, coursesRes, studentsRes] = await Promise.all([
      supabase.from('niches').select('id, creator_id'),
      supabase.from('courses').select('id, creator_id'),
      supabase.from('profiles').select('id, created_by_admin_id'),
    ])

    const stats = {}
    list.forEach((adm) => {
      const nicheCount = (nichesRes.data ?? []).filter((n) => n.creator_id === adm.id).length
      const courseCount = (coursesRes.data ?? []).filter((c) => c.creator_id === adm.id).length
      const studentCount = (studentsRes.data ?? []).filter((s) => s.created_by_admin_id === adm.id).length

      stats[adm.id] = { nicheCount, courseCount, studentCount }
    })

    setAdminStats(stats)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreateAdmin(e) {
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
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: 'admin',
          }),
        }
      )
      const data = await res.json()
      if (!res.ok || data?.error) {
        setError(data?.error ?? 'Could not create the Creator Admin account.')
        setSaving(false)
        return
      }

      // If studio name provided, save it on the newly created profile
      if (form.studio_name && data?.id) {
        await supabase
          .from('profiles')
          .update({ studio_name: form.studio_name })
          .eq('id', data.id)
      }
    } catch (err) {
      setError(err.message ?? 'Could not create creator admin.')
      setSaving(false)
      return
    }

    setSaving(false)
    setModalOpen(false)
    setForm({ name: '', email: '', password: '', studio_name: '' })
    load()
  }

  async function handleBanToggle(u) {
    if (u.role === 'superadmin') return
    const banning = !u.banned
    setConfirm({
      title: banning ? `Suspend Creator Admin ${u.name}?` : `Reactivate ${u.name}?`,
      message: banning
        ? 'Their admin workspace will be immediately suspended and all their enrolled users will be prevented from accessing the platform.'
        : 'Their admin workspace and student access will be restored.',
      danger: banning,
      confirmLabel: banning ? 'Suspend Admin' : 'Reactivate Admin',
      onConfirm: async () => {
        await supabase.from('profiles').update({ banned: banning }).eq('id', u.id)
        load()
      },
    })
  }

  async function handleDeleteAdmin(u) {
    if (u.role === 'superadmin') return
    setConfirm({
      title: `Delete Creator Admin ${u.name}?`,
      message:
        'This will permanently delete this creator admin. Their created niches, courses, and student accounts will be removed.',
      danger: true,
      confirmLabel: 'Permanently Delete',
      onConfirm: async () => {
        await supabase.from('profiles').delete().eq('id', u.id)
        load()
      },
    })
  }

  const filteredAdmins = admins.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.studio_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminShell
      eyebrow="Superadmin Master Console"
      title="Creator Admin Tenants"
      description="Create and license standalone workspaces for other creators. Each creator admin gets their own private isolated academy."
      actions={
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Creator Admin
        </Button>
      }
    >
      {/* Header Stats Overview */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-muted">Total Creator Tenants</span>
            <Crown size={16} className="text-orange-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-text-primary">
            {admins.filter((a) => a.role === 'admin').length}
          </p>
          <p className="mt-1 text-xs text-text-faint">Licensed creator workspaces</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-muted">Multi-Tenant Isolation</span>
            <CheckCircle size={16} className="text-success" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-success">Active</p>
          <p className="mt-1 text-xs text-text-faint">Zero cross-tenant data leakage</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-muted">Superadmin Control</span>
            <Sparkles size={16} className="text-amber-glow" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-text-primary">Owner Mode</p>
          <p className="mt-1 text-xs text-text-faint">Full administrative oversight</p>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            type="text"
            placeholder="Search creator admins by name, email, or studio…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <Loader label="Loading creator admins" />
      ) : filteredAdmins.length === 0 ? (
        <EmptyState
          icon={Crown}
          title="No creator admins found"
          description="Create your first Creator Admin account to onboard another creator onto the platform."
          action={
            <Button onClick={() => setModalOpen(true)} className="mt-2">
              <Plus size={16} /> New Creator Admin
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <AnimatePresence>
            {filteredAdmins.map((u) => {
              const stats = adminStats[u.id] || { nicheCount: 0, courseCount: 0, studentCount: 0 }
              const isSuper = u.role === 'superadmin'

              return (
                <motion.div
                  key={u.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 border-b border-border-soft px-5 py-4 last:border-0 transition-colors duration-200 hover:bg-surface-2"
                >
                  {/* Admin info & Studio */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold ${
                        isSuper
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-void shadow-md shadow-orange-500/20'
                          : 'bg-surface-3 text-orange-400'
                      }`}
                    >
                      {isSuper ? <Crown size={18} /> : u.name?.[0]?.toUpperCase() ?? 'A'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-text-primary">{u.name}</p>
                        {isSuper && (
                          <span className="rounded-full bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400 border border-amber-400/30">
                            Superadmin (Owner)
                          </span>
                        )}
                        {!isSuper && (
                          <span className="rounded-full bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] text-orange-400 border border-orange-500/20">
                            Creator Admin Tenant
                          </span>
                        )}
                        {u.banned && (
                          <span className="rounded-full bg-danger/10 px-2 py-0.5 font-mono text-[10px] text-danger border border-danger/30">
                            Suspended
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-text-faint">{u.email}</p>
                      {u.studio_name && (
                        <p className="font-mono text-[11px] text-orange-400/90 mt-0.5">
                          Studio: {u.studio_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tenant Workspace Stats */}
                  <div className="flex items-center gap-6 shrink-0 text-center">
                    <div>
                      <p className="font-mono text-xs font-bold text-text-primary">{stats.nicheCount}</p>
                      <p className="text-[10px] text-text-faint">Niches</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold text-text-primary">{stats.courseCount}</p>
                      <p className="text-[10px] text-text-faint">Courses</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold text-text-primary">{stats.studentCount}</p>
                      <p className="text-[10px] text-text-faint">Students</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isSuper && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedAdminId(u.id)
                            navigate('/admin/niches')
                          }}
                          title={`View ${u.name}'s Niches & Workspace`}
                          className="flex items-center gap-1.5 rounded-lg border border-orange-500/25 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-400 transition-all hover:bg-orange-500/20 active:scale-95"
                        >
                          <Eye size={14} />
                          <span>View Niches</span>
                        </button>

                        <button
                          onClick={() => handleBanToggle(u)}
                          title={u.banned ? 'Reactivate admin tenant' : 'Suspend admin tenant'}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            u.banned
                              ? 'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25'
                              : 'bg-surface-2 text-text-muted hover:text-orange-400 hover:bg-surface-3'
                          }`}
                        >
                          {u.banned ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                          <span>{u.banned ? 'Unsuspend' : 'Suspend'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteAdmin(u)}
                          title="Permanently remove admin tenant"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-faint transition-all hover:bg-danger/10 hover:text-danger active:scale-90"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal: Create New Creator Admin */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Creator Admin">
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Creator Full Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Alex Hormozi"
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Studio / Brand Name</label>
            <input
              value={form.studio_name}
              onChange={(e) => setForm({ ...form, studio_name: e.target.value })}
              placeholder="e.g. Nexus Creator Academy"
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Admin Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="creator@brand.com"
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Temporary Password</label>
            <input
              required
              minLength={6}
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Secure password for initial login"
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 text-xs text-text-muted">
            <span className="font-semibold text-orange-400">Multi-tenant Isolation:</span> This creator
            admin will have their own empty dashboard where they can publish their own niches and add
            their own students. They cannot see your niches or any other creator's data.
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
              {saving ? 'Creating Admin…' : 'Create Creator Admin'}
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
