import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquarePlus, Send, Clock, CheckCircle, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import PageShell from '../components/PageShell'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'

export default function Support() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ subject: '', body: '' })
  const [saving, setSaving] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setMessages(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function requestDelete(id) {
    setDeleteTargetId(id)
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    const id = deleteTargetId
    const { error } = await supabase.from('messages').delete().eq('id', id)
    if (error) {
      console.error('Delete message error:', error)
      setErrorMsg('Could not delete message: ' + error.message)
      return
    }
    load()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('messages').insert({ ...form, user_id: user.id })
    setSaving(false)
    setModalOpen(false)
    setForm({ subject: '', body: '' })
    load()
  }

  return (
    <PageShell
      eyebrow="Support"
      title="Chat Support"
      description="Send a message or request to the admin. You'll see their reply here."
      actions={
        <Button onClick={() => setModalOpen(true)}>
          <MessageSquarePlus size={16} /> New request
        </Button>
      }
    >
      {loading ? (
        <Loader label="Loading messages" />
      ) : messages.length === 0 ? (
        <EmptyState
          icon={MessageSquarePlus}
          title="No messages yet"
          description="Send your first message or request to the admin."
          action={<Button onClick={() => setModalOpen(true)} className="mt-2"><MessageSquarePlus size={16} /> New request</Button>}
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="font-display text-sm font-semibold text-text-primary">{m.subject}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] ${
                      m.reply ? 'bg-green-500/10 text-green-400' : 'bg-surface-2 text-text-faint'
                    }`}>
                      {m.reply ? <CheckCircle size={10} /> : <Clock size={10} />}
                      {m.reply ? 'Replied' : 'Pending'}
                    </span>
                    <button
                      onClick={() => requestDelete(m.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-text-faint transition-all hover:bg-danger/10 hover:text-danger active:scale-90"
                      title="Delete message"
                      aria-label="Delete message"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p className="mb-3 whitespace-pre-wrap text-sm text-text-muted">{m.body}</p>
                {m.reply && (
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-orange-500">Admin reply</p>
                    <p className="whitespace-pre-wrap text-sm text-text-primary">{m.reply}</p>
                  </div>
                )}
                <p className="mt-2 font-mono text-[10px] text-text-faint">
                  {new Date(m.created_at).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold">&times;</button>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New request">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Subject</label>
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Prompt enhancement request"
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Message</label>
            <textarea
              required
              rows={5}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Describe your request or concern…"
              className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Sending…' : 'Send'} <Send size={14} /></Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete message"
        message="Are you sure you want to delete this message? This cannot be undone."
        confirmLabel="Delete message"
        danger
      />
    </PageShell>
  )
}
