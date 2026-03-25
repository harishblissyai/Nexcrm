import client from './client'

export const activitiesApi = {
  list: (params) => client.get('/activities', { params }),
  get: (id) => client.get(`/activities/${id}`),
  create: (data) => client.post('/activities', data),
  update: (id, data) => client.put(`/activities/${id}`, data),
  delete: (id) => client.delete(`/activities/${id}`),
  markDone: (id) => client.patch(`/activities/${id}/done`),
  overdue: () => client.get('/activities/overdue'),
  dueToday: () => client.get('/activities/due-today'),
}
