export default function Input({ label, ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="text-ink/75 mb-1.5 block font-medium">{label}</span>}
      <input
        className="w-full rounded-lg border border-line px-3 py-2 outline-none focus:ring-3 focus:ring-indigo/15 focus:border-indigo bg-surface text-ink placeholder-ink/40 transition-all duration-200 shadow-xs"
        {...props}
      />
    </label>
  )
}
