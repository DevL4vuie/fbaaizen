import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${danger ? 'bg-danger/10 text-danger' : 'bg-orange-500/10 text-orange-500'}`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-text-primary">{title}</h2>
                {message && <p className="mt-0.5 text-sm text-text-muted">{message}</p>}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:border-border hover:bg-surface-2 hover:text-text-primary active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => { onConfirm(); onClose(); }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  danger
                    ? 'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 text-void hover:shadow-lg hover:shadow-orange-500/30'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
