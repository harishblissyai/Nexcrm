import client from './client'

export const dashboardApi = {
  stats: () => client.get('/dashboard/stats'),
  search: (q) => client.get('/search', { params: { q } }),
}
