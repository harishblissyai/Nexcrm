import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { leadsApi } from '../api/leads'
import { activitiesApi } from '../api/activities'
import { contactsApi } from '../api/contacts'
import Modal from '../components/Modal'
import LeadForm from '../components/LeadForm'
import ActivityForm from '../components/ActivityForm'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  New: 'bg-gray-100 text-gray-700', Contacted: 'bg-blue-100 text-blue-700',
  Qualified: 'bg-yellow-100 text-yellow-700', ClosedWon: 'bg-green-100 text-green-700', ClosedLost: 'bg-red-100 text-red-700',
}
const STATUSES = ['New', 'Contacted', 'Qualified', 'ClosedWon', 'ClosedLost']
const ACTIVITY_ICONS = { Call: '📞', Email: '✉️', Meeting: '🤝', Note: '📝' }

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [activities, setActivities] = useState([])
  const [contacts, setContacts] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = () => {
    Promise.all([
      leadsApi.get(id),
      activitiesApi.list({ lead_id: id, size: 50 }),
      contactsApi.list({ size: 100 }),
      leadsApi.list({ size: 100 }),
    ]).then(([l, a, c, ls]) => { setLead(l); setActivities(a.items); setContacts(c.items); setLeads(ls.items) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleUpdate = async (form) => {
    setSaving(true)
    try { await leadsApi.update(id, form); toast.success('Updated'); setShowEdit(false); load() }
    catch { toast.error('Failed') } finally { setSaving(false) }
  }

  const handleStatusChange = async (status) => {
    try { await leadsApi.updateStatus(id, status); toast.success(`Status → ${status}`); load() }
    catch { toast.error('Failed') }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this lead?')) return
    await leadsApi.delete(id); navigate('/leads')
  }

  const handleAddActivity = async (form) => {
    setSaving(true)
    try { await activitiesApi.create({ ...form, lead_id: Number(id) }); toast.success('Activity logged'); setShowActivity(false); load() }
    catch { toast.error('Failed') } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
  if (!lead) return <p className="text-gray-500">Lead not found.</p>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link to="/leads" className="btn-secondary p-2"><ArrowLeftIcon className="h-4 w-4" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{lead.title}</h1>
          <span className={`badge ${STATUS_COLORS[lead.status]} mt-1`}>{lead.status}</span>
        </div>
        <button onClick={() => setShowEdit(true)} className="btn-secondary"><PencilIcon className="h-4 w-4" /> Edit</button>
        <button onClick={handleDelete} className="btn-danger"><TrashIcon className="h-4 w-4" /> Delete</button>
      </div>

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-400 mb-1">Deal Value</p><p className="text-sm font-semibold">{lead.value != null ? `$${lead.value.toLocaleString()}` : '—'}</p></div>
          <div><p className="text-xs text-gray-400 mb-1">Contact</p><p className="text-sm">{contacts.find(c => c.id === lead.contact_id)?.name || '—'}</p></div>
        </div>
        {lead.notes && <div><p className="text-xs text-gray-400 mb-1">Notes</p><p className="text-sm whitespace-pre-wrap">{lead.notes}</p></div>}

        <div>
          <p className="text-xs text-gray-400 mb-2">Move to status</p>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} disabled={s === lead.status} onClick={() => handleStatusChange(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${s === lead.status ? STATUS_COLORS[s] + ' cursor-default border-transparent' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Activities ({activities.length})</h2>
          <button className="btn-primary text-xs px-3 py-1.5" onClick={() => setShowActivity(true)}>+ Log Activity</button>
        </div>
        {activities.length === 0 ? <p className="text-sm text-gray-400">No activities yet.</p> : (
          <ul className="space-y-3">
            {activities.map(a => (
              <li key={a.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-xl">{ACTIVITY_ICONS[a.type]}</span>
                <div>
                  <p className="text-sm font-medium">{a.subject}</p>
                  {a.body && <p className="text-xs text-gray-500 mt-0.5">{a.body}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showEdit && <Modal title="Edit Lead" onClose={() => setShowEdit(false)}><LeadForm initial={lead} contacts={contacts} onSubmit={handleUpdate} onCancel={() => setShowEdit(false)} loading={saving} /></Modal>}
      {showActivity && <Modal title="Log Activity" onClose={() => setShowActivity(false)}><ActivityForm contacts={contacts} leads={leads} onSubmit={handleAddActivity} onCancel={() => setShowActivity(false)} loading={saving} /></Modal>}
    </div>
  )
}
