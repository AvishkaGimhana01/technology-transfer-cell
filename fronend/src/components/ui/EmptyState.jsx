export default function EmptyState({ title = 'No records found', message = 'There are no items to display at the moment.', icon = '📭' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-line rounded-lg text-center bg-surface">
      <span className="text-4xl mb-4 select-none">{icon}</span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="text-sm text-ink/60 mt-1 max-w-sm">{message}</p>
    </div>
  )
}
