import client from './client'

export const reportsApi = {
  overview:          () => client.get('/reports/overview'),
  leadsByMonth:      () => client.get('/reports/leads-by-month'),
  conversionFunnel:  () => client.get('/reports/conversion-funnel'),
  activityBreakdown: () => client.get('/reports/activity-breakdown'),
  topTags:           () => client.get('/reports/top-tags'),
}
