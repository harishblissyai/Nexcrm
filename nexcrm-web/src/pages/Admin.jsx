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

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  member: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

export default function Admin() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
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
      toast.error(e?.response?.data?.detail || 'Failed')
    } finally { setSaving(null) }
  }

  const handleToggleActive = async (userId, isActive) => {
    setSaving(userId)
    try {
      await adminApi.toggleActive(userId)
      toast.success(isActive ? 'User deactivated' : 'User activated')
      load()
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed')
    } finally { setSaving(null) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ShieldCheckIcon className="h-7 w-7 text-purple-600" /> Admin Panel
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage users, roles, and system overview</p>
      </div>

      {/* System stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Users" value={stats?.total_users} icon={UsersIcon} color="primary" />
        <StatCard label="Admins" value={stats?.admins} icon={ShieldCheckIcon} color="yellow" />
        <StatCard label="Contacts" value={stats?.total_contacts} icon={UserCircleIcon} color="primary" />
        <StatCard label="Leads" value={stats?.total_leads} icon={FunnelIcon} color="yellow" />
        <StatCard label="Won" value={stats?.won_leads} icon={FunnelIcon} color="green" />
        <StatCard label="Activities" value={stats?.total_activities} icon={ClipboardDocumentListIcon} color="primary" />
      </div>

      {/* User management table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Team Members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacts</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leads</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activities</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats?.user_summary?.map(u => (
                <tr key={u.id} className={`border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!u.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">
                          {u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                          {u.full_name}
                          {u.id === user?.id && <span className="text-xs text-gray-400">(you)</span>}
                        </p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${ROLE_COLORS[u.role]}`}>
                      {u.role === 'admin' && <ShieldCheckIcon className="h-3 w-3 mr-1" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{u.contacts}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{u.leads}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{u.activities}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {u.id !== user?.id && (
                        <>
                          <select
                            value={u.role}
                            disabled={saving === u.id}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleToggleActive(u.id, u.is_active)}
                            disabled={saving === u.id}
                            className={`text-xs px-3 py-1 rounded-lg font-medium border transition-colors ${
                              u.is_active
                                ? 'border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
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

      {/* Per-user activity bar chart */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Activity by Member</h2>
        <div className="space-y-3">
          {stats?.user_summary?.map(u => {
            const total = u.contacts + u.leads + u.activities
            const max = Math.max(...(stats.user_summary.map(x => x.contacts + x.leads + x.activities)), 1)
            return (
              <div key={u.id} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300 w-32 truncate">{u.full_name}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${(total / max) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">
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
