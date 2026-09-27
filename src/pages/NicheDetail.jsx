import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Lightbulb, ScrollText, Copy, Check, PlayCircle, ImageIcon } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import PageShell from '../components/PageShell'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import LinkSafeText from '../components/LinkSafeText'
import { useAuth } from '../context/AuthContext'

export default function NicheDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const [niche, setNiche] = useState(null)
  const [tips, setTips] = useState([])
  const [guidelines, setGuidelines] = useState([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    async function load() {
      // RLS policy on niches table handles access control at DB level.
      // If user doesn't have access, the query returns no data.
      const [nicheRes, tipsRes, guidelinesRes] = await Promise.all([
        supabase.from('niches').select('*').eq('id', id).single(),
        supabase.from('tips').select('*').eq('niche_id', id).order('created_at', { ascending: false }),
        supabase.from('guidelines').select('*').eq('niche_id', id).order('created_at', { ascending: false }),
      ])

      const currentNiche = nicheRes.data

      // Check access permission for regular users
      if (!isAdmin && user?.id && id) {
        const { data: isRestricted } = await supabase.rpc('niche_has_restrictions', { niche_uuid: id })
        if (isRestricted) {
          const { data: hasAccess } = await supabase.rpc('user_has_niche_access', { niche_uuid: id, user_uuid: user.id })
          if (!hasAccess) {
            setUnauthorized(true)
            setLoading(false)
            return
          }
        }
      }

      // If no data returned and user is not admin, they likely don't have access
      if (!currentNiche && !isAdmin) {
        setUnauthorized(true)
        setLoading(false)
        return
      }

      setNiche(currentNiche)
      setTips(tipsRes.data ?? [])
      setGuidelines(guidelinesRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [id, user, isAdmin])

  function copyPrompt() {
    if (!niche?.prompt_text) return
    navigator.clipboard.writeText(niche.prompt_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (loading) {
    return (
      <PageShell title="Niche">
        <Loader label="Loading niche" />
      </PageShell>
    )
  }

  if (unauthorized) {
    return (
      <PageShell title="Access Denied">
        <EmptyState
          title="Access Restricted"
          description="You do not have permission to view this niche. Please contact an admin to request access."
          action={
            <Link
              to="/dashboard"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted hover:text-text-primary"
            >
              <ArrowLeft size={14} /> Back to Watch
            </Link>
          }
        />
      </PageShell>
    )
  }

  if (!niche) {
    return (
      <PageShell title="Niche not found">
        <EmptyState title="This niche doesn't exist" description="It may have been removed by an admin." />
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow="Niche"
      title={niche.name}
      actions={
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted transition-all duration-200 hover:border-orange-500/40 hover:text-text-primary"
        >
          <ArrowLeft size={14} /> Back to Watch
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          {/* Sample Image (if present) */}
          {niche.sample_image_url && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-3 flex items-center gap-2">
                <ImageIcon size={16} className="text-orange-500" />
                <h2 className="font-display text-sm font-semibold text-text-primary">Reference Image</h2>
              </div>
              <div className="flex justify-center bg-black/20 rounded-xl overflow-hidden p-2 border border-border-soft">
                <img
                  src={niche.sample_image_url}
                  alt={niche.name}
                  className="max-h-96 rounded-lg object-contain"
                />
              </div>
            </motion.div>
          )}

          {/* Sample video */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <PlayCircle size={16} className="text-orange-500" />
              <h2 className="font-display text-sm font-semibold text-text-primary">Sample video</h2>
            </div>
            {niche.sample_video_url ? (
              <video controls className="w-full rounded-lg border border-border-soft bg-black" src={niche.sample_video_url} />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-text-faint">
                No sample video added yet
              </div>
            )}
          </motion.div>

          {/* Prompt */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText size={16} className="text-orange-500" />
                <h2 className="font-display text-sm font-semibold text-text-primary">Generation prompt</h2>
              </div>
              <button
                onClick={copyPrompt}
                className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 font-mono text-[11px] text-text-muted transition-all duration-200 hover:border-orange-500/40 hover:text-text-primary active:scale-95"
              >
                {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="rounded-lg border border-border-soft bg-surface-2 p-4 font-mono text-sm leading-relaxed text-text-muted">
              <LinkSafeText text={niche.prompt_text || 'No prompt has been added for this niche yet.'} />
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Tips */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb size={16} className="text-orange-500" />
              <h2 className="font-display text-sm font-semibold text-text-primary">Tips</h2>
            </div>
            {tips.length === 0 ? (
              <p className="text-sm text-text-faint">No tips added for this niche yet.</p>
            ) : (
              <ul className="space-y-3">
                {tips.map((tip) => (
                  <li key={tip.id} className="rounded-lg border border-border-soft bg-surface-2 p-3 text-sm text-text-muted">
                    <LinkSafeText text={tip.text} />
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Guidelines */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <ScrollText size={16} className="text-orange-500" />
              <h2 className="font-display text-sm font-semibold text-text-primary">Guidelines</h2>
            </div>
            {guidelines.length === 0 ? (
              <p className="text-sm text-text-faint">No guidelines added for this niche yet.</p>
            ) : (
              <ul className="space-y-3">
                {guidelines.map((g) => (
                  <li key={g.id} className="whitespace-pre-wrap rounded-lg border border-border-soft bg-surface-2 p-3 text-sm text-text-muted">
                    <LinkSafeText text={g.text} />
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>
    </PageShell>
  )
}
