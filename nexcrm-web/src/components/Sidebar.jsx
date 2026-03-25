import { NavLink } from 'react-router-dom'
import {
  HomeIcon, UsersIcon, FunnelIcon,
  ClipboardDocumentListIcon, ViewColumnsIcon,
  ChartBarIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/contacts',  label: 'Contacts',  icon: UsersIcon },
  { to: '/leads',     label: 'Leads',     icon: FunnelIcon },
  { to: '/activities',label: 'Activities',icon: ClipboardDocumentListIcon },
  { to: '/kanban',    label: 'Pipeline',  icon: ViewColumnsIcon },
  { to: '/reports',   label: 'Reports',   icon: ChartBarIcon },
]

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="w-60 bg-gray-900 flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-700">
        <span className="text-white font-bold text-xl tracking-tight">
          Nex<span className="text-primary-400">CRM</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-gray-700 space-y-1">
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-400 hover:bg-gray-800 hover:text-purple-300'
              )
            }
          >
            <ShieldCheckIcon className="h-5 w-5 shrink-0" />
            Admin
          </NavLink>
        )}
        <p className="text-xs text-gray-600 px-3 pt-1">
          NexCRM v1.0 · {user?.role === 'admin' ? '👑 Admin' : 'Member'}
        </p>
      </div>
    </aside>
  )
}
