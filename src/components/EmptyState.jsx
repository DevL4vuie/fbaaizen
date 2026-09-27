import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center"
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-orange-500">
          <Icon size={20} />
        </div>
      )}
      <p className="font-display text-base font-semibold text-text-primary">{title}</p>
      {description && <p className="max-w-sm text-sm text-text-muted">{description}</p>}
      {action}
    </motion.div>
  )
}
