import client from './client'

export const activitiesApi = {
  list: (params) => client.get('/activities', { params }),
  get: (id) => client.get(`/activities/${id}`),
  create: (data) => client.post('/activities', data),
  update: (id, data) => client.put(`/activities/${id}`, data),
  delete: (id) => client.delete(`/activities/${id}`),
}
