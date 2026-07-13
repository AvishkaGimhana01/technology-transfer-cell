import Skeleton from './Skeleton'

export default function DataTable({ columns, rows, onRowClick, emptyLabel = 'No records yet.', loading = false }) {
  if (loading) {
    return <Skeleton variant="table" />
  }

  if (!rows?.length) {
    return (
      <div className="text-sm text-ink/45 border border-dashed border-line rounded-xl p-12 text-center bg-surface animate-fade-in">
        <svg className="w-10 h-10 mx-auto mb-3 text-ink/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="border border-line rounded-xl overflow-hidden bg-surface shadow-xs animate-fade-in">
      <table className="w-full text-sm">
        <thead className="bg-paper/80 text-ink/50 text-left">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular">
          {rows.map((row, i) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`border-t border-line transition-all duration-150 table-row-animate ${
                onRowClick ? 'cursor-pointer hover:bg-indigo/[0.03]' : ''
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-5 py-3.5">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
