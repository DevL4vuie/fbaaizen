import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'
import TimelineProgress from './TimelineProgress'

export default function CourseCard({ course, percent = 0, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Link to={`/course/${course.id}`} className="group block">
        <div className="flame-border rounded-2xl border border-border p-5 transition-transform duration-300 group-hover:-translate-y-1">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-orange-500 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-void">
              <PlayCircle size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-display text-base font-semibold text-text-primary">{course.title}</h3>
              <p className="truncate text-xs text-text-muted">{course.description || 'No description yet.'}</p>
            </div>
          </div>
          <TimelineProgress percent={percent} />
        </div>
      </Link>
    </motion.div>
  )
}
