import { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
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

export default function Activities() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 })
  const [page, setPage] = useState(1)
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

  const getContactName = (id) => contacts.find(c => c.id === id)?.name
  const getLeadTitle = (id) => leads.find(l => l.id === id)?.title

  const columns = [
    { key: 'type', label: 'Type', render: r => <span className={`badge ${TYPE_COLORS[r.type]}`}>{ACTIVITY_ICONS[r.type]} {r.type}</span> },
    { key: 'subject', label: 'Subject', render: r => <span className="font-medium">{r.subject}</span> },
    { key: 'contact', label: 'Contact', render: r => r.contact_id ? <span className="text-sm text-gray-600">{getContactName(r.contact_id) || `#${r.contact_id}`}</span> : <span className="text-gray-400">—</span> },
    { key: 'lead', label: 'Lead', render: r => r.lead_id ? <span className="text-sm text-gray-600">{getLeadTitle(r.lead_id) || `#${r.lead_id}`}</span> : <span className="text-gray-400">—</span> },
    { key: 'created_at', label: 'Date', render: r => new Date(r.created_at).toLocaleDateString() },
    { key: 'actions', label: '', render: r => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => { setEditing(r); setShowModal(true) }} className="btn-secondary p-1.5"><PencilIcon className="h-4 w-4" /></button>
        <button onClick={() => handleDelete(r.id)} className="btn p-1.5 text-red-500 hover:bg-red-50 border border-gray-300 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
      </div>
    )},
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

      <DataTable columns={columns} data={data.items} loading={loading} page={page} pages={data.pages} onPageChange={setPage} emptyMessage="No activities logged yet." />

      {showModal && (
        <Modal title={editing ? 'Edit Activity' : 'Log Activity'} onClose={() => { setShowModal(false); setEditing(null) }}>
          <ActivityForm initial={editing ?? {}} contacts={contacts} leads={leads} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditing(null) }} loading={saving} />
        </Modal>
      )}
    </div>
  )
}
