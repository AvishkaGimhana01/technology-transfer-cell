export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-[#000000]/30 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-surface/95 backdrop-blur-md rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-line/80 transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="h-6 w-6 rounded-full bg-paper hover:bg-line text-ink/50 hover:text-ink flex items-center justify-center cursor-pointer transition-colors duration-150 text-xs font-semibold leading-none"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
