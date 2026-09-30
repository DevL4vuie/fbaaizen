import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import { useAuth } from '../context/AuthContext'

export default function AdminShell({ eyebrow, title, description, actions, children }) {
  const { isSuperAdmin, selectedAdminId, setSelectedAdminId, adminList } = useAuth()
  return (
    <div className="flex min-h-screen flex-col bg-void lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10"
        >
          {(title || actions) && (
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 lg:mb-8">
              <div>
                {eyebrow && (
                  <p className="mb-1.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-orange-500">
                    <span className="pulse-dot" />
                    {eyebrow}
                  </p>
                )}
                {title && <h1 className="font-display text-xl font-semibold text-text-primary sm:text-2xl">{title}</h1>}
                {description && <p className="mt-1.5 max-w-xl text-sm text-text-muted">{description}</p>}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                {isSuperAdmin && adminList.length > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-surface-2/80 px-3 py-1.5 shadow-sm">
                    <Crown size={14} className="text-orange-400 shrink-0" />
                    <span className="font-mono text-xs text-text-faint whitespace-nowrap">Viewing:</span>
                    <select
                      value={selectedAdminId}
                      onChange={(e) => setSelectedAdminId(e.target.value)}
                      className="cursor-pointer bg-transparent text-xs font-semibold text-orange-400 focus:outline-none"
                    >
                      <option value="all" className="bg-surface text-text-primary">
                        🌍 All Workspaces (Global)
                      </option>
                      <option value="mine" className="bg-surface text-text-primary">
                        👑 Superadmin Only (My Content)
                      </option>
                      <optgroup label="Creator Admin Tenants" className="bg-surface text-text-muted">
                        {adminList
                          .filter((adm) => adm.role === 'admin')
                          .map((adm) => (
                            <option key={adm.id} value={adm.id} className="bg-surface text-text-primary">
                              👤 {adm.name} {adm.studio_name ? `(${adm.studio_name})` : ''}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>
                )}
                {actions}
              </div>
            </div>
          )}
          {children}
        </motion.main>
      </div>
    </div>
  )
}
