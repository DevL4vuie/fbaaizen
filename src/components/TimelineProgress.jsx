import { motion } from 'framer-motion'

// Signature element: a video-timeline-style progress scrubber, tying the
// UI back to the video-editing world this platform serves.
export default function TimelineProgress({ percent = 0, showLabel = true }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="w-full">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-3">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-glow"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-void bg-amber-glow shadow-[0_0_8px_rgba(255,179,71,0.8)]"
          initial={{ left: 0 }}
          animate={{ left: `calc(${clamped}% - 7px)` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-text-faint">
          <span>00:00</span>
          <span className="text-amber-glow">{clamped}% complete</span>
        </div>
      )}
    </div>
  )
}
