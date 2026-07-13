export default function Button({ variant = 'primary', className = '', loading = false, icon, children, ...props }) {
  const base = 'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer justify-center select-none active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden'
  const variants = {
    primary: 'bg-gradient-to-r from-indigo to-indigo-dark text-white hover:shadow-lg hover:shadow-indigo/20 hover:-translate-y-0.5',
    ghost: 'text-ink bg-surface hover:bg-paper border border-line shadow-xs hover:shadow-sm hover:-translate-y-0.5',
    danger: 'bg-gradient-to-r from-rust to-[#cc3325] text-white hover:shadow-lg hover:shadow-rust/20 hover:-translate-y-0.5',
    success: 'bg-gradient-to-r from-teal to-[#2ba84a] text-white hover:shadow-lg hover:shadow-teal/20 hover:-translate-y-0.5',
  }
  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spinner" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.416" strokeDashoffset="10" strokeLinecap="round" />
        </svg>
      )}
      {!loading && icon && <span className="w-4 h-4 shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
