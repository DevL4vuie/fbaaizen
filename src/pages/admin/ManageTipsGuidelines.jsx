import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Lightbulb, ScrollText, FileText, Download } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import AdminShell from '../../components/AdminShell'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import MediaUploader from '../../components/MediaUploader'

export default function ManageTipsGuidelines() {
  const [tab, setTab] = useState('tips') // 'tips' | 'guidelines'
  const [niches, setNiches] = useState([])
  const [tips, setTips] = useState([])
  const [guidelines, setGuidelines] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ niche_id: '', title: '', text: '', file_url: '', file_name: '' })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null) // { table, id }

  async function load() {
    setLoading(true)
    const [n, t, g] = await Promise.all([
      supabase.from('niches').select('id,name').order('name'),
      supabase.from('tips').select('*').order('created_at', { ascending: false }),
      supabase.from('guidelines').select('*').order('created_at', { ascending: false }),
    ])
    setNiches(n.data ?? [])
    setTips(t.data ?? [])
    setGuidelines(g.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm({ niche_id: '', title: '', text: '', file_url: '', file_name: '' })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const table = tab === 'tips' ? 'tips' : 'guidelines'
    const payload = tab === 'guidelines'
      ? {
          title: form.title,
          text: form.text,
          niche_id: form.niche_id || null,
          file_url: form.file_url || '',
          file_name: form.file_name || '',
        }
      : {
          text: form.text,
          niche_id: form.niche_id || null,
          file_url: form.file_url || '',
          file_name: form.file_name || '',
        }
    await supabase.from(table).insert(payload)
    setSaving(false)
    setModalOpen(false)
    load()
  }

  function requestDelete(table, id) {
    setDeleteTarget({ table, id })
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    const { table, id } = deleteTarget
    await supabase.from(table).delete().eq('id', id)
    setDeleteTarget(null)
    load()
  }

  function nicheName(id) {
    if (!id) return 'General'
    return niches.find((n) => n.id === id)?.name ?? 'Unknown niche'
  }

  const activeList = tab === 'tips' ? tips : guidelines
  const activeTable = tab === 'tips' ? 'tips' : 'guidelines'

  return (
    <AdminShell
      eyebrow="Admin"
      title="Tips & Guidelines"
      description="General tips show on every user's dashboard. Niche-specific ones show on that niche's page."
      actions={
        <Button onClick={openCreate}>
          <Plus size={16} /> Add {tab === 'tips' ? 'tip' : 'guideline'}
        </Button>
      }
    >
      <div className="mb-6 inline-flex rounded-lg border border-border bg-surface p-1">
        {[{ key: 'tips', label: 'Tips', icon: Lightbulb }, { key: 'guidelines', label: 'Guidelines', icon: ScrollText }].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              tab === key ? 'text-void' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab === key && (
              <motion.span
                layoutId="tab-active"
                className="absolute inset-0 rounded-md bg-gradient-to-r from-orange-500 to-orange-600"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Icon size={14} className="relative z-10" />
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <Loader label="Loading" />
      ) : activeList.length === 0 ? (
        <EmptyState
          icon={tab === 'tips' ? Lightbulb : ScrollText}
          title={`No ${tab} yet`}
          description={`Add your first ${tab === 'tips' ? 'tip' : 'guideline'} to get started.`}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {activeList.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border-soft bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-text-faint">
                      {nicheName(item.niche_id)}
                    </span>
                    {item.file_url && (
                      <span className="flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] text-sky-400">
                        <FileText size={10} /> {item.file_name || 'Attached Doc'}
                      </span>
                    )}
                  </div>
                  {item.title && <p className="mb-0.5 text-sm font-semibold text-text-primary">{item.title}</p>}
                  <p className="whitespace-pre-wrap text-sm text-text-muted">{item.text}</p>
                  {item.file_url && (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-surface-2 px-2.5 py-1 text-xs font-mono text-orange-400 hover:underline"
                    >
                      <Download size={12} /> Download file
                    </a>
                  )}
                </div>
                <button
                  onClick={() => requestDelete(activeTable, item.id)}
                  className="shrink-0 rounded-md p-1.5 text-text-faint transition-all duration-200 hover:bg-danger/10 hover:text-danger active:scale-90"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Add ${tab === 'tips' ? 'tip' : 'guideline'}`}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Applies to</label>
            <select
              value={form.niche_id}
              onChange={(e) => setForm({ ...form, niche_id: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary focus:border-orange-500 focus:outline-none"
            >
              <option value="">General (all users)</option>
              {niches.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
          {tab === 'guidelines' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Posting Schedule"
                className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Text</label>
            <textarea
              required
              rows={4}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="Write freely — links will render as plain text automatically."
              className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Attached Document */}
          <MediaUploader
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            bucket="documents"
            folder="resources"
            currentUrl={form.file_url}
            label={`Attach Reference File (${tab === 'tips' ? 'Tip' : 'Guideline'} PDF / DOCX)`}
            onUploadSuccess={(url, meta) => {
              setForm((prev) => ({
                ...prev,
                file_url: url,
                file_name: meta?.name || 'Document',
              }))
            }}
            onRemove={() => {
              setForm((prev) => ({
                ...prev,
                file_url: '',
                file_name: '',
              }))
            }}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.table === 'tips' ? 'tip' : 'guideline'}`}
        message="Are you sure you want to delete this entry? This cannot be undone."
        confirmLabel="Delete entry"
        danger
      />
    </AdminShell>
  )
}
