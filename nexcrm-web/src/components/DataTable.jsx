import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export default function DataTable({
  columns, data, loading, page, pages, onPageChange,
  emptyMessage = 'No records found',
}) {
  if (loading) return (
    <div className="card p-12 text-center">
      <div className="h-8 w-8 rounded-full border-[3px] border-primary-500/20 border-t-primary-500 animate-spin mx-auto" />
    </div>
  )

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
              {columns.map(col => (
                <th key={col.key}
                  className="text-left px-4 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-14 text-slate-400 dark:text-slate-500 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : data.map((row, i) => (
              <tr key={row.id ?? i}
                className="bg-white dark:bg-transparent hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400">Page {page} of {pages}</p>
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
