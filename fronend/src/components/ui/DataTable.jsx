export default function DataTable({ columns, rows, onRowClick, emptyLabel = 'No records yet.' }) {
  if (!rows?.length) {
    return (
      <div className="text-sm text-ink/50 border border-dashed border-line rounded-lg p-8 text-center">
        {emptyLabel}
      </div>
    )
  }
  return (
    <div className="border border-line rounded-lg overflow-hidden bg-surface">
      <table className="w-full text-sm">
        <thead className="bg-paper text-ink/60 text-left">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-2 font-medium">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular">
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`border-t border-line ${onRowClick ? 'cursor-pointer hover:bg-paper' : ''}`}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3">
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
