export default function EmptyState({ title = 'No records found', message = 'There are no items to display at the moment.', icon = '📭' }) {
  return (
    <div className="flex flex-col items-center justify-center p-16 border border-dashed border-line rounded-xl text-center bg-surface animate-fade-in">
      <span className="text-5xl mb-4 select-none animate-bounce-in block">{icon}</span>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="text-sm text-ink/50 mt-1.5 max-w-sm leading-relaxed">{message}</p>
    </div>
  )
}
