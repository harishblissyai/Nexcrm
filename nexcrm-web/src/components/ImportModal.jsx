import { useState, useRef } from 'react'
import { ArrowUpTrayIcon, DocumentArrowDownIcon, XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ImportModal({ onClose, onImport, templateHeaders, entityName }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef()

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith('.csv')) setFile(f)
    else toast.error('Please drop a .csv file')
  }

  function downloadTemplate() {
    const csv = templateHeaders.join(',') + '\n'
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${entityName}_template.csv`
    a.click()
  }

  async function handleImport() {
    if (!file) return
    setLoading(true)
    try {
      const res = await onImport(file)
      setResult(res)
    } catch (err) {
      toast.error('Import failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Import {entityName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!result ? (
            <>
              {/* Template download */}
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                Download CSV Template
              </button>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragging ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                <ArrowUpTrayIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                {file ? (
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700">Drop your CSV here</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              {/* Required columns */}
              <p className="text-xs text-gray-500">
                Required columns: <span className="font-mono font-medium">{templateHeaders[0]}</span>
                {templateHeaders.length > 1 && ` (optional: ${templateHeaders.slice(1).join(', ')})`}
              </p>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file || loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Importing...' : 'Import'}
                </button>
              </div>
            </>
          ) : (
            /* Result screen */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircleIcon className="h-6 w-6 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">{result.imported} records imported</p>
                  {result.errors?.length > 0 && (
                    <p className="text-sm text-green-600">{result.errors.length} rows skipped</p>
                  )}
                </div>
              </div>

              {result.errors?.length > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                    <p className="text-xs font-semibold text-yellow-700">Skipped rows</p>
                  </div>
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-yellow-700">{e}</p>
                  ))}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
