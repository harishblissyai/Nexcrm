import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  UsersIcon, FunnelIcon, ClipboardDocumentListIcon,
  CheckCircleIcon, ExclamationCircleIcon, ClockIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import StatCard from '../components/StatCard'
import { dashboardApi } from '../api/dashboard'
import { activitiesApi } from '../api/activities'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  New: 'bg-gray-100 text-gray-700',
  Contacted: 'bg-blue-100 text-blue-700',
  Qualified: 'bg-yellow-100 text-yellow-700',
  ClosedWon: 'bg-green-100 text-green-700',
  ClosedLost: 'bg-red-100 text-red-700',
}

const ACTIVITY_ICONS = { Call: '📞', Email: '✉️', Meeting: '🤝', Note: '📝' }

function TaskItem({ task, onDone }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()
  return (
    <li className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <button
        onClick={() => onDone(task.id)}
        className="mt-0.5 shrink-0 text-gray-300 hover:text-green-500 transition-colors"
        title="Mark done"
      >
        <CheckCircleSolid className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">{task.subject}</p>
        <p className={`text-xs mt-0.5 flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          {isOverdue && <ExclamationCircleIcon className="h-3.5 w-3.5" />}
          Due: {new Date(task.due_date).toLocaleString()}
        </p>
      </div>
      <span className="text-xs text-gray-400 shrink-0">{ACTIVITY_ICONS[task.type]}</span>
    </li>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => dashboardApi.stats().then(setStats).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleMarkDone = async (id) => {
    try {
      await activitiesApi.markDone(id)
      toast.success('Marked as done')
      load()
    } catch { toast.error('Failed') }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )

  const openLeads = stats
    ? (stats.leads_by_status.New || 0) + (stats.leads_by_status.Contacted || 0) + (stats.leads_by_status.Qualified || 0)
    : 0

  const allTasks = [
    ...(stats?.overdue_tasks || []),
    ...(stats?.due_today_tasks || []).filter(t => !(stats?.overdue_tasks || []).find(o => o.id === t.id)),
  ]

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
        <StatCard
          label="Overdue Tasks"
          value={stats?.overdue_count ?? 0}
          icon={ExclamationCircleIcon}
          color={stats?.overdue_count > 0 ? 'red' : 'green'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* Tasks widget */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gray-400" /> My Tasks
            </h2>
            <div className="flex gap-2">
              {stats?.overdue_count > 0 && (
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                  {stats.overdue_count} overdue
                </span>
              )}
              {stats?.due_today_count > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-600 font-semibold px-2 py-0.5 rounded-full">
                  {stats.due_today_count} today
                </span>
              )}
            </div>
          </div>
          {allTasks.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">All caught up!</p>
            </div>
          ) : (
            <ul>
              {allTasks.map(t => (
                <TaskItem key={t.id} task={t} onDone={handleMarkDone} />
              ))}
            </ul>
          )}
          <Link to="/activities" className="text-sm text-primary-600 hover:underline mt-3 block">View all activities →</Link>
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
