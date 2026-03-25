import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UsersIcon, FunnelIcon, ClipboardDocumentListIcon,
  CheckCircleIcon, ExclamationCircleIcon, ClockIcon,
  PlusIcon, ViewColumnsIcon, ChartBarIcon,
  LightBulbIcon, ChevronDownIcon, ChevronUpIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import StatCard from '../components/StatCard'
import { dashboardApi } from '../api/dashboard'
import { activitiesApi } from '../api/activities'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  New:        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  Contacted:  'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Qualified:  'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ClosedWon:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ClosedLost: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}
const STATUS_BAR = {
  New: 'bg-slate-400', Contacted: 'bg-blue-500',
  Qualified: 'bg-amber-500', ClosedWon: 'bg-emerald-500', ClosedLost: 'bg-rose-500',
}
const ACTIVITY_ICONS = { Call: '📞', Email: '✉️', Meeting: '🤝', Note: '📝' }

/* ── Quick action card ─────────────────────────────────── */
function QuickAction({ icon: Icon, label, desc, to, color, iconColor }) {
  return (
    <Link
      to={to}
      className="card p-4 flex items-center gap-3.5 group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105"
        style={{ background: color }}>
        <Icon className="h-5 w-5" style={{ color: iconColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{desc}</p>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-slate-300 group-hover:text-slate-500 dark:group-hover:text-slate-400 shrink-0 transition-colors" />
    </Link>
  )
}

/* ── How-to guide ──────────────────────────────────────── */
const GUIDE_STEPS = [
  {
    step: '1', icon: '👤', title: 'Add your first contact',
    desc: 'Go to Contacts → click "+ New Contact". Fill in name, email, company. Contacts are people you do business with.',
    to: '/contacts', cta: 'Go to Contacts',
  },
  {
    step: '2', icon: '🎯', title: 'Create a lead',
    desc: 'Go to Leads → "+ New Lead". Link it to a contact, set the deal value and status (New → Contacted → Qualified → Closed).',
    to: '/leads', cta: 'Go to Leads',
  },
  {
    step: '3', icon: '📋', title: 'Log an activity',
    desc: 'Track calls, emails, meetings or notes. Go to Activities → "+ New Activity". Set a due date to get reminders.',
    to: '/activities', cta: 'Log Activity',
  },
  {
    step: '4', icon: '📊', title: 'Track your pipeline',
    desc: 'Use the Pipeline (Kanban) board to drag deals between stages. Use Reports to see revenue trends and team performance.',
    to: '/kanban', cta: 'View Pipeline',
  },
]

function HowToGuide() {
  const [open, setOpen] = useState(false)

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))' }}>
          <LightBulbIcon className="h-4 w-4 text-primary-500" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">How to use NexCRM</p>
          <p className="text-xs text-slate-400">Get started in 4 simple steps</p>
        </div>
        {open
          ? <ChevronUpIcon className="h-4 w-4 text-slate-400 shrink-0" />
          : <ChevronDownIcon className="h-4 w-4 text-slate-400 shrink-0" />
        }
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 animate-fade-in">
          {GUIDE_STEPS.map(s => (
            <div key={s.step} className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl leading-none">{s.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500">Step {s.step}</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">{s.desc}</p>
              <Link
                to={s.to}
                className="mt-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 w-fit"
              >
                {s.cta} <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Task row ──────────────────────────────────────────── */
function TaskItem({ task, onDone }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()
  return (
    <li className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
      <button
        onClick={() => onDone(task.id)}
        className="mt-0.5 shrink-0 text-slate-300 dark:text-slate-600 hover:text-emerald-500 transition-colors"
        title="Click to mark as done"
      >
        <CheckCircleSolid className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{task.subject}</p>
        <p className={`text-xs mt-0.5 flex items-center gap-1 ${isOverdue ? 'text-rose-500 font-semibold' : 'text-slate-400'}`}>
          {isOverdue && <ExclamationCircleIcon className="h-3.5 w-3.5" />}
          {isOverdue ? 'Overdue · ' : 'Due: '}{new Date(task.due_date).toLocaleString()}
        </p>
      </div>
      <span className="text-sm shrink-0">{ACTIVITY_ICONS[task.type]}</span>
    </li>
  )
}

/* ── Main page ─────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats]     = useState(null)
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
      <div className="h-8 w-8 rounded-full border-[3px] border-primary-500/20 border-t-primary-500 animate-spin" />
    </div>
  )

  const openLeads = stats
    ? (stats.leads_by_status.New || 0) + (stats.leads_by_status.Contacted || 0) + (stats.leads_by_status.Qualified || 0)
    : 0

  const allTasks = [
    ...(stats?.overdue_tasks || []),
    ...(stats?.due_today_tasks || []).filter(t => !(stats?.overdue_tasks || []).find(o => o.id === t.id)),
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.full_name?.split(' ')[0]

  return (
    <div className="space-y-5 animate-slide-up max-w-[1400px]">

      {/* ── Page header ──────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{greeting}, {firstName} 👋</h1>
          <p className="page-subtitle">Here's what's happening across your CRM today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/contacts" className="block group">
          <StatCard label="Total Contacts" value={stats?.total_contacts} icon={UsersIcon} color="primary" trend="Click to manage →" />
        </Link>
        <Link to="/leads" className="block">
          <StatCard label="Total Leads" value={stats?.total_leads} icon={FunnelIcon} color="yellow" trend="Click to view →" />
        </Link>
        <Link to="/kanban" className="block">
          <StatCard label="Open Leads" value={openLeads} icon={ClipboardDocumentListIcon} color="green" trend="Click for pipeline →" />
        </Link>
        <Link to="/activities" className="block">
          <StatCard
            label="Overdue Tasks"
            value={stats?.overdue_count ?? 0}
            icon={ExclamationCircleIcon}
            color={stats?.overdue_count > 0 ? 'red' : 'green'}
            trend={stats?.overdue_count > 0 ? 'Needs attention !' : 'All on track ✓'}
          />
        </Link>
      </div>

      {/* ── How-to guide (collapsible) ────────────── */}
      <HowToGuide />

      {/* ── Quick Actions ────────────────────────── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction
            to="/contacts"
            icon={UsersIcon}
            label="New Contact"
            desc="Add a person or company"
            color="rgba(99,102,241,0.1)"
            iconColor="#6366f1"
          />
          <QuickAction
            to="/leads"
            icon={FunnelIcon}
            label="New Lead"
            desc="Start tracking a deal"
            color="rgba(245,158,11,0.1)"
            iconColor="#f59e0b"
          />
          <QuickAction
            to="/activities"
            icon={ClipboardDocumentListIcon}
            label="Log Activity"
            desc="Record a call, email or note"
            color="rgba(168,85,247,0.1)"
            iconColor="#a855f7"
          />
          <QuickAction
            to="/kanban"
            icon={ViewColumnsIcon}
            label="View Pipeline"
            desc="Drag & drop your deals"
            color="rgba(16,185,129,0.1)"
            iconColor="#10b981"
          />
        </div>
      </div>

      {/* ── Widgets row ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Lead Pipeline */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Lead Pipeline</h2>
            <Link to="/leads" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold flex items-center gap-0.5">
              View all <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats && Object.entries(stats.leads_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className={`badge ${STATUS_COLORS[status]} w-24 justify-center text-xs shrink-0`}>{status}</span>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${STATUS_BAR[status] || 'bg-primary-500'} h-1.5 rounded-full transition-all duration-700`}
                    style={{ width: stats.total_leads ? `${(count / stats.total_leads) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-4 text-right tabular-nums">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <Link to="/kanban"
              className="flex-1 text-center text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-center gap-1">
              <ViewColumnsIcon className="h-3.5 w-3.5" /> Kanban Board
            </Link>
            <Link to="/reports"
              className="flex-1 text-center text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline flex items-center justify-center gap-1">
              <ChartBarIcon className="h-3.5 w-3.5" /> Reports
            </Link>
          </div>
        </div>

        {/* My Tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 text-slate-400" /> My Tasks
            </h2>
            <div className="flex gap-1.5">
              {stats?.overdue_count > 0 && (
                <span className="badge bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-[10px]">
                  {stats.overdue_count} overdue
                </span>
              )}
              {stats?.due_today_count > 0 && (
                <span className="badge bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                  {stats.due_today_count} today
                </span>
              )}
            </div>
          </div>

          {allTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
              <p className="text-xs text-slate-400 mt-0.5">No pending or overdue tasks</p>
            </div>
          ) : (
            <ul>
              {allTasks.slice(0, 4).map(t => (
                <TaskItem key={t.id} task={t} onDone={handleMarkDone} />
              ))}
            </ul>
          )}

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              💡 Click the circle to mark a task done
            </span>
            <Link to="/activities" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold flex items-center gap-0.5">
              All <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Activity</h2>
            <Link to="/activities" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold flex items-center gap-0.5">
              View all <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          {!stats?.recent_activities?.length ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400">No activities logged yet.</p>
              <Link to="/activities" className="btn-primary mt-3 text-xs inline-flex py-1.5 px-3">
                <PlusIcon className="h-3.5 w-3.5" /> Log first activity
              </Link>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {stats.recent_activities.map(a => (
                <li key={a.id} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-base leading-none">
                    {ACTIVITY_ICONS[a.type] ?? '📌'}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{a.subject}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!!stats?.recent_activities?.length && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link to="/activities" className="btn-secondary w-full text-xs py-1.5">
                <PlusIcon className="h-3.5 w-3.5" /> New Activity
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
