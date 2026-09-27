import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, FolderCog, GraduationCap, Lightbulb, Clock, Activity, LogIn, Eye, MessageSquarePlus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import AdminShell from '../../components/AdminShell'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import ConfirmModal from '../../components/ConfirmModal'

function StatCard({ icon: Icon, label, value, index, to }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Link
        to={to}
        className="flame-border block rounded-2xl border border-border p-5 transition-colors duration-200 hover:border-orange-500/50 hover:bg-surface-2"
      >
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-orange-500">
          <Icon size={17} />
        </div>
        <p className="font-display text-2xl font-semibold text-text-primary">{value}</p>
        <p className="mt-0.5 text-xs text-text-muted">{label}</p>
      </Link>
    </motion.div>
  )
}

function getActionBadge(action) {
  switch (action) {
    case 'login':
      return { label: 'Login', icon: LogIn, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
    case 'page_view':
    case 'niche_view':
    case 'course_view':
      return { label: 'View', icon: Eye, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' }
    case 'support_message':
      return { label: 'Support', icon: MessageSquarePlus, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
    default:
      return { label: action || 'Action', icon: Activity, color: 'text-text-muted bg-surface-2 border-border-soft' }
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [logsTableMissing, setLogsTableMissing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  async function load() {
    const [users, niches, courses, tips, logsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('niches').select('id', { count: 'exact', head: true }),
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('tips').select('id', { count: 'exact', head: true }),
      supabase
        .from('activity_logs')
        .select('*, profiles(name, email)')
        .order('created_at', { ascending: false })
        .limit(20),
    ])
    setStats({
      userCount: users.data?.length ?? 0,
      nicheCount: niches.count ?? 0,
      courseCount: courses.count ?? 0,
      tipCount: tips.count ?? 0,
    })
    setRecentUsers((users.data ?? []).slice(0, 6))
    if (logsRes.error && logsRes.error.code === 'PGRST205') {
      setLogsTableMissing(true)
    } else {
      setLogsTableMissing(false)
    }
    setActivityLogs(logsRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleClearLogs() {
    setClearing(true)
    try {
      // Deletes all rows in activity_logs (allowed by activity_logs_admin_delete policy)
      const { error } = await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) {
        console.error('Failed to clear activity logs:', error)
      } else {
        setActivityLogs([])
      }
    } catch (err) {
      console.error('Error clearing activity logs:', err)
    } finally {
      setClearing(false)
      setConfirmClearOpen(false)
    }
  }

  if (loading) {
    return <AdminShell eyebrow="Admin" title="Overview"><Loader label="Loading overview" /></AdminShell>
  }

  return (
    <AdminShell
      eyebrow="Admin"
      title="Overview"
      description="A snapshot of your platform's content, active users, and real-time activity."
    >
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Active users" value={stats.userCount} index={0} to="/admin/users" />
        <StatCard icon={FolderCog} label="Niches" value={stats.nicheCount} index={1} to="/admin/niches" />
        <StatCard icon={GraduationCap} label="Courses" value={stats.courseCount} index={2} to="/admin/courses" />
        <StatCard icon={Lightbulb} label="Tips" value={stats.tipCount} index={3} to="/admin/tips-guidelines" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recently Active Users */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Clock size={16} className="text-text-faint" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
              Recently active users
            </h2>
          </div>

          {recentUsers.length === 0 ? (
            <EmptyState icon={Users} title="No users yet" description="Create your first user from the Users page." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              {recentUsers.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 border-b border-border-soft px-5 py-3.5 last:border-0 transition-colors duration-200 hover:bg-surface-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-3 font-display text-xs font-semibold text-orange-500">
                    {u.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{u.name}</p>
                    <p className="truncate text-xs text-text-faint">{u.email}</p>
                  </div>
                  <span className="font-mono text-[10px] text-text-faint">
                    {u.last_active ? new Date(u.last_active).toLocaleDateString() : '—'}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Live User Activity Monitoring */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-orange-500" />
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
                User Activity Monitoring
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {activityLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(true)}
                  disabled={clearing}
                  className="flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] text-text-faint transition-all duration-200 hover:bg-danger/10 hover:text-danger active:scale-95 disabled:opacity-50"
                  title="Clear all activity logs"
                >
                  <Trash2 size={12} />
                  Clear log
                </button>
              )}
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live log
              </span>
            </div>
          </div>

          {logsTableMissing ? (
            <div className="rounded-2xl border border-dashed border-orange-500/40 bg-orange-500/5 p-6 text-center">
              <Activity size={24} className="mx-auto mb-2 text-orange-500" />
              <p className="text-sm font-semibold text-text-primary">Table setup needed</p>
              <p className="mt-1 text-xs text-text-muted">
                Run the script in <span className="font-mono text-orange-400">create-activity-logs.sql</span> in your Supabase SQL Editor to enable real-time user activity monitoring.
              </p>
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-text-faint">
              <Activity size={24} className="mx-auto mb-2 text-text-faint opacity-50" />
              <p className="text-sm font-medium">No activity logged yet</p>
              <p className="mt-1 text-xs text-text-muted">User logins and actions will appear here automatically.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              {activityLogs.map((log, i) => {
                const badge = getActionBadge(log.action)
                const BadgeIcon = badge.icon
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 border-b border-border-soft px-4 py-3 last:border-0 hover:bg-surface-2 transition-colors"
                  >
                    <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium ${badge.color}`}>
                      <BadgeIcon size={10} />
                      {badge.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-text-primary">
                        {log.profiles?.name || log.profiles?.email || 'User'}
                        {log.metadata?.page && (
                          <span className="ml-1 text-text-faint font-normal font-mono">
                            {log.metadata.page}
                          </span>
                        )}
                        {log.metadata?.niche_name && (
                          <span className="ml-1 text-text-faint font-normal">
                            ({log.metadata.niche_name})
                          </span>
                        )}
                      </p>
                      <p className="truncate text-[10px] text-text-faint font-mono">
                        {log.profiles?.email || ''}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-text-faint">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={handleClearLogs}
        title="Clear Activity Logs"
        message="Are you sure you want to clear all user activity logs? This action cannot be undone."
        confirmLabel={clearing ? 'Clearing…' : 'Clear all logs'}
        danger
      />
    </AdminShell>
  )
}
