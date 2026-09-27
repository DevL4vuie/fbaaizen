import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, GraduationCap, X, UploadCloud } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import AdminShell from '../../components/AdminShell'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import MediaUploader from '../../components/MediaUploader'

const emptyForm = { title: '', description: '', niche_id: '', video_urls: [''] }

export default function ManageCourses() {
  const [courses, setCourses] = useState([])
  const [niches, setNiches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [videoFiles, setVideoFiles] = useState([null])
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const fileRefs = useRef([])

  async function load() {
    setLoading(true)
    const [c, n] = await Promise.all([
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
      supabase.from('niches').select('id,name').order('name'),
    ])
    setCourses(c.data ?? [])
    setNiches(n.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setVideoFiles([null])
    setModalOpen(true)
  }

  function openEdit(course) {
    setEditingId(course.id)
    setForm({
      title: course.title,
      description: course.description ?? '',
      niche_id: course.niche_id ?? '',
      video_urls: course.video_urls?.length ? course.video_urls : [''],
    })
    setVideoFiles((course.video_urls?.length ? course.video_urls : ['']).map(() => null))
    setModalOpen(true)
  }

  function updateVideoUrl(i, value) {
    const next = [...form.video_urls]
    next[i] = value
    setForm({ ...form, video_urls: next })
  }

  function addVideoField() {
    setForm({ ...form, video_urls: [...form.video_urls, ''] })
    setVideoFiles([...videoFiles, null])
  }

  function removeVideoField(i) {
    setForm({ ...form, video_urls: form.video_urls.filter((_, idx) => idx !== i) })
    setVideoFiles(videoFiles.filter((_, idx) => idx !== i))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      title: form.title,
      description: form.description,
      niche_id: form.niche_id || null,
      video_urls: form.video_urls.filter((u) => u && u.trim() !== ''),
    }
    if (editingId) {
      await supabase.from('courses').update(payload).eq('id', editingId)
    } else {
      await supabase.from('courses').insert(payload)
    }
    setSaving(false)
    setModalOpen(false)
    load()
  }

  function requestDelete(id) {
    setDeleteTargetId(id)
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    await supabase.from('courses').delete().eq('id', deleteTargetId)
    setDeleteTargetId(null)
    load()
  }

  function nicheName(id) {
    if (!id) return null
    return niches.find((n) => n.id === id)?.name
  }

  return (
    <AdminShell
      eyebrow="Admin"
      title="Manage Courses"
      description="Courses are made of ordered lesson videos. Optionally tie a course to a niche."
      actions={<Button onClick={openCreate}><Plus size={16} /> Add course</Button>}
    >
      {loading ? (
        <Loader label="Loading courses" />
      ) : courses.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No courses yet" description="Add your first course to get started." action={<Button onClick={openCreate} className="mt-2"><Plus size={16} /> Add course</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {courses.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-display text-base font-semibold text-text-primary">{c.title}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="rounded-md p-1.5 text-text-faint transition-all duration-200 hover:bg-surface-2 hover:text-orange-500 active:scale-90">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => requestDelete(c.id)} className="rounded-md p-1.5 text-text-faint transition-all duration-200 hover:bg-danger/10 hover:text-danger active:scale-90">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="mb-3 line-clamp-2 text-sm text-text-muted">{c.description || 'No description.'}</p>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-border-soft bg-surface-2 px-2 py-1 font-mono text-[10px] text-text-muted">
                    {(c.video_urls?.length ?? 0)} lesson{(c.video_urls?.length ?? 0) === 1 ? '' : 's'}
                  </span>
                  {nicheName(c.niche_id) && (
                    <span className="rounded-full border border-orange-500/30 bg-orange-500/5 px-2 py-1 font-mono text-[10px] text-orange-500">
                      {nicheName(c.niche_id)}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit course' : 'Add course'}>
        <form onSubmit={handleSave} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Linked niche (optional)</label>
            <select
              value={form.niche_id}
              onChange={(e) => setForm({ ...form, niche_id: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary focus:border-orange-500 focus:outline-none"
            >
              <option value="">None</option>
              {niches.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-text-muted">Lesson videos (in order)</label>
            <div className="space-y-4">
              {form.video_urls.map((url, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface-2/40 p-3 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold text-orange-500">Lesson {i + 1}</span>
                    {form.video_urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVideoField(i)}
                        className="rounded-md p-1 text-text-faint hover:bg-danger/10 hover:text-danger transition-colors"
                        title="Remove lesson"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <MediaUploader
                    accept="video/*"
                    bucket="videos"
                    folder="courses/lessons"
                    currentUrl={url}
                    label={`Video for Lesson ${i + 1}`}
                    onUploadSuccess={(uploadedUrl) => updateVideoUrl(i, uploadedUrl)}
                    onRemove={() => updateVideoUrl(i, '')}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addVideoField}
              className="mt-3 flex items-center gap-1.5 font-mono text-xs text-orange-500 hover:text-amber-glow transition-colors"
            >
              <Plus size={13} /> Add another lesson
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save course'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete course"
        message="Are you sure you want to delete this course? Progress records for it will also be removed."
        confirmLabel="Delete course"
        danger
      />
    </AdminShell>
  )
}
