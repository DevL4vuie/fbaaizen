import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-void shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40',
  ghost: 'bg-transparent text-text-muted hover:text-text-primary hover:bg-surface-2 border border-border',
  danger: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
}

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
