import { useState } from 'react'

const TYPES = ['Call', 'Email', 'Meeting', 'Note']

export default function ActivityForm({ initial = {}, contacts = [], leads = [], onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    type: initial.type ?? 'Call',
    subject: initial.subject ?? '',
    body: initial.body ?? '',
    contact_id: initial.contact_id ?? '',
    lead_id: initial.lead_id ?? '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.subject.trim()) e.subject = 'Subject is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      ...form,
      contact_id: form.contact_id ? Number(form.contact_id) : null,
      lead_id: form.lead_id ? Number(form.lead_id) : null,
    })
  }

  const set = (key) => (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })) }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Type</label>
          <select value={form.type} onChange={set('type')} className="input">
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Subject <span className="text-red-500">*</span></label>
          <input value={form.subject} onChange={set('subject')} placeholder="Activity subject" className={`input ${errors.subject ? 'border-red-400' : ''}`} />
          {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Contact</label>
          <select value={form.contact_id} onChange={set('contact_id')} className="input">
            <option value="">— None —</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Lead</label>
          <select value={form.lead_id} onChange={set('lead_id')} className="input">
            <option value="">— None —</option>
            {leads.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Notes / Body</label>
        <textarea value={form.body} onChange={set('body')} rows={4} placeholder="Details…" className="input resize-none" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? 'Saving…' : 'Save Activity'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
