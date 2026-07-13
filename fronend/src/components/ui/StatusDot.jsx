const COLORS = {
  proposed:          { dot: 'bg-amber',  bg: 'bg-amber-light',  text: 'text-amber' },
  ongoing:           { dot: 'bg-teal',   bg: 'bg-teal-light',   text: 'text-teal' },
  completed:         { dot: 'bg-indigo',  bg: 'bg-indigo-light', text: 'text-indigo' },
  cancelled:         { dot: 'bg-rust',   bg: 'bg-rust-light',   text: 'text-rust' },
  draft:             { dot: 'bg-amber',  bg: 'bg-amber-light',  text: 'text-amber' },
  active:            { dot: 'bg-teal',   bg: 'bg-teal-light',   text: 'text-teal' },
  expired:           { dot: 'bg-rust',   bg: 'bg-rust-light',   text: 'text-rust' },
  terminated:        { dot: 'bg-rust',   bg: 'bg-rust-light',   text: 'text-rust' },
  pending_signature: { dot: 'bg-amber',  bg: 'bg-amber-light',  text: 'text-amber' },
  signed:            { dot: 'bg-teal',   bg: 'bg-teal-light',   text: 'text-teal' },
  pending:           { dot: 'bg-amber',  bg: 'bg-amber-light',  text: 'text-amber' },
  approved:          { dot: 'bg-teal',   bg: 'bg-teal-light',   text: 'text-teal' },
  rejected:          { dot: 'bg-rust',   bg: 'bg-rust-light',   text: 'text-rust' },
  reported:          { dot: 'bg-amber',  bg: 'bg-amber-light',  text: 'text-amber' },
  investigating:     { dot: 'bg-indigo',  bg: 'bg-indigo-light', text: 'text-indigo' },
  resolved:          { dot: 'bg-teal',   bg: 'bg-teal-light',   text: 'text-teal' },
  dismissed:         { dot: 'bg-rust',   bg: 'bg-rust-light',   text: 'text-rust' },
}

const FALLBACK = { dot: 'bg-line', bg: 'bg-paper', text: 'text-ink/50' }

export default function StatusDot({ status }) {
  const c = COLORS[status] || FALLBACK
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full ${c.bg}`}>
      <span className="relative flex h-2 w-2">
        <span className={`absolute inset-0 rounded-full ${c.dot} animate-pulse-dot`} />
        <span className={`relative rounded-full h-2 w-2 ${c.dot}`} />
      </span>
      <span className={`capitalize ${c.text}`}>{status?.replaceAll('_', ' ')}</span>
    </span>
  )
}
