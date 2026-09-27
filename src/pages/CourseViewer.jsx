import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, PlayCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import PageShell from '../components/PageShell'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import TimelineProgress from '../components/TimelineProgress'

export default function CourseViewer() {
  const { id } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [percent, setPercent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [courseRes, progressRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', id).single(),
        supabase.from('progress').select('*').eq('user_id', user.id).eq('course_id', id).maybeSingle(),
      ])
      setCourse(courseRes.data)
      setPercent(progressRes.data?.percent_complete ?? 0)
      setLoading(false)
    }
    load()
  }, [id, user.id])

  async function updateProgress(newPercent) {
    setPercent(newPercent)
    setSaving(true)
    await supabase.from('progress').upsert({
      user_id: user.id,
      course_id: id,
      percent_complete: newPercent,
      last_updated: new Date().toISOString(),
    })
    setSaving(false)
  }

  if (loading) {
    return <PageShell title="Course"><Loader label="Loading course" /></PageShell>
  }

  if (!course) {
    return (
      <PageShell title="Course not found">
        <EmptyState title="This course doesn't exist" description="It may have been removed by an admin." />
      </PageShell>
    )
  }

  const videos = course.video_urls ?? []
  const stepPercent = videos.length ? Math.round(((activeIndex + 1) / videos.length) * 100) : 0

  return (
    <PageShell
      eyebrow="Course"
      title={course.title}
      description={course.description}
      actions={
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted transition-all duration-200 hover:border-orange-500/40 hover:text-text-primary"
        >
          <ArrowLeft size={14} /> Back to Watch
        </Link>
      }
    >
      {videos.length === 0 ? (
        <EmptyState icon={PlayCircle} title="No lessons yet" description="Your admin hasn't added any videos to this course yet." />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden rounded-2xl border border-border bg-black"
            >
              <video controls className="aspect-video w-full" src={videos[activeIndex]} />
            </motion.div>

            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-text-faint">Your progress</p>
                <span className="font-mono text-[11px] text-text-faint">{saving ? 'Saving…' : 'Saved'}</span>
              </div>
              <TimelineProgress percent={percent} />
              <button
                onClick={() => updateProgress(Math.min(100, percent + Math.round(100 / videos.length)))}
                disabled={percent >= 100}
                className="mt-4 flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-void shadow-lg shadow-orange-500/20 transition-all duration-200 hover:shadow-orange-500/40 active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 size={15} />
                {percent >= 100 ? 'Course complete' : 'Mark lesson complete'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-text-faint">Lessons</p>
            {videos.map((url, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-all duration-200 ${
                  activeIndex === i
                    ? 'border-orange-500/40 bg-orange-500/5 text-text-primary'
                    : 'border-border bg-surface text-text-muted hover:border-border hover:bg-surface-2'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] ${
                    activeIndex === i ? 'bg-orange-500 text-void' : 'bg-surface-2 text-text-faint'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="truncate">Lesson {i + 1}</span>
                {activeIndex === i && <PlayCircle size={14} className="ml-auto shrink-0 text-orange-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  )
}
