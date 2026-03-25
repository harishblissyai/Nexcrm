import { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import { activitiesApi } from '../api/activities'
import { contactsApi } from '../api/contacts'
import { leadsApi } from '../api/leads'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ActivityForm from '../components/ActivityForm'
import toast from 'react-hot-toast'

const TYPE_COLORS = {
  Call: 'bg-blue-100 text-blue-700',
  Email: 'bg-purple-100 text-purple-700',
  Meeting: 'bg-yellow-100 text-yellow-700',
  Note: 'bg-gray-100 text-gray-700',
}
const ACTIVITY_ICONS = { Call: '📞', Email: '✉️', Meeting: '🤝', Note: '📝' }

function DueDateCell({ row }) {
  if (!row.due_date) return <span className="text-gray-400">—</span>
  const due = new Date(row.due_date)
  const now = new Date()
  const isOverdue = !row.is_done && due < now
  const isToday = !row.is_done && due >= new Date(now.toDateString()) && due < new Date(new Date(now.toDateString()).getTime() + 86400000)
  return (
    <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : isToday ? 'text-yellow-600 font-semibold' : 'text-gray-500'}`}>
      {isOverdue && <ExclamationCircleIcon className="h-3.5 w-3.5" />}
      {due.toLocaleDateString()}
    </span>
  )
}

export default function Activities() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 })
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all') // 'all' | 'overdue' | 'today' | 'done'
  const [contacts, setContacts] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = (p = page) => {
    setLoading(true)
    activitiesApi.list({ page: p, size: 20 })
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    contactsApi.list({ size: 100 }).then(r => setContacts(r.items))
    leadsApi.list({ size: 100 }).then(r => setLeads(r.items))
  }, [])

  useEffect(() => { load() }, [page])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editing) { await activitiesApi.update(editing.id, form); toast.success('Activity updated') }
      else { await activitiesApi.create(form); toast.success('Activity logged') }
      setShowModal(false); setEditing(null); load()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this activity?')) return
    try { await activitiesApi.delete(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  const handleMarkDone = async (id) => {
    try { await activitiesApi.markDone(id); toast.success('Marked as done'); load() }
    catch { toast.error('Failed') }
  }

  const getContactName = (id) => contacts.find(c => c.id === id)?.name
  const getLeadTitle = (id) => leads.find(l => l.id === id)?.title

  const now = new Date()
  const todayStart = new Date(now.toDateString())
  const todayEnd = new Date(todayStart.getTime() + 86400000)

  const filteredItems = data.items.filter(r => {
    if (filter === 'overdue') return r.due_date && new Date(r.due_date) < now && !r.is_done
    if (filter === 'today') return r.due_date && new Date(r.due_date) >= todayStart && new Date(r.due_date) < todayEnd && !r.is_done
    if (filter === 'done') return r.is_done
    return true
  })

  const columns = [
    {
      key: 'status', label: '', render: r => (
        r.is_done
          ? <CheckCircleSolid className="h-5 w-5 text-green-400" />
          : <button onClick={() => handleMarkDone(r.id)} className="text-gray-300 hover:text-green-500 transition-colors"><CheckCircleSolid className="h-5 w-5" /></button>
      )
    },
    { key: 'type', label: 'Type', render: r => <span className={`badge ${TYPE_COLORS[r.type]} ${r.is_done ? 'opacity-50' : ''}`}>{ACTIVITY_ICONS[r.type]} {r.type}</span> },
    { key: 'subject', label: 'Subject', render: r => <span className={`font-medium ${r.is_done ? 'line-through text-gray-400' : ''}`}>{r.subject}</span> },
    { key: 'contact', label: 'Contact', render: r => r.contact_id ? <span className="text-sm text-gray-600">{getContactName(r.contact_id) || `#${r.contact_id}`}</span> : <span className="text-gray-400">—</span> },
    { key: 'due_date', label: 'Due', render: r => <DueDateCell row={r} /> },
    { key: 'created_at', label: 'Created', render: r => <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</span> },
    {
      key: 'actions', label: '', render: r => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => { setEditing(r); setShowModal(true) }} className="btn-secondary p-1.5"><PencilIcon className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(r.id)} className="btn p-1.5 text-red-500 hover:bg-red-50 border border-gray-300 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
        </div>
      )
    },
  ]

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'today', label: 'Due Today' },
    { key: 'done', label: 'Done' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-sm text-gray-500">{data.total} total</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true) }}>
          <PlusIcon className="h-4 w-4" /> Log Activity
        </button>
      </div>

      <div className="flex gap-2">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filteredItems} loading={loading} page={page} pages={data.pages} onPageChange={setPage} emptyMessage="No activities found." />

      {showModal && (
        <Modal title={editing ? 'Edit Activity' : 'Log Activity'} onClose={() => { setShowModal(false); setEditing(null) }}>
          <ActivityForm initial={editing ?? {}} contacts={contacts} leads={leads} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditing(null) }} loading={saving} />
        </Modal>
      )}
    </div>
  )
}
