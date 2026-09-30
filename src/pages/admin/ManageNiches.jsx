import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, FolderCog, ImageIcon, Video, UploadCloud, Users, Lightbulb, ScrollText, Check, Lock, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import AdminShell from '../../components/AdminShell'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import MediaUploader from '../../components/MediaUploader'

const emptyForm = {
  name: '',
  has_image: false,
  has_video: false,
  prompt_text: '',
  sample_video_url: '',
  sample_image_url: '',
  file_url: '',
  file_name: '',
  tips_text: '',
  guidelines_text: '',
  is_locked: false,
  price: '',
  access_type: 'all', // 'all' | 'specific'
  selected_user_ids: [],
}

export default function ManageNiches() {
  const { user, isSuperAdmin, selectedAdminId } = useAuth()
  const [niches, setNiches] = useState([])
  const [profiles, setProfiles] = useState([])
  const [nicheAccessMap, setNicheAccessMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const fileRef = useRef()

  async function load() {
    setLoading(true)
    let nicheQuery = supabase.from('niches').select('*').order('created_at', { ascending: false })
    let profileQuery = supabase.from('profiles').select('id, name, email, role, created_by_admin_id').order('name')

    if (!isSuperAdmin) {
      if (user?.id) {
        nicheQuery = nicheQuery.eq('creator_id', user.id)
        profileQuery = profileQuery.eq('created_by_admin_id', user.id)
      }
    } else {
      // Superadmin workspace filter
      if (selectedAdminId === 'mine') {
        nicheQuery = nicheQuery.eq('creator_id', user?.id)
        profileQuery = profileQuery.eq('created_by_admin_id', user?.id)
      } else if (selectedAdminId && selectedAdminId !== 'all') {
        nicheQuery = nicheQuery.eq('creator_id', selectedAdminId)
        profileQuery = profileQuery.eq('created_by_admin_id', selectedAdminId)
      }
    }

    const [nichesRes, profilesRes, accessRes] = await Promise.all([
      nicheQuery,
      profileQuery,
      supabase.from('niche_access').select('*'),
    ])

    const accMap = {}
    if (accessRes.data) {
      accessRes.data.forEach((row) => {
        if (!accMap[row.niche_id]) accMap[row.niche_id] = []
        accMap[row.niche_id].push(row.user_id)
      })
    }

    setNiches(nichesRes.data ?? [])
    setProfiles((profilesRes.data ?? []).filter((p) => p.role !== 'admin' && p.role !== 'superadmin'))
    setNicheAccessMap(accMap)
    setLoading(false)
  }

  useEffect(() => { load() }, [isSuperAdmin, user?.id, selectedAdminId])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setVideoFile(null)
    setModalOpen(true)
  }

  async function openEdit(niche) {
    setEditingId(niche.id)
    setVideoFile(null)

    // Load existing tips, guidelines, and access assignments for this niche
    const [tipsRes, guidelinesRes, accessRes] = await Promise.all([
      supabase.from('tips').select('text').eq('niche_id', niche.id),
      supabase.from('guidelines').select('text').eq('niche_id', niche.id),
      supabase.from('niche_access').select('user_id').eq('niche_id', niche.id),
    ])

    const assignedUsers = (accessRes.data ?? []).map((a) => a.user_id)

    const tipsJoined = (tipsRes.data ?? []).map((t) => t.text).join('\n\n')
    const guidelinesJoined = (guidelinesRes.data ?? []).map((g) => g.text).join('\n\n')

    setForm({
      name: niche.name,
      has_image: niche.has_image,
      has_video: niche.has_video,
      prompt_text: niche.prompt_text ?? '',
      sample_video_url: niche.sample_video_url ?? '',
      sample_image_url: niche.sample_image_url ?? '',
      file_url: niche.file_url ?? '',
      file_name: niche.file_name ?? '',
      tips_text: tipsJoined,
      guidelines_text: guidelinesJoined,
      is_locked: !!niche.is_locked,
      price: niche.price ?? '',
      access_type: assignedUsers.length > 0 ? 'specific' : 'all',
      selected_user_ids: assignedUsers,
    })
    setModalOpen(true)
  }

  function toggleUserSelection(userId) {
    setForm((prev) => {
      const exists = prev.selected_user_ids.includes(userId)
      return {
        ...prev,
        selected_user_ids: exists
          ? prev.selected_user_ids.filter((id) => id !== userId)
          : [...prev.selected_user_ids, userId],
      }
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)

    // Save core niche fields
    let finalForm = {
      name: form.name,
      has_image: form.has_image,
      has_video: form.has_video,
      prompt_text: form.prompt_text,
      sample_video_url: form.sample_video_url || '',
      sample_image_url: form.sample_image_url || '',
      file_url: form.file_url || '',
      file_name: form.file_name || '',
      is_locked: form.is_locked,
      price: form.price || '',
    }

    let targetNicheId = editingId

    if (editingId) {
      await supabase.from('niches').update(finalForm).eq('id', editingId)
    } else {
      const payload = {
        ...finalForm,
        creator_id: user?.id,
      }
      const { data: created, error: createErr } = await supabase.from('niches').insert(payload).select().single()
      if (createErr || !created) {
        console.warn('Insert niche error:', createErr)
        setSaving(false)
        return
      }
      targetNicheId = created.id
    }

    // Save Tips
    if (targetNicheId) {
      await supabase.from('tips').delete().eq('niche_id', targetNicheId)
      const tipsList = form.tips_text
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean)
      if (tipsList.length > 0) {
        await supabase.from('tips').insert(
          tipsList.map((text) => ({ niche_id: targetNicheId, text }))
        )
      }

      // Save Guidelines
      await supabase.from('guidelines').delete().eq('niche_id', targetNicheId)
      const guidelinesList = form.guidelines_text
        .split('\n')
        .map((g) => g.trim())
        .filter(Boolean)
      if (guidelinesList.length > 0) {
        await supabase.from('guidelines').insert(
          guidelinesList.map((text) => ({ niche_id: targetNicheId, text }))
        )
      }

      // Save User Access Control in niche_access table
      try {
        const { error: delErr } = await supabase.from('niche_access').delete().eq('niche_id', targetNicheId)
        if (delErr) console.error('niche_access delete error:', delErr)

        if (form.access_type === 'specific' && form.selected_user_ids.length > 0) {
          const insertRows = form.selected_user_ids.map((uid) => ({
            niche_id: targetNicheId,
            user_id: uid,
          }))
          const { error: accInsertErr } = await supabase.from('niche_access').insert(insertRows)
          if (accInsertErr) console.error('niche_access table insert error:', accInsertErr)
        }
      } catch (err) {
        console.error('niche_access table error:', err)
      }
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
    await supabase.from('niches').delete().eq('id', deleteTargetId)
    setDeleteTargetId(null)
    load()
  }

  return (
    <AdminShell
      eyebrow="Admin"
      title="Manage Niches"
      description="Create niches, add prompts, sample videos, tips & guidelines, and decide exactly which users can see them."
      actions={
        <Button onClick={openCreate}>
          <Plus size={16} /> Add niche
        </Button>
      }
    >
      {loading ? (
        <Loader label="Loading niches" />
      ) : niches.length === 0 ? (
        <EmptyState icon={FolderCog} title="No niches yet" description="Add your first niche to get started." action={<Button onClick={openCreate} className="mt-2"><Plus size={16} /> Add niche</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {niches.map((n) => {
              const assignedCount = nicheAccessMap[n.id]?.length || 0
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border border-border bg-surface p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="font-display text-base font-semibold text-text-primary">{n.name}</h3>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(n)} className="rounded-md p-1.5 text-text-faint transition-all duration-200 hover:bg-surface-2 hover:text-orange-500 active:scale-90">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => requestDelete(n.id)} className="rounded-md p-1.5 text-text-faint transition-all duration-200 hover:bg-danger/10 hover:text-danger active:scale-90">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm text-text-muted">{n.prompt_text || 'No prompt added.'}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-soft flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {n.has_image && <span className="flex items-center gap-1 rounded-full border border-border-soft bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-text-muted"><ImageIcon size={11} /> Image</span>}
                      {n.has_video && <span className="flex items-center gap-1 rounded-full border border-border-soft bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-text-muted"><Video size={11} /> Video</span>}
                      {n.file_url && <span className="flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] text-sky-400"><FileText size={11} /> Doc</span>}
                      {n.is_locked && (
                        <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-500 font-medium">
                          <Lock size={10} /> Locked
                        </span>
                      )}
                      {n.price && (
                        <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-orange-400">
                          {n.price.startsWith('₱') || n.price.startsWith('$') ? n.price : `₱${n.price}`}
                        </span>
                      )}
                    </div>

                    <span className="flex items-center gap-1 text-[11px] font-mono text-text-faint shrink-0">
                      <Users size={12} className={assignedCount > 0 ? 'text-orange-500' : 'text-text-faint'} />
                      {assignedCount > 0 ? `${assignedCount} assigned` : 'All users'}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit niche' : 'Add niche'} maxWidth="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Basic Info */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Niche Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. GEO NICHE, FBA, WHOP, YTA"
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-text-muted">
                <input type="checkbox" checked={form.has_image} onChange={(e) => setForm({ ...form, has_image: e.target.checked })} className="h-4 w-4 accent-orange-500" />
                Include image
              </label>
              <label className="flex items-center gap-2 text-sm text-text-muted">
                <input type="checkbox" checked={form.has_video} onChange={(e) => setForm({ ...form, has_video: e.target.checked })} className="h-4 w-4 accent-orange-500" />
                Include video
              </label>
            </div>

            <div className="space-y-3 rounded-xl border border-border-soft bg-surface-2/40 p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_locked}
                  onChange={(e) => setForm({ ...form, is_locked: e.target.checked })}
                  className="h-4 w-4 accent-orange-500"
                />
                <Lock size={14} className={form.is_locked ? "text-amber-500" : "text-text-muted"} />
                Lock Niche (Requires Unlock)
              </label>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-text-muted">
                  Niche Price (Optional, e.g. 1500 or ₱1,500)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm font-semibold text-text-faint">₱</span>
                  <input
                    value={form.price.replace(/^₱\s?/, '')}
                    onChange={(e) => setForm({ ...form, price: e.target.value ? `₱${e.target.value.replace(/^₱\s?/, '')}` : '' })}
                    placeholder="e.g. 1,500 or Free"
                    className="w-full rounded-lg border border-border bg-surface-2 pl-7 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Prompt */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Generation Prompt (for AI video generation)</label>
            <textarea
              rows={3}
              value={form.prompt_text}
              onChange={(e) => setForm({ ...form, prompt_text: e.target.value })}
              placeholder="Write the generation prompt template for this niche…"
              className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Tips Input */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-muted">
              <Lightbulb size={13} className="text-orange-500" />
              Tips (1 tip per line)
            </label>
            <textarea
              rows={3}
              value={form.tips_text}
              onChange={(e) => setForm({ ...form, tips_text: e.target.value })}
              placeholder="Enter tips for this niche (each line is a tip)..."
              className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Guidelines Input */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-muted">
              <ScrollText size={13} className="text-orange-500" />
              Guidelines (1 guideline per line)
            </label>
            <textarea
              rows={3}
              value={form.guidelines_text}
              onChange={(e) => setForm({ ...form, guidelines_text: e.target.value })}
              placeholder="Enter guidelines or rules for this niche..."
              className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Sample Image */}
          <MediaUploader
            accept="image/*"
            bucket="media"
            folder="niches/images"
            currentUrl={form.sample_image_url}
            label="Sample Reference Image"
            onUploadSuccess={(url) => setForm((prev) => ({ ...prev, sample_image_url: url, has_image: true }))}
            onRemove={() => setForm((prev) => ({ ...prev, sample_image_url: '' }))}
          />

          {/* Sample Video */}
          <MediaUploader
            accept="video/*"
            bucket="videos"
            folder="niches/videos"
            currentUrl={form.sample_video_url}
            label="Sample Video Demo"
            onUploadSuccess={(url) => setForm((prev) => ({ ...prev, sample_video_url: url, has_video: true }))}
            onRemove={() => setForm((prev) => ({ ...prev, sample_video_url: '' }))}
          />

          {/* Niche Resource Document (PDF, DOCX) */}
          <MediaUploader
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            bucket="documents"
            folder="niches/documents"
            currentUrl={form.file_url}
            label="Niche Resource Document (PDF / DOCX)"
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

          {/* User Access Controls */}
          <div className="rounded-xl border border-border-soft bg-surface-2/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users size={15} className="text-orange-500" />
              <label className="text-xs font-semibold text-text-primary">Who can see this Niche?</label>
            </div>

            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 text-xs font-medium text-text-muted cursor-pointer">
                <input
                  type="radio"
                  name="access_type"
                  checked={form.access_type === 'all'}
                  onChange={() => setForm({ ...form, access_type: 'all' })}
                  className="accent-orange-500"
                />
                All Users (Public)
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-text-muted cursor-pointer">
                <input
                  type="radio"
                  name="access_type"
                  checked={form.access_type === 'specific'}
                  onChange={() => setForm({ ...form, access_type: 'specific' })}
                  className="accent-orange-500"
                />
                Specific Users Only
              </label>
            </div>

            {form.access_type === 'specific' && (
              <div className="mt-3 space-y-2">
                <p className="text-[11px] text-text-faint">Select which users are granted access to this niche:</p>
                {profiles.length === 0 ? (
                  <p className="text-xs text-text-faint italic py-2">No regular users created yet. (Create users in Admin &gt; Users)</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-lg border border-border bg-surface p-2">
                    {profiles.map((p) => {
                      const isSelected = form.selected_user_ids.includes(p.id)
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleUserSelection(p.id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-xs ${
                            isSelected ? 'bg-orange-500/15 text-orange-400 font-medium' : 'hover:bg-surface-2 text-text-muted'
                          }`}
                        >
                          <div>
                            <span className="text-text-primary font-medium mr-2">{p.name}</span>
                            <span className="text-text-faint font-mono text-[10px]">({p.email})</span>
                          </div>
                          {isSelected && <Check size={14} className="text-orange-500" />}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save niche'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete niche"
        message="Are you sure you want to delete this niche? This will permanently remove its tips, guidelines, and user assignments."
        confirmLabel="Delete niche"
        danger
      />
    </AdminShell>
  )
}
