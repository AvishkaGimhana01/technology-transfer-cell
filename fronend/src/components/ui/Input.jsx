export default function Input({ label, className = '', ...props }) {
  return (
    <label className="block text-sm group">
      {label && (
        <span className="text-ink/70 mb-1.5 block font-medium text-xs uppercase tracking-wider">
          {label}
        </span>
      )}
      <input
        className={`w-full rounded-xl border border-line px-3.5 py-2.5 outline-none bg-surface text-ink placeholder-ink/35 transition-all duration-200 shadow-xs focus-glow hover:border-ink/20 ${className}`}
        {...props}
      />
    </label>
  )
}
