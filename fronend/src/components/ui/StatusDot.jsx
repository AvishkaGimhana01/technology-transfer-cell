const COLORS = {
  proposed: 'bg-amber', ongoing: 'bg-teal', completed: 'bg-indigo', cancelled: 'bg-rust',
  draft: 'bg-amber', active: 'bg-teal', expired: 'bg-rust', terminated: 'bg-rust',
  pending_signature: 'bg-amber', signed: 'bg-teal',
  pending: 'bg-amber', approved: 'bg-teal', rejected: 'bg-rust',
  reported: 'bg-amber', investigating: 'bg-indigo', resolved: 'bg-teal', dismissed: 'bg-rust',
}

export default function StatusDot({ status }) {
  const dotColor = COLORS[status] ?? 'bg-line'
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      <span className="capitalize">{status?.replaceAll('_', ' ')}</span>
    </span>
  )
}
