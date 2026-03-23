import client from './client'

export const leadsApi = {
  list: (params) => client.get('/leads', { params }),
  get: (id) => client.get(`/leads/${id}`),
  create: (data) => client.post('/leads', data),
  update: (id, data) => client.put(`/leads/${id}`, data),
  updateStatus: (id, status) => client.patch(`/leads/${id}/status`, { status }),
  delete: (id) => client.delete(`/leads/${id}`),
}
