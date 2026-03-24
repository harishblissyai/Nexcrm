import client from './client'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const API_BASE = BASE_URL ? `${BASE_URL}/api` : '/api'

export const contactsApi = {
  list: (params) => client.get('/contacts', { params }),
  get: (id) => client.get(`/contacts/${id}`),
  create: (data) => client.post('/contacts', data),
  update: (id, data) => client.put(`/contacts/${id}`, data),
  delete: (id) => client.delete(`/contacts/${id}`),
  exportCsv: () => {
    const token = localStorage.getItem('token')
    const url = `${API_BASE}/contacts/export/csv`
    const a = document.createElement('a')
    a.href = url
    // Attach token via fetch then trigger download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob)
        a.href = objectUrl
        a.download = 'contacts.csv'
        a.click()
        URL.revokeObjectURL(objectUrl)
      })
  },
  timeline: (id) => client.get(`/contacts/${id}/timeline`),
  importCsv: (file) => {
    const form = new FormData()
    form.append('file', file)
    return client.post('/contacts/import/csv', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
