export default function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer justify-center select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-indigo text-white hover:bg-indigo-dark shadow-sm shadow-indigo/10',
    ghost: 'text-ink bg-surface hover:bg-paper border border-line shadow-xs',
    danger: 'bg-rust text-white hover:opacity-90 shadow-sm shadow-rust/10',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
