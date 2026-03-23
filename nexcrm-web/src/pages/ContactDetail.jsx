import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { contactsApi } from '../api/contacts'
import { activitiesApi } from '../api/activities'
import Modal from '../components/Modal'
import ContactForm from '../components/ContactForm'
import ActivityForm from '../components/ActivityForm'
import { leadsApi } from '../api/leads'
import toast from 'react-hot-toast'

const ACTIVITY_ICONS = { Call: '📞', Email: '✉️', Meeting: '🤝', Note: '📝' }

export default function ContactDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState(null)
  const [activities, setActivities] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = () => {
    Promise.all([
      contactsApi.get(id),
      activitiesApi.list({ contact_id: id, size: 50 }),
      leadsApi.list({ size: 100 }),
    ]).then(([c, a, l]) => { setContact(c); setActivities(a.items); setLeads(l.items) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleUpdate = async (form) => {
    setSaving(true)
    try { await contactsApi.update(id, form); toast.success('Updated'); setShowEdit(false); load() }
    catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this contact and all linked data?')) return
    await contactsApi.delete(id)
    navigate('/contacts')
  }

  const handleAddActivity = async (form) => {
    setSaving(true)
    try { await activitiesApi.create({ ...form, contact_id: Number(id) }); toast.success('Activity logged'); setShowActivity(false); load() }
    catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
  if (!contact) return <p className="text-gray-500">Contact not found.</p>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link to="/contacts" className="btn-secondary p-2"><ArrowLeftIcon className="h-4 w-4" /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
          {contact.company && <p className="text-sm text-gray-500">{contact.company}</p>}
        </div>
        <button onClick={() => setShowEdit(true)} className="btn-secondary"><PencilIcon className="h-4 w-4" /> Edit</button>
        <button onClick={handleDelete} className="btn-danger"><TrashIcon className="h-4 w-4" /> Delete</button>
      </div>

      <div className="card p-5 grid grid-cols-2 gap-4">
        <div><p className="text-xs text-gray-400 mb-1">Email</p><p className="text-sm">{contact.email || '—'}</p></div>
        <div><p className="text-xs text-gray-400 mb-1">Phone</p><p className="text-sm">{contact.phone || '—'}</p></div>
        <div className="col-span-2"><p className="text-xs text-gray-400 mb-1">Notes</p><p className="text-sm whitespace-pre-wrap">{contact.notes || '—'}</p></div>
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

      {showEdit && <Modal title="Edit Contact" onClose={() => setShowEdit(false)}><ContactForm initial={contact} onSubmit={handleUpdate} onCancel={() => setShowEdit(false)} loading={saving} /></Modal>}
      {showActivity && <Modal title="Log Activity" onClose={() => setShowActivity(false)}><ActivityForm contacts={[contact]} leads={leads} onSubmit={handleAddActivity} onCancel={() => setShowActivity(false)} loading={saving} /></Modal>}
    </div>
  )
}
