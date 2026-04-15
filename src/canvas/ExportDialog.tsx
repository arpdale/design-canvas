/* eslint-disable react-hooks/set-state-in-effect */
// Async load pattern: the dialog kicks off exportComposition when it
// opens or when the active composition changes. Resetting + setting
// state in the effect is the correct shape for this.
import { useEffect, useState } from 'react'
import { exportComposition, type ExportResult } from '../export'
import { useCanvas } from './state/canvasStoreContext'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
}

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const { active } = useCanvas()
  const [result, setResult] = useState<ExportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open || !active) return
    let cancelled = false
    setResult(null)
    setError(null)
    setCopied(false)
    exportComposition(active)
      .then((r) => {
        if (!cancelled) setResult(r)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      cancelled = true
    }
  }, [open, active])

  if (!open) return null

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.source)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('Copy failed — select the text and copy manually.')
    }
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([result.source], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div
      data-testid="export-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-full flex flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 px-5 py-3 border-b border-neutral-200">
          <h2 className="text-sm font-semibold text-neutral-900">Export</h2>
          {result ? (
            <span
              data-testid="export-filename"
              className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700"
            >
              {result.filename}
            </span>
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              data-testid="export-copy"
              onClick={handleCopy}
              disabled={!result}
              className="text-sm px-3 py-1 rounded-md border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-neutral-400"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              type="button"
              data-testid="export-download"
              onClick={handleDownload}
              disabled={!result}
              className="text-sm px-3 py-1 rounded-md bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              Download
            </button>
            <button
              type="button"
              data-testid="export-close"
              onClick={onClose}
              aria-label="Close"
              className="text-sm px-2 py-1 text-neutral-500 hover:text-neutral-900"
            >
              ✕
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {error ? (
            <div className="p-4 text-sm text-red-700">{error}</div>
          ) : result ? (
            <pre
              data-testid="export-source"
              className="p-5 text-[13px] leading-relaxed font-mono text-neutral-800 whitespace-pre-wrap break-words bg-neutral-50"
            >
              {result.source}
            </pre>
          ) : (
            <div className="p-4 text-sm text-neutral-400">Generating…</div>
          )}
        </div>
      </div>
    </div>
  )
}
