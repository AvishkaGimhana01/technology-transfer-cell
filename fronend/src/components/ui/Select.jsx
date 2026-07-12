export default function Select({ label, children, ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="text-ink/75 mb-1.5 block font-medium">{label}</span>}
      <select
        className="w-full rounded-lg border border-line px-3 py-2 outline-none focus:ring-3 focus:ring-indigo/15 focus:border-indigo bg-surface text-ink transition-all duration-200 shadow-xs cursor-pointer"
        {...props}
      >
        {children}
      </select>
    </label>
  )
}
