export default function Button({ variant = 'primary', className = '', loading = false, icon, children, ...props }) {
  const base = 'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer justify-center select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden'
  const variants = {
    primary: 'bg-gradient-to-b from-[#0076f7] to-[#0071E3] text-white hover:brightness-105 active:brightness-95 shadow-sm border border-[#006bd8]',
    ghost: 'text-[#1d1d1f] bg-white hover:bg-[#F5F5F7] border border-[#d2d2d7] shadow-xs active:bg-[#ECECEC]',
    danger: 'bg-gradient-to-b from-[#ff453a] to-[#FF3B30] text-white hover:brightness-105 active:brightness-95 shadow-sm border border-[#e5352b]',
    success: 'bg-gradient-to-b from-[#34c759] to-[#2eb852] text-white hover:brightness-105 active:brightness-95 shadow-sm border border-[#2ab04d]',
  }
  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="w-3.5 h-3.5 animate-spinner text-current" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.416" strokeDashoffset="10" strokeLinecap="round" />
        </svg>
      )}
      {!loading && icon && <span className="w-3.5 h-3.5 shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
