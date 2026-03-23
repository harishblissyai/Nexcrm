import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { contactsApi } from '../api/contacts'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ContactForm from '../components/ContactForm'
import toast from 'react-hot-toast'

export default function Contacts() {
  const navigate = useNavigate()
  const [data, setData] = useState({ items: [], total: 0, pages: 1 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = (p = page, s = search) => {
    setLoading(true)
    contactsApi.list({ page: p, size: 20, search: s || undefined })
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    load(1, search)
  }

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editing) {
        await contactsApi.update(editing.id, form)
        toast.success('Contact updated')
      } else {
        await contactsApi.create(form)
        toast.success('Contact created')
      }
      setShowModal(false)
      setEditing(null)
      load()
    } catch {
      toast.error('Failed to save contact')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return
    try {
      await contactsApi.delete(id)
      toast.success('Contact deleted')
      load()
    } catch {
      toast.error('Failed to delete contact')
    }
  }

  const columns = [
    { key: 'name', label: 'Name', render: r => <button onClick={() => navigate(`/contacts/${r.id}`)} className="font-medium text-primary-600 hover:underline text-left">{r.name}</button> },
    { key: 'email', label: 'Email', render: r => r.email || <span className="text-gray-400">—</span> },
    { key: 'phone', label: 'Phone', render: r => r.phone || <span className="text-gray-400">—</span> },
    { key: 'company', label: 'Company', render: r => r.company || <span className="text-gray-400">—</span> },
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
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500">{data.total} total</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true) }}>
          <PlusIcon className="h-4 w-4" /> New Contact
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…" className="input pl-9" />
        </div>
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      <DataTable columns={columns} data={data.items} loading={loading} page={page} pages={data.pages} onPageChange={setPage} emptyMessage="No contacts yet. Create your first one!" />

      {showModal && (
        <Modal title={editing ? 'Edit Contact' : 'New Contact'} onClose={() => { setShowModal(false); setEditing(null) }}>
          <ContactForm initial={editing ?? {}} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditing(null) }} loading={saving} />
        </Modal>
      )}
    </div>
  )
}
