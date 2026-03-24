import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  PencilIcon, TrashIcon, ArrowLeftIcon,
  EnvelopeIcon, PhoneIcon, BuildingOfficeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { contactsApi } from '../api/contacts'
import { activitiesApi } from '../api/activities'
import { leadsApi } from '../api/leads'
import Modal from '../components/Modal'
import ContactForm from '../components/ContactForm'
import ActivityForm from '../components/ActivityForm'
import ContactTimeline from '../components/ContactTimeline'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  New: 'bg-gray-100 text-gray-700',
  Contacted: 'bg-blue-100 text-blue-700',
  Qualified: 'bg-yellow-100 text-yellow-700',
  ClosedWon: 'bg-green-100 text-green-700',
  ClosedLost: 'bg-red-100 text-red-700',
}

export default function ContactDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact]     = useState(null)
  const [timeline, setTimeline]   = useState([])
  const [leads, setLeads]         = useState([])
  const [linkedLeads, setLinkedLeads] = useState([])
  const [loading, setLoading]     = useState(true)
  const [tlLoading, setTlLoading] = useState(true)
  const [showEdit, setShowEdit]   = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [tab, setTab]             = useState('timeline') // 'timeline' | 'leads'

  const loadContact = () =>
    contactsApi.get(id).then(setContact)

  const loadTimeline = () => {
    setTlLoading(true)
    contactsApi.timeline(id)
      .then(setTimeline)
      .finally(() => setTlLoading(false))
  }

  const loadLeads = () =>
    leadsApi.list({ size: 100 }).then(r => {
      setLeads(r.items)
      setLinkedLeads(r.items.filter(l => l.contact_id === Number(id)))
    })

  const load = () => {
    setLoading(true)
    Promise.all([loadContact(), loadLeads()])
      .finally(() => setLoading(false))
    loadTimeline()
  }

  useEffect(() => { load() }, [id])

  const handleUpdate = async (form) => {
    setSaving(true)
    try {
      await contactsApi.update(id, form)
      toast.success('Contact updated')
      setShowEdit(false)
      loadContact()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this contact and all linked data?')) return
    await contactsApi.delete(id)
    navigate('/contacts')
  }

  const handleAddActivity = async (form) => {
    setSaving(true)
    try {
      await activitiesApi.create({ ...form, contact_id: Number(id) })
      toast.success('Activity logged')
      setShowActivity(false)
      loadTimeline()
    } catch { toast.error('Failed to log activity') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )
  if (!contact) return <p className="text-gray-500 p-6">Contact not found.</p>

  const initials = contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/contacts" className="btn-secondary p-2 shrink-0">
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">{initials}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{contact.name}</h1>
            {contact.company && <p className="text-sm text-gray-500 truncate">{contact.company}</p>}
          </div>
        </div>
        <button onClick={() => setShowEdit(true)} className="btn-secondary shrink-0">
          <PencilIcon className="h-4 w-4" /> Edit
        </button>
        <button onClick={handleDelete} className="btn-danger shrink-0">
          <TrashIcon className="h-4 w-4" /> Delete
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left panel: contact info */}
        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Info</h3>
            {contact.email && (
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4 text-gray-400 shrink-0" />
                <a href={`mailto:${contact.email}`} className="text-sm text-primary-600 hover:underline truncate">{contact.email}</a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-gray-400 shrink-0" />
                <a href={`tel:${contact.phone}`} className="text-sm text-gray-700">{contact.phone}</a>
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-2">
                <BuildingOfficeIcon className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 truncate">{contact.company}</span>
              </div>
            )}
            {!contact.email && !contact.phone && !contact.company && (
              <p className="text-xs text-gray-400">No contact details added.</p>
            )}
          </div>

          {contact.notes && (
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          {/* Quick stats */}
          <div className="card p-4 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{timeline.filter(e => e.kind === 'activity').length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Activities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{linkedLeads.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Leads</p>
            </div>
          </div>
        </div>

        {/* Right panel: tabs */}
        <div className="md:col-span-2 card p-5">
          {/* Tab bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {['timeline', 'leads'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                    tab === t
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'timeline' ? `Timeline (${timeline.length})` : `Leads (${linkedLeads.length})`}
                </button>
              ))}
            </div>
            {tab === 'timeline' && (
              <button className="btn-primary text-xs px-3 py-1.5" onClick={() => setShowActivity(true)}>
                <PlusIcon className="h-3.5 w-3.5" /> Log Activity
              </button>
            )}
          </div>

          {/* Timeline tab */}
          {tab === 'timeline' && (
            <ContactTimeline
              events={timeline}
              loading={tlLoading}
              onLogActivity={() => setShowActivity(true)}
            />
          )}

          {/* Leads tab */}
          {tab === 'leads' && (
            <div>
              {linkedLeads.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-400">No leads linked to this contact.</p>
                  <Link to="/leads" className="mt-2 text-sm text-primary-600 hover:underline font-medium block">
                    Create a lead →
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2">
                  {linkedLeads.map(lead => (
                    <li key={lead.id}>
                      <Link
                        to={`/leads/${lead.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700">{lead.title}</p>
                          {lead.value && (
                            <p className="text-xs text-gray-500 mt-0.5">${Number(lead.value).toLocaleString()}</p>
                          )}
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[lead.status]}`}>
                          {lead.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <Modal title="Edit Contact" onClose={() => setShowEdit(false)}>
          <ContactForm initial={contact} onSubmit={handleUpdate} onCancel={() => setShowEdit(false)} loading={saving} />
        </Modal>
      )}
      {showActivity && (
        <Modal title="Log Activity" onClose={() => setShowActivity(false)}>
          <ActivityForm
            contacts={[contact]}
            leads={leads}
            onSubmit={handleAddActivity}
            onCancel={() => setShowActivity(false)}
            loading={saving}
          />
        </Modal>
      )}
    </div>
  )
}
