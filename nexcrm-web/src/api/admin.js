import client from './client'

export const adminApi = {
  stats: () => client.get('/admin/stats'),
  users: () => client.get('/admin/users'),
  updateRole: (id, role) => client.patch(`/admin/users/${id}/role`, { role }),
  toggleActive: (id) => client.patch(`/admin/users/${id}/toggle-active`),
}
