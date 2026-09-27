import { motion } from 'framer-motion'
import AdminSidebar from './AdminSidebar'

export default function AdminShell({ eyebrow, title, description, actions, children }) {
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
              {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </motion.main>
      </div>
    </div>
  )
}
