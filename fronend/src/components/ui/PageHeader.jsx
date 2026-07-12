export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between border-b border-line pb-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        {description && <p className="text-sm text-ink/60 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}
