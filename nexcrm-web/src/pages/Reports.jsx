import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  UsersIcon, FunnelIcon, BoltIcon,
  TrophyIcon, CurrencyDollarIcon, CalendarDaysIcon,
} from '@heroicons/react/24/outline'
import { reportsApi } from '../api/reports'
import toast from 'react-hot-toast'

function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg px-3 py-2 text-xs">
      {label && <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Skeleton({ h = 'h-48' }) {
  return <div className={`${h} bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse`} />
}

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function Reports() {
  const [overview, setOverview]     = useState(null)
  const [monthly, setMonthly]       = useState([])
  const [funnel, setFunnel]         = useState([])
  const [activities, setActivities] = useState([])
  const [tags, setTags]             = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      reportsApi.overview(),
      reportsApi.leadsByMonth(),
      reportsApi.conversionFunnel(),
      reportsApi.activityBreakdown(),
      reportsApi.topTags(),
    ])
      .then(([ov, mo, fu, ac, tg]) => {
        setOverview(ov); setMonthly(mo); setFunnel(fu); setActivities(ac); setTags(tg)
      })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Live data from your CRM</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} h="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard icon={UsersIcon}          label="Total Contacts"  value={overview.total_contacts}     sub={`+${overview.new_contacts_this_month} this month`} color="bg-indigo-500" />
          <KpiCard icon={FunnelIcon}         label="Total Leads"     value={overview.total_leads}         sub={`+${overview.new_leads_this_month} this month`}   color="bg-blue-500" />
          <KpiCard icon={BoltIcon}           label="Activities"      value={overview.total_activities}   sub="All time"                                           color="bg-violet-500" />
          <KpiCard icon={TrophyIcon}         label="Win Rate"        value={`${overview.win_rate}%`}      sub="Closed won / total closed"                         color="bg-emerald-500" />
          <KpiCard icon={CurrencyDollarIcon} label="Pipeline Value"  value={fmt(overview.pipeline_value)} sub="Active deals"                                      color="bg-amber-500" />
          <KpiCard icon={CalendarDaysIcon}   label="Won Revenue"     value={fmt(overview.won_value)}      sub="Closed won"                                         color="bg-teal-500" />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Section title="Leads & Contacts — Last 6 Months">
          {loading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthly} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="leads"    stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Leads" />
                <Line type="monotone" dataKey="contacts" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Contacts" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Section>

        <Section title="Lead Pipeline Funnel">
          {loading ? <Skeleton /> : funnel.every(f => f.count === 0) ? (
            <p className="text-sm text-slate-400 text-center py-16">No lead data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnel} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Leads">
                  {funnel.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Section title="Activity Type Breakdown">
          {loading ? <Skeleton /> : activities.every(a => a.value === 0) ? (
            <p className="text-sm text-slate-400 text-center py-16">No activities logged yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie
                    data={activities}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={85}
                    dataKey="value"
                    labelLine={false}
                    label={renderPieLabel}
                  >
                    {activities.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5">
                {activities.map(a => (
                  <div key={a.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: a.fill }} />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{a.name}</span>
                    <span className="ml-auto text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">{a.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        <Section title="Top Tags">
          {loading ? <Skeleton /> : tags.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">No tags added yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tags} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="tag" tick={{ fontSize: 11 }} width={72} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Uses" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>
    </div>
  )
}
