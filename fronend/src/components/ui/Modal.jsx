import { useEffect, useCallback } from 'react'

export default function Modal({ open, onClose, title, children }) {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, handleEscape])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative glass border border-line/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl modal-card">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-line">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-paper hover:bg-line text-ink/40 hover:text-ink flex items-center justify-center cursor-pointer transition-all duration-150 text-xs font-bold leading-none hover:rotate-90"
          >
            ✕
          </button>
        </div>
        <div className="animate-fade-in">{children}</div>
      </div>
    </div>
  )
}
