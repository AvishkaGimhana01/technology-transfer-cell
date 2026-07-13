export default function Select({ label, children, className = '', ...props }) {
  return (
    <label className="block text-sm group">
      {label && (
        <span className="text-ink/70 mb-1.5 block font-medium text-xs uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="relative">
        <select
          className={`w-full rounded-xl border border-line px-3.5 py-2.5 pr-9 outline-none bg-surface text-ink transition-all duration-200 shadow-xs focus-glow hover:border-ink/20 appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {children}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </label>
  )
}
