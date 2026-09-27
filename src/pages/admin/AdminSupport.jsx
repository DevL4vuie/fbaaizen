import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Clock, CheckCircle, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import AdminShell from '../../components/AdminShell'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'

export default function AdminSupport() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(name, email)')
      .order('created_at', { ascending: false })
    setMessages(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openReply(m) {
    setSelected(m)
    setReply(m.reply ?? '')
  }

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
    if (selected?.id === id) setSelected(null)
    load()
  }

  async function handleReply(e) {
    e.preventDefault()
    setSaving(true)
    await supabase
      .from('messages')
      .update({ reply, replied_at: new Date().toISOString() })
      .eq('id', selected.id)
    setSaving(false)
    setSelected(null)
    setReply('')
    load()
  }

  const pending = messages.filter((m) => !m.reply)
  const replied = messages.filter((m) => m.reply)

  return (
    <AdminShell
      eyebrow="Admin"
      title="User Requests"
      description="Messages and requests sent by users. Reply to them here."
    >
      {loading ? (
        <Loader label="Loading messages" />
      ) : messages.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No messages yet" description="Users haven't sent any requests yet." />
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Clock size={14} className="text-orange-500" />
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Pending ({pending.length})
                </h2>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {pending.map((m) => <MessageCard key={m.id} m={m} onReply={() => openReply(m)} onDelete={requestDelete} />)}
                </AnimatePresence>
              </div>
            </div>
          )}
          {replied.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle size={14} className="text-green-400" />
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Replied ({replied.length})
                </h2>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {replied.map((m) => <MessageCard key={m.id} m={m} onReply={() => openReply(m)} onDelete={requestDelete} />)}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold">&times;</button>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Reply to request">
        {selected && (
          <form onSubmit={handleReply} className="space-y-4">
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-faint">
                {selected.profiles?.name} · {new Date(selected.created_at).toLocaleDateString()}
              </p>
              <p className="mb-1 font-display text-sm font-semibold text-text-primary">{selected.subject}</p>
              <p className="whitespace-pre-wrap text-sm text-text-muted">{selected.body}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">Your reply</label>
              <textarea
                required
                rows={5}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply…"
                className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => requestDelete(selected.id)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 size={13} /> Delete request
              </button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Sending…' : 'Send reply'} <Send size={14} /></Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete message"
        message="Are you sure you want to delete this message? This will permanently delete it for both you and the user."
        confirmLabel="Delete message"
        danger
      />
    </AdminShell>
  )
}

function MessageCard({ m, onReply, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="rounded-2xl border border-border bg-surface p-5"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm font-semibold text-text-primary">{m.subject}</p>
          <p className="font-mono text-[10px] text-text-faint">{m.profiles?.name} · {m.profiles?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] ${
            m.reply ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-500'
          }`}>
            {m.reply ? <CheckCircle size={10} /> : <Clock size={10} />}
            {m.reply ? 'Replied' : 'Pending'}
          </span>
          <button
            onClick={() => onDelete(m.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-faint transition-all hover:bg-danger/10 hover:text-danger active:scale-90"
            title="Delete message"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="mb-3 line-clamp-2 text-sm text-text-muted">{m.body}</p>
      {m.reply && (
        <div className="mb-3 rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-orange-500">Your reply</p>
          <p className="line-clamp-2 text-sm text-text-primary">{m.reply}</p>
        </div>
      )}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onReply}
          className="flex items-center gap-1.5 font-mono text-xs text-orange-500 transition-colors hover:text-amber-400"
        >
          <Send size={12} /> {m.reply ? 'Edit reply' : 'Reply'}
        </button>
        <p className="font-mono text-[10px] text-text-faint">
          {new Date(m.created_at).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  )
}
