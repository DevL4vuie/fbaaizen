import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Megaphone, FileText, Pin, ExternalLink, Download } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import AdminShell from '../../components/AdminShell'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import MediaUploader from '../../components/MediaUploader'

const emptyForm = {
  title: '',
  content: '',
  is_pinned: false,
  file_url: '',
  file_name: '',
  file_type: '',
}

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [tableMissing, setTableMissing] = useState(false)

  async function load() {
    setLoading(true)
    setErrorMessage('')
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading announcements:', error)
      if (error.code === '42P01' || error.code === 'PGRST205' || error.code === 'PGRST204' || error.code === '42501'
          || error.message?.includes('relation') || error.message?.includes('does not exist') || error.message?.includes('permission denied')) {
        setTableMissing(true)
      } else {
        setErrorMessage(error.message)
      }
    } else {
      setTableMissing(false)
      setAnnouncements(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setErrorMessage('')
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditingId(item.id)
    setErrorMessage('')
    setForm({
      title: item.title,
      content: item.content,
      is_pinned: !!item.is_pinned,
      file_url: item.file_url ?? '',
      file_name: item.file_name ?? '',
      file_type: item.file_type ?? '',
    })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setErrorMessage('')

    const payload = {
      title: form.title,
      content: form.content,
      is_pinned: form.is_pinned,
      file_url: form.file_url || '',
      file_name: form.file_name || '',
      file_type: form.file_type || '',
      updated_at: new Date().toISOString(),
    }

    let res
    if (editingId) {
      res = await supabase.from('announcements').update(payload).eq('id', editingId)
    } else {
      res = await supabase.from('announcements').insert(payload)
    }

    if (res.error) {
      console.error('Save announcement error:', res.error)
      setErrorMessage(res.error.message || 'Failed to save announcement')
      setSaving(false)
      return
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
    const { error } = await supabase.from('announcements').delete().eq('id', deleteTargetId)
    if (error) {
      console.error('Delete announcement error:', error)
      alert('Delete failed: ' + error.message)
    }
    setDeleteTargetId(null)
    load()
  }

  return (
    <AdminShell
      eyebrow="Admin"
      title="Announcements"
      description="Publish announcements and updates with PDF/DOCX downloads for all platform creators."
      actions={
        <Button onClick={openCreate}>
          <Plus size={16} /> New announcement
        </Button>
      }
    >
      {tableMissing && (
        <div className="mb-6 rounded-2xl border border-dashed border-orange-500/40 bg-orange-500/5 p-5 text-center">
          <Megaphone size={24} className="mx-auto mb-2 text-orange-500" />
          <h3 className="text-sm font-semibold text-text-primary">Database Setup Required</h3>
          <p className="mt-1 text-xs text-text-muted">
            The <span className="font-mono text-orange-400">announcements</span> table does not exist in Supabase yet.
            Please open Supabase Dashboard &gt; SQL Editor and run the script in <span className="font-mono text-orange-400">migration-features.sql</span> to create it.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger font-medium">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <Loader label="Loading announcements" />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements posted yet"
          description="Create your first public post or announcement for users."
          action={
            <Button onClick={openCreate} className="mt-2">
              <Plus size={16} /> New announcement
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {announcements.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`rounded-2xl border p-5 transition-colors ${
                  item.is_pinned
                    ? 'border-orange-500/40 bg-orange-500/5'
                    : 'border-border bg-surface'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.is_pinned && (
                        <span className="flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-orange-400">
                          <Pin size={10} /> Pinned
                        </span>
                      )}
                      <h3 className="font-display text-base font-semibold text-text-primary">
                        {item.title}
                      </h3>
                      <span className="font-mono text-[11px] text-text-faint">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-sm text-text-muted leading-relaxed">
                      {item.content}
                    </p>

                    {item.file_url && (
                      <div className="pt-2">
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="inline-flex items-center gap-2 rounded-xl border border-border-soft bg-surface-2 px-3.5 py-2 text-xs font-medium text-orange-400 transition-colors hover:bg-orange-500/10 hover:border-orange-500/30"
                        >
                          <FileText size={15} className="text-orange-500" />
                          <span className="truncate max-w-xs">{item.file_name || 'Download Attached Document'}</span>
                          <Download size={13} className="ml-1 opacity-70" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded-md p-1.5 text-text-faint transition-all duration-200 hover:bg-surface-2 hover:text-orange-500 active:scale-90"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => requestDelete(item.id)}
                      className="rounded-md p-1.5 text-text-faint transition-all duration-200 hover:bg-danger/10 hover:text-danger active:scale-90"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit announcement' : 'New announcement'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Title / Subject</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Platform update: New courses released!"
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Post Content</label>
            <textarea
              required
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your announcement details or guidelines here..."
              className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary focus:border-orange-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
              className="h-4 w-4 accent-orange-500"
            />
            <Pin size={14} className={form.is_pinned ? "text-orange-500" : "text-text-muted"} />
            Pin this announcement to top of feed
          </label>

          {/* PDF / DOCX Media Uploader */}
          <MediaUploader
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            bucket="documents"
            folder="announcements"
            currentUrl={form.file_url}
            label="Attach File (PDF, DOCX, etc.)"
            onUploadSuccess={(url, meta) => {
              setForm((prev) => ({
                ...prev,
                file_url: url,
                file_name: meta?.name || 'Document',
                file_type: meta?.type || 'application/octet-stream',
              }))
            }}
            onRemove={() => {
              setForm((prev) => ({
                ...prev,
                file_url: '',
                file_name: '',
                file_type: '',
              }))
            }}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Publishing…' : 'Publish post'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete announcement"
        message="Are you sure you want to remove this announcement?"
        confirmLabel="Delete"
        danger
      />
    </AdminShell>
  )
}
