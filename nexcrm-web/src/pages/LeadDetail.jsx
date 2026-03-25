import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PencilIcon, TrashIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline'
import { leadsApi } from '../api/leads'
import { activitiesApi } from '../api/activities'
import { contactsApi } from '../api/contacts'
import Modal from '../components/Modal'
import LeadForm from '../components/LeadForm'
import ActivityForm from '../components/ActivityForm'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  New:        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  Contacted:  'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Qualified:  'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ClosedWon:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ClosedLost: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}
const STATUSES = ['New', 'Contacted', 'Qualified', 'ClosedWon', 'ClosedLost']
const ACTIVITY_ICONS = { Call: '📞', Email: '✉️', Meeting: '🤝', Note: '📝' }

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead]         = useState(null)
  const [activities, setActivities] = useState([])
  const [contacts, setContacts] = useState([])
  const [leads, setLeads]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [saving, setSaving]     = useState(false)

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

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="h-8 w-8 rounded-full border-[3px] border-primary-500/20 border-t-primary-500 animate-spin" />
    </div>
  )
  if (!lead) return <p className="text-slate-500 dark:text-slate-400">Lead not found.</p>

  const contact = contacts.find(c => c.id === lead.contact_id)

  return (
    <div className="space-y-6 max-w-3xl animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/leads" className="btn-secondary p-2 shrink-0"><ArrowLeftIcon className="h-4 w-4" /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{lead.title}</h1>
          <span className={`badge mt-1 ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
        </div>
        <button onClick={() => setShowEdit(true)} className="btn-secondary shrink-0"><PencilIcon className="h-4 w-4" /> Edit</button>
        <button onClick={handleDelete} className="btn-danger shrink-0"><TrashIcon className="h-4 w-4" /> Delete</button>
      </div>

      {/* Details card */}
      <div className="card p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Deal Value</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {lead.value != null ? `$${lead.value.toLocaleString()}` : <span className="text-slate-400 font-normal text-sm">—</span>}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact</p>
            {contact
              ? <Link to={`/contacts/${contact.id}`} className="text-sm font-medium text-primary-600 hover:underline">{contact.name}</Link>
              : <p className="text-sm text-slate-400">—</p>
            }
          </div>
        </div>

        {lead.notes && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Move to status</p>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} disabled={s === lead.status} onClick={() => handleStatusChange(s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  s === lead.status
                    ? STATUS_COLORS[s] + ' cursor-default border-transparent'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-300 hover:text-primary-600'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">Activities ({activities.length})</h2>
          <button className="btn-primary text-xs px-3 py-1.5" onClick={() => setShowActivity(true)}>
            <PlusIcon className="h-3.5 w-3.5" /> Log Activity
          </button>
        </div>
        {activities.length === 0
          ? <p className="text-sm text-slate-400">No activities yet.</p>
          : (
            <ul className="space-y-3">
              {activities.map(a => (
                <li key={a.id} className="flex items-start gap-3 py-2.5 border-b border-slate-50 dark:border-slate-800/80 last:border-0">
                  <span className="text-xl shrink-0">{ACTIVITY_ICONS[a.type]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.subject}</p>
                    {a.body && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.body}</p>}
                    <p className="text-xs text-slate-400 mt-1">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </div>

      {showEdit && (
        <Modal title="Edit Lead" onClose={() => setShowEdit(false)}>
          <LeadForm initial={lead} contacts={contacts} onSubmit={handleUpdate} onCancel={() => setShowEdit(false)} loading={saving} />
        </Modal>
      )}
      {showActivity && (
        <Modal title="Log Activity" onClose={() => setShowActivity(false)}>
          <ActivityForm contacts={contacts} leads={leads} onSubmit={handleAddActivity} onCancel={() => setShowActivity(false)} loading={saving} />
        </Modal>
      )}
    </div>
  )
}
