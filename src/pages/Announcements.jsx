import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Megaphone, Pin, FileText, Download, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import PageShell from '../components/PageShell'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'

import { useAuth } from '../context/AuthContext'

export default function Announcements() {
  const { isSuperAdmin, creatorId } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        let query = supabase
          .from('announcements')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })

        if (!isSuperAdmin && creatorId) {
          query = query.eq('creator_id', creatorId)
        }

        const { data, error } = await query

        if (error) {
          console.error('Announcements load error:', error)
        }
        setAnnouncements(data ?? [])
      } catch (err) {
        console.error('Announcements error:', err)
        setAnnouncements([])
      }
      setLoading(false)
    }
    load()
  }, [isSuperAdmin, creatorId])

  return (
    <PageShell
      eyebrow="Community"
      title="Announcements"
      description="Stay updated with official platform announcements, guides, and download resources."
      actions={
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted transition-all duration-200 hover:border-orange-500/40 hover:text-text-primary"
        >
          <ArrowLeft size={14} /> Back to Watch
        </Link>
      }
    >
      {loading ? (
        <Loader label="Loading announcements" />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Check back later for news, updates, and materials from admins."
        />
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {announcements.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-2xl border p-6 transition-all duration-200 ${
                item.is_pinned
                  ? 'border-orange-500/40 bg-orange-500/5 shadow-lg shadow-orange-500/5'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {item.is_pinned && (
                    <span className="flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-orange-400">
                      <Pin size={11} /> Pinned
                    </span>
                  )}
                  <h3 className="font-display text-lg font-semibold text-text-primary">
                    {item.title}
                  </h3>
                </div>
                <span className="font-mono text-xs text-text-faint">
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="whitespace-pre-wrap text-sm text-text-muted leading-relaxed font-sans">
                {item.content}
              </div>

              {item.file_url && (
                <div className="mt-4 pt-4 border-t border-border-soft flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary max-w-sm truncate">
                        {item.file_name || 'Download Attachment'}
                      </p>
                      <p className="text-[10px] font-mono text-text-faint">
                        {item.file_url.endsWith('.pdf') ? 'PDF Document' : 'DOCX Document / Resource'}
                      </p>
                    </div>
                  </div>

                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-3.5 py-1.5 text-xs font-semibold text-void shadow-sm transition-all duration-200 hover:shadow-orange-500/20 active:scale-95"
                  >
                    <Download size={13} />
                    Download File
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
