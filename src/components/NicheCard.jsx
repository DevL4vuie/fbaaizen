import { motion } from 'framer-motion'
import { ImageIcon, Video, ArrowUpRight, Lock, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NicheCard({ niche, isLocked = false, onLockedClick, index = 0 }) {
  const priceDisplay = niche.price
    ? niche.price.startsWith('₱') || niche.price.startsWith('$')
      ? niche.price
      : `₱${niche.price}`
    : null

  const content = (
    <div className={`flame-border relative overflow-hidden rounded-2xl border p-5 transition-transform duration-300 ${isLocked ? 'border-amber-500/20 bg-surface/80 group-hover:border-amber-500/40' : 'border-border bg-surface group-hover:-translate-y-1'}`}>
      {/* Top Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">Niche</span>
          {isLocked && (
            <span className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-500">
              <Lock size={10} /> Locked
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {priceDisplay && (
            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-orange-400">
              {priceDisplay}
            </span>
          )}
          {!isLocked && (
            <ArrowUpRight
              size={16}
              className="text-text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-orange-500"
            />
          )}
        </div>
      </div>

      {niche.sample_image_url && (
        <div className="relative mb-3 h-32 w-full overflow-hidden rounded-xl border border-border-soft bg-surface-2">
          <img
            src={niche.sample_image_url}
            alt={niche.name}
            className={`h-full w-full object-cover transition-transform duration-500 ${isLocked ? 'blur-[2px] opacity-70' : 'group-hover:scale-105'}`}
          />
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-amber-500 shadow-lg">
                <Lock size={18} />
              </div>
            </div>
          )}
        </div>
      )}

      <h3 className="font-display text-lg font-semibold text-text-primary flex items-center justify-between">
        <span>{niche.name}</span>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-text-muted">
        {niche.prompt_text || 'No prompt added yet.'}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
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
          {niche.file_url && (
            <span className="flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 font-mono text-[10px] text-sky-400">
              <FileText size={11} /> Doc
            </span>
          )}
        </div>

        {isLocked && (
          <span className="font-mono text-[11px] font-medium text-amber-500 hover:underline">
            Unlock Niche &rarr;
          </span>
        )}
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
    >
      {isLocked ? (
        <div
          onClick={() => onLockedClick && onLockedClick(niche)}
          className="group block cursor-pointer"
        >
          {content}
        </div>
      ) : (
        <Link to={`/niche/${niche.id}`} className="group block">
          {content}
        </Link>
      )}
    </motion.div>
  )
}
