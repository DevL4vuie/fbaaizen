import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, FolderOpen, GraduationCap, Megaphone, Lock, ArrowRight, Download, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { logActivity, ACTIONS } from '../lib/activityLogger'
import PageShell from '../components/PageShell'
import NicheCard from '../components/NicheCard'
import CourseCard from '../components/CourseCard'
import EmptyState from '../components/EmptyState'
import Loader from '../components/Loader'
import Modal from '../components/Modal'
import Button from '../components/Button'

export default function Dashboard() {
  const { user, profile, isAdmin, isSuperAdmin, creatorId } = useAuth()
  const [niches, setNiches] = useState([])
  const [lockedMap, setLockedMap] = useState({})
  const [courses, setCourses] = useState([])
  const [generalTips, setGeneralTips] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedLockedNiche, setSelectedLockedNiche] = useState(null)

  useEffect(() => {
    async function load() {
      let nicheQuery = supabase.from('niches').select('*').order('created_at', { ascending: false })
      let courseQuery = supabase.from('courses').select('*').order('created_at', { ascending: false })
      let tipQuery = supabase.from('tips').select('*').is('niche_id', null).order('created_at', { ascending: false })
      let annQuery = supabase.from('announcements').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(3)

      // If user belongs to a specific creator admin, scope to that creator's content
      if (!isSuperAdmin && creatorId) {
        nicheQuery = nicheQuery.eq('creator_id', creatorId)
        courseQuery = courseQuery.eq('creator_id', creatorId)
        tipQuery = tipQuery.eq('creator_id', creatorId)
        annQuery = annQuery.eq('creator_id', creatorId)
      }

      const [nichesRes, coursesRes, tipsRes, progressRes] = await Promise.all([
        nicheQuery,
        courseQuery,
        tipQuery,
        supabase.from('progress').select('*').eq('user_id', user.id),
      ])

      // Load announcements separately (table may not exist yet)
      let annData = []
      try {
        const annRes = await annQuery
        if (!annRes.error) annData = annRes.data ?? []
      } catch (e) {
        console.warn('Announcements table may not exist:', e)
      }

      const rawNiches = nichesRes.data ?? []

      // Determine lock status for each niche for regular users
      const lockStatus = {}
      if (!isAdmin && user?.id) {
        await Promise.all(
          rawNiches.map(async (n) => {
            const { data: isRestricted } = await supabase.rpc('niche_has_restrictions', { niche_uuid: n.id })
            if (n.is_locked || isRestricted) {
              const { data: hasAccess } = await supabase.rpc('user_has_niche_access', { niche_uuid: n.id, user_uuid: user.id })
              lockStatus[n.id] = !hasAccess
            } else {
              lockStatus[n.id] = false
            }
          })
        )
      } else {
        // Admin sees all unlocked
        rawNiches.forEach((n) => { lockStatus[n.id] = false })
      }

      setNiches(rawNiches)
      setLockedMap(lockStatus)
      setCourses(coursesRes.data ?? [])
      setGeneralTips(tipsRes.data ?? [])
      setAnnouncements(annData)
      const map = {}
      ;(progressRes.data ?? []).forEach((p) => { map[p.course_id] = p.percent_complete })
      setProgressMap(map)
      setLoading(false)

      if (user?.id) {
        logActivity(user.id, ACTIONS.PAGE_VIEW, { page: '/dashboard' })
      }
    }
    load()
  }, [user.id, isAdmin])

  if (loading) {
    return (
      <PageShell eyebrow="Live" title="Watch">
        <Loader label="Loading your content" />
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow="Live"
      title="Watch"
      description="Browse your niches, pick up where you left off, and keep your courses moving."
    >
      {/* Latest Announcement Banner */}
      {announcements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-surface-2 to-amber-500/10 p-5 shadow-lg shadow-orange-500/5"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-orange-500/20 p-2.5 text-orange-500 shrink-0 mt-0.5">
                <Megaphone size={20} />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-orange-400">
                    Latest Announcement
                  </span>
                  <span className="font-mono text-[10px] text-text-faint">
                    {new Date(announcements[0].created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-display text-base font-semibold text-text-primary">
                  {announcements[0].title}
                </h3>
                <p className="line-clamp-2 text-sm text-text-muted">
                  {announcements[0].content}
                </p>
                {announcements[0].file_url && (
                  <div className="pt-1">
                    <a
                      href={announcements[0].file_url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-orange-400 hover:underline"
                    >
                      <FileText size={13} />
                      Download {announcements[0].file_name || 'Attachment'}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <Link
              to="/announcements"
              className="inline-flex items-center gap-1.5 shrink-0 rounded-xl bg-surface border border-border px-3.5 py-2 text-xs font-semibold text-text-primary hover:border-orange-500/40 hover:text-orange-400 transition-colors"
            >
              All announcements <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* General tips strip */}
      {generalTips.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-10 flex items-start gap-3 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4"
        >
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-orange-500" />
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-orange-500">General tip</p>
            <p className="text-sm text-text-muted">{generalTips[0].text}</p>
          </div>
        </motion.div>
      )}

      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-text-faint" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-text-muted">Niches</h2>
          </div>
          <span className="font-mono text-xs text-text-faint">
            {niches.length} total
          </span>
        </div>

        {niches.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No niches yet"
            description="Your admin hasn't added any niches. Check back soon."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {niches.map((n, i) => (
              <NicheCard
                key={n.id}
                niche={n}
                isLocked={lockedMap[n.id]}
                onLockedClick={(niche) => setSelectedLockedNiche(niche)}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <GraduationCap size={16} className="text-text-faint" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-text-muted">Courses</h2>
        </div>
        {courses.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No courses yet"
            description="Courses you're enrolled in will show up here with your progress."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c, i) => (
              <CourseCard key={c.id} course={c} percent={progressMap[c.id] ?? 0} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Unlock Niche Modal Dialog */}
      <Modal
        open={!!selectedLockedNiche}
        onClose={() => setSelectedLockedNiche(null)}
        title="Niche Locked"
        maxWidth="max-w-md"
      >
        {selectedLockedNiche && (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
                <Lock size={32} />
              </div>
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-display text-lg font-bold text-text-primary">
                {selectedLockedNiche.name}
              </h3>
              {selectedLockedNiche.price && (
                <p className="font-mono text-xl font-bold text-orange-400">
                  {selectedLockedNiche.price.startsWith('₱') || selectedLockedNiche.price.startsWith('$') ? selectedLockedNiche.price : `₱${selectedLockedNiche.price}`}
                </p>
              )}
              <p className="text-sm text-text-muted">
                This niche is exclusive and locked. Contact the administrator to enroll or request access.
              </p>
            </div>

            <div className="rounded-xl border border-border-soft bg-surface-2 p-3 text-xs text-text-faint space-y-1">
              <p className="font-medium text-text-primary">How to unlock:</p>
              <p>Send a message via the Support page requesting enrollment in this niche.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedLockedNiche(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Link to="/support" className="flex-1">
                <Button className="w-full">
                  Request Access
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </PageShell>
  )
}
