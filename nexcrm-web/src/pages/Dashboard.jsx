import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UsersIcon, FunnelIcon, ClipboardDocumentListIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import StatCard from '../components/StatCard'
import { dashboardApi } from '../api/dashboard'

const STATUS_COLORS = {
  New: 'bg-gray-100 text-gray-700',
  Contacted: 'bg-blue-100 text-blue-700',
  Qualified: 'bg-yellow-100 text-yellow-700',
  ClosedWon: 'bg-green-100 text-green-700',
  ClosedLost: 'bg-red-100 text-red-700',
}

const ACTIVITY_ICONS = {
  Call: '📞', Email: '✉️', Meeting: '🤝', Note: '📝',
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.stats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )

  const openLeads = stats
    ? (stats.leads_by_status.New || 0) + (stats.leads_by_status.Contacted || 0) + (stats.leads_by_status.Qualified || 0)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back — here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Contacts" value={stats?.total_contacts} icon={UsersIcon} color="primary" />
        <StatCard label="Total Leads" value={stats?.total_leads} icon={FunnelIcon} color="yellow" />
        <StatCard label="Open Leads" value={openLeads} icon={ClipboardDocumentListIcon} color="green" />
        <StatCard label="Won Leads" value={stats?.leads_by_status?.ClosedWon} icon={CheckCircleIcon} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Lead Pipeline</h2>
          <div className="space-y-3">
            {stats && Object.entries(stats.leads_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className={`badge ${STATUS_COLORS[status]} w-28 justify-center`}>{status}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: stats.total_leads ? `${(count / stats.total_leads) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
          <Link to="/leads" className="text-sm text-primary-600 hover:underline mt-4 block">View all leads →</Link>
        </div>

        {/* Recent Activities */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Activities</h2>
          {stats?.recent_activities?.length === 0 ? (
            <p className="text-sm text-gray-400">No activities yet. <Link to="/activities" className="text-primary-600 hover:underline">Log one →</Link></p>
          ) : (
            <ul className="space-y-3">
              {stats?.recent_activities?.map(a => (
                <li key={a.id} className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">{ACTIVITY_ICONS[a.type] ?? '📌'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.subject}</p>
                    <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/activities" className="text-sm text-primary-600 hover:underline mt-4 block">View all activities →</Link>
        </div>
      </div>
    </div>
  )
}
