import client from './client'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const API_BASE = BASE_URL ? `${BASE_URL}/api` : '/api'

export const leadsApi = {
  list: (params) => client.get('/leads', { params }),
  get: (id) => client.get(`/leads/${id}`),
  create: (data) => client.post('/leads', data),
  update: (id, data) => client.put(`/leads/${id}`, data),
  updateStatus: (id, status) => client.patch(`/leads/${id}/status`, { status }),
  delete: (id) => client.delete(`/leads/${id}`),
  exportCsv: () => {
    const token = localStorage.getItem('token')
    const url = `${API_BASE}/leads/export/csv`
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = objectUrl
        a.download = 'leads.csv'
        a.click()
        URL.revokeObjectURL(objectUrl)
      })
  },
}
