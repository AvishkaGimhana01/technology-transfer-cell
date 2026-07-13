export default function Skeleton({ className = '', variant = 'text', lines = 1 }) {
  if (variant === 'card') {
    return (
      <div className={`bg-surface border border-line rounded-xl p-6 space-y-4 ${className}`}>
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton h-3 w-2/3" />
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className={`border border-line rounded-xl overflow-hidden bg-surface ${className}`}>
        <div className="bg-paper px-4 py-3 flex gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-4 border-t border-line flex gap-6">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="skeleton h-3 flex-1" style={{ animationDelay: `${(i * 4 + j) * 50}ms` }} />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3"
          style={{
            width: i === lines - 1 && lines > 1 ? '60%' : '100%',
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  )
}
