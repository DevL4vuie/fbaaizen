import { motion } from 'framer-motion'
import { ImageIcon, Video, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NicheCard({ niche, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Link to={`/niche/${niche.id}`} className="group block">
        <div className="flame-border relative overflow-hidden rounded-2xl border border-border p-5 transition-transform duration-300 group-hover:-translate-y-1">
          <div className="mb-4 flex items-start justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">Niche</span>
            <ArrowUpRight
              size={16}
              className="text-text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-orange-500"
            />
          </div>
          {niche.sample_image_url && (
            <div className="mb-3 h-32 w-full overflow-hidden rounded-xl border border-border-soft bg-surface-2">
              <img
                src={niche.sample_image_url}
                alt={niche.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          <h3 className="font-display text-lg font-semibold text-text-primary">{niche.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-text-muted">
            {niche.prompt_text || 'No prompt added yet.'}
          </p>
          <div className="mt-4 flex gap-2">
            {niche.has_image && (
              <span className="flex items-center gap-1 rounded-full border border-border-soft bg-surface-2 px-2 py-1 font-mono text-[10px] text-text-muted">
                <ImageIcon size={11} /> Image
              </span>
            )}
            {niche.has_video && (
              <span className="flex items-center gap-1 rounded-full border border-border-soft bg-surface-2 px-2 py-1 font-mono text-[10px] text-text-muted">
                <Video size={11} /> Video
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
