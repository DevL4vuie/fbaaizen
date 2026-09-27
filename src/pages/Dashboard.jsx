import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, FolderOpen, GraduationCap } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { logActivity, ACTIONS } from '../lib/activityLogger'
import PageShell from '../components/PageShell'
import NicheCard from '../components/NicheCard'
import CourseCard from '../components/CourseCard'
import EmptyState from '../components/EmptyState'
import Loader from '../components/Loader'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [niches, setNiches] = useState([])
  const [courses, setCourses] = useState([])
  const [generalTips, setGeneralTips] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // RLS policies on the niches table handle access filtering at the DB level.
      // Non-admin users only receive niches they are allowed to see.
      const [nichesRes, coursesRes, tipsRes, progressRes] = await Promise.all([
        supabase.from('niches').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        supabase.from('tips').select('*').is('niche_id', null).order('created_at', { ascending: false }),
        supabase.from('progress').select('*').eq('user_id', user.id),
      ])

      const rawNiches = nichesRes.data ?? []

      // If user is Admin, they see ALL niches.
      // If user is regular User, filter out niches they are not assigned to.
      let visibleNiches = rawNiches
      if (!isAdmin && user?.id) {
        const checked = await Promise.all(
          rawNiches.map(async (n) => {
            const { data: isRestricted } = await supabase.rpc('niche_has_restrictions', { niche_uuid: n.id })
            if (!isRestricted) return n // public niche -> everyone sees it
            const { data: hasAccess } = await supabase.rpc('user_has_niche_access', { niche_uuid: n.id, user_uuid: user.id })
            return hasAccess ? n : null // only assigned user sees it
          })
        )
        visibleNiches = checked.filter(Boolean)
      }

      setNiches(visibleNiches)
      setCourses(coursesRes.data ?? [])
      setGeneralTips(tipsRes.data ?? [])
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
        <div className="mb-4 flex items-center gap-2">
          <FolderOpen size={16} className="text-text-faint" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-text-muted">Niches</h2>
        </div>
        {niches.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No niches yet"
            description="Your admin hasn't added any niches. Check back soon."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {niches.map((n, i) => <NicheCard key={n.id} niche={n} index={i} />)}
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
    </PageShell>
  )
}
