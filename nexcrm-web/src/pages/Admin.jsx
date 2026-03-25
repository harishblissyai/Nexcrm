import { useEffect, useState } from 'react'
import {
  UsersIcon, ShieldCheckIcon, FunnelIcon,
  ClipboardDocumentListIcon, UserCircleIcon,
} from '@heroicons/react/24/outline'
import { adminApi } from '../api/admin'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import StatCard from '../components/StatCard'
import toast from 'react-hot-toast'

export default function Admin() {
  const { user }  = useAuth()
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  if (user && user.role !== 'admin') return <Navigate to="/dashboard" replace />

  const load = () => {
    setLoading(true)
    adminApi.stats().then(setStats).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRoleChange = async (userId, newRole) => {
    setSaving(userId)
    try {
      await adminApi.updateRole(userId, newRole)
      toast.success(`Role updated to ${newRole}`)
      load()
    } catch (e) {
      toast.error(e?.detail || 'Failed')
    } finally { setSaving(null) }
  }

  const handleToggleActive = async (userId, isActive) => {
    setSaving(userId)
    try {
      await adminApi.toggleActive(userId)
      toast.success(isActive ? 'User deactivated' : 'User activated')
      load()
    } catch (e) {
      toast.error(e?.detail || 'Failed')
    } finally { setSaving(null) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="h-8 w-8 rounded-full border-[3px] border-primary-500/20 border-t-primary-500 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-5xl animate-slide-up">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <ShieldCheckIcon className="h-7 w-7 text-violet-500" /> Admin Panel
        </h1>
        <p className="page-subtitle">Manage users, roles, and system overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Users"      value={stats?.total_users}     icon={UsersIcon}                 color="primary" />
        <StatCard label="Admins"     value={stats?.admins}          icon={ShieldCheckIcon}           color="violet" />
        <StatCard label="Contacts"   value={stats?.total_contacts}  icon={UserCircleIcon}            color="primary" />
        <StatCard label="Leads"      value={stats?.total_leads}     icon={FunnelIcon}                color="yellow" />
        <StatCard label="Won"        value={stats?.won_leads}       icon={FunnelIcon}                color="green" />
        <StatCard label="Activities" value={stats?.total_activities}icon={ClipboardDocumentListIcon} color="primary" />
      </div>

      {/* User management */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">Team Members</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage roles and account status</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
                {['User', 'Role', 'Contacts', 'Leads', 'Activities', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider ${i === 0 ? 'text-left pl-6' : i === 5 ? 'text-right pr-6' : 'text-center'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
              {stats?.user_summary?.map(u => (
                <tr key={u.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors ${!u.is_active ? 'opacity-50' : ''}`}>
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg, #818cf8, #4f46e5)' }}>
                        {u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          {u.full_name}
                          {u.id === user?.id && <span className="text-[10px] text-slate-400 font-normal">(you)</span>}
                        </p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Role badge */}
                  <td className="px-4 py-4">
                    <span className={`badge ${
                      u.role === 'admin'
                        ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {u.role === 'admin' && <ShieldCheckIcon className="h-3 w-3 mr-1 inline" />}
                      {u.role}
                    </span>
                  </td>
                  {/* Counts */}
                  <td className="px-4 py-4 text-center">
                    <span className="font-bold text-slate-600 dark:text-slate-400 tabular-nums">{u.contacts}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-bold text-slate-600 dark:text-slate-400 tabular-nums">{u.leads}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-bold text-slate-600 dark:text-slate-400 tabular-nums">{u.activities}</span>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {u.id !== user?.id && (
                        <>
                          <select
                            value={u.role}
                            disabled={saving === u.id}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5
                                       bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
                                       focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleToggleActive(u.id, u.is_active)}
                            disabled={saving === u.id}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                              u.is_active
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/20 dark:text-rose-400'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20 dark:text-emerald-400'
                            }`}
                          >
                            {saving === u.id ? '…' : u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity bar chart */}
      <div className="card p-5">
        <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Activity by Member</h2>
        <div className="space-y-3">
          {stats?.user_summary?.map(u => {
            const total = u.contacts + u.leads + u.activities
            const max   = Math.max(...stats.user_summary.map(x => x.contacts + x.leads + x.activities), 1)
            return (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #818cf8, #4f46e5)' }}>
                  {u.full_name[0]}
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300 w-28 truncate">{u.full_name}</span>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(total / max) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-20 text-right tabular-nums">
                  {u.contacts}C · {u.leads}L · {u.activities}A
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
