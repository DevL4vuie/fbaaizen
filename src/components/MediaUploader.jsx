import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  FileImage,
  FileText,
  X,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

/**
 * Modern Media Uploader Component
 *
 * @param {string} accept - e.g. "image/*", "video/*", or "image/*,video/*"
 * @param {string} bucket - Supabase storage bucket name ('media' or 'videos')
 * @param {string} folder - subfolder path inside bucket, e.g. 'niches' or 'courses'
 * @param {string} currentUrl - existing public URL if any
 * @param {Function} onUploadSuccess - callback with publicUrl and file metadata
 * @param {Function} onRemove - callback when media is cleared
 * @param {string} label - custom label
 */
export default function MediaUploader({
  accept = 'image/*',
  bucket = 'media',
  folder = 'uploads',
  currentUrl = '',
  onUploadSuccess,
  onRemove,
  label = 'Upload file',
}) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(currentUrl || '')
  const [status, setStatus] = useState(currentUrl ? 'idle' : 'empty') // 'empty' | 'idle' | 'uploading' | 'success' | 'error'
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const isVideo = accept.includes('video')
  const isImage = accept.includes('image')
  const isDoc = accept.includes('pdf') || accept.includes('doc') || accept.includes('word') || bucket === 'documents'

  function handleFileSelect(selectedFile) {
    if (!selectedFile) return

    setFile(selectedFile)
    setStatus('empty')
    setErrorMessage('')

    // Create local object URL for instant preview
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)

    // Trigger upload automatically
    uploadFile(selectedFile)
  }

  async function uploadFile(targetFile) {
    const uploadTarget = targetFile || file
    if (!uploadTarget) return

    setStatus('uploading')
    setProgress(20)
    setErrorMessage('')

    try {
      const ext = uploadTarget.name.split('.').pop()
      const cleanFileName = uploadTarget.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase()
      const path = `${folder}/${Date.now()}_${cleanFileName}`

      setProgress(45)

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, uploadTarget, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) {
        throw error
      }

      setProgress(85)

      // Retrieve public URL
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
      const publicUrl = urlData?.publicUrl || ''

      setProgress(100)
      setStatus('success')
      setPreview(publicUrl)

      if (onUploadSuccess) {
        onUploadSuccess(publicUrl, {
          path,
          name: uploadTarget.name,
          size: uploadTarget.size,
          type: uploadTarget.type,
        })
      }
    } catch (err) {
      console.error('Upload failed:', err)
      setStatus('error')
      let userFriendlyError = err.message || 'Upload failed'
      if (userFriendlyError.includes('Bucket not found') || userFriendlyError.includes('bucket')) {
        userFriendlyError = `Storage bucket "${bucket}" not found. Please create a public bucket named "${bucket}" in Supabase Storage or run setup-storage.sql.`
      }
      setErrorMessage(userFriendlyError)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  function handleRemove() {
    setFile(null)
    setPreview('')
    setStatus('empty')
    setErrorMessage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (onRemove) onRemove()
  }

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
            {isVideo ? <FileVideo size={13} className="text-orange-500" /> : isDoc ? <FileText size={13} className="text-orange-500" /> : <FileImage size={13} className="text-orange-500" />}
            {label}
          </label>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-[11px] font-mono text-danger hover:underline flex items-center gap-1"
            >
              <X size={11} /> Remove
            </button>
          )}
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (status !== 'uploading') fileInputRef.current?.click()
        }}
        className={`relative flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 ${
          dragOver
            ? 'border-orange-500 bg-orange-500/10'
            : status === 'error'
            ? 'border-danger/60 bg-danger/5'
            : status === 'success'
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-border bg-surface-2/60 hover:border-orange-500/60 hover:bg-surface-2'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />

        {/* Uploading State */}
        {status === 'uploading' && (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 size={24} className="animate-spin text-orange-500" />
            <p className="text-xs font-medium text-text-primary">Uploading {file?.name}…</p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-3">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="font-mono text-[10px] text-text-faint">{progress}%</span>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-2 py-1 w-full">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 size={18} />
              <span className="text-xs font-semibold">Upload Successful!</span>
            </div>
            <p className="max-w-xs truncate font-mono text-[11px] text-text-muted">
              {file?.name || 'File stored on Supabase'}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-text-faint hover:text-orange-500 transition-colors">
                Click to replace
              </span>
              {preview && (
                <a
                  href={preview}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 font-mono text-[11px] text-orange-500 hover:underline"
                >
                  <ExternalLink size={11} /> View URL
                </a>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex items-center gap-1.5 text-danger">
              <AlertCircle size={18} />
              <span className="text-xs font-semibold">Upload Failed</span>
            </div>
            <p className="max-w-sm text-center text-xs text-text-muted">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                uploadFile()
              }}
              className="mt-1 flex items-center gap-1 rounded-md bg-danger/10 px-3 py-1 text-xs font-medium text-danger hover:bg-danger/20 transition-colors"
            >
              <RefreshCw size={12} /> Retry upload
            </button>
          </div>
        )}

        {/* Idle / Empty State */}
        {(status === 'empty' || status === 'idle') && (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <div className="rounded-full bg-surface-3 p-2.5 text-orange-500">
              <UploadCloud size={20} />
            </div>
            <p className="text-xs font-medium text-text-primary">
              <span className="text-orange-500 underline underline-offset-2">Click to browse</span> or drag and drop
            </p>
            <p className="font-mono text-[10px] text-text-faint">
              {isVideo ? 'MP4, WebM, MOV (video)' : isDoc ? 'PDF, DOCX, DOC files' : 'JPG, PNG, GIF, WebP (image)'}
            </p>
          </div>
        )}
      </div>

      {/* Visual Preview Box */}
      {preview && status !== 'error' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="relative overflow-hidden rounded-xl border border-border-soft bg-surface p-2"
        >
          {isVideo ? (
            <video
              src={preview}
              controls
              className="max-h-48 w-full rounded-lg bg-black object-contain"
            />
          ) : isDoc ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border-soft">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">{file?.name || 'Attached Document'}</p>
                  <p className="text-[10px] font-mono text-text-faint">PDF / Word Document</p>
                </div>
              </div>
              <a
                href={preview}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:underline"
              >
                <ExternalLink size={13} /> Open
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center bg-black/20 rounded-lg p-1">
              <img
                src={preview}
                alt="Upload preview"
                className="max-h-44 rounded-lg object-contain"
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
