import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export default function DataTable({ columns, data, loading, page, pages, onPageChange, emptyMessage = 'No records found' }) {
  if (loading) return (
    <div className="card p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
    </div>
  )

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map(col => (
                <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400">{emptyMessage}</td></tr>
            ) : data.map((row, i) => (
              <tr key={row.id ?? i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">Page {page} of {pages}</p>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
              className="btn-secondary p-1.5 disabled:opacity-30">
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}
              className="btn-secondary p-1.5 disabled:opacity-30">
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
