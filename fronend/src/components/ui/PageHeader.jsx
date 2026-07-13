export default function PageHeader({ title, description, action, icon }) {
  return (
    <div className="flex items-start justify-between pb-5 mb-6 border-b border-line animate-slide-down">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 w-9 h-9 rounded-xl bg-indigo/10 flex items-center justify-center text-indigo shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-ink tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-ink/50 mt-1 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
