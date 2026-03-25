import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  HomeIcon, UsersIcon, FunnelIcon,
  ClipboardDocumentListIcon, ViewColumnsIcon,
  ChartBarIcon, ShieldCheckIcon, ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid,
  UsersIcon as UsersSolid,
  FunnelIcon as FunnelSolid,
  ClipboardDocumentListIcon as ClipboardSolid,
  ViewColumnsIcon as ColumnsSolid,
  ChartBarIcon as ChartSolid,
} from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'

/* Each section has a unique accent color */
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      {
        to: '/dashboard', label: 'Dashboard', hint: 'Your command center',
        icon: HomeIcon, activeIcon: HomeSolid,
        color: '#818cf8', glow: 'rgba(99,102,241,0.25)',
      },
    ],
  },
  {
    label: 'CRM',
    items: [
      {
        to: '/contacts', label: 'Contacts', hint: 'People & companies',
        icon: UsersIcon, activeIcon: UsersSolid,
        color: '#22d3ee', glow: 'rgba(6,182,212,0.25)',
      },
      {
        to: '/leads', label: 'Leads', hint: 'Deals in progress',
        icon: FunnelIcon, activeIcon: FunnelSolid,
        color: '#fbbf24', glow: 'rgba(245,158,11,0.25)',
      },
      {
        to: '/activities', label: 'Activities', hint: 'Calls, emails & tasks',
        icon: ClipboardDocumentListIcon, activeIcon: ClipboardSolid,
        color: '#c084fc', glow: 'rgba(168,85,247,0.25)',
      },
      {
        to: '/kanban', label: 'Pipeline', hint: 'Drag-and-drop board',
        icon: ViewColumnsIcon, activeIcon: ColumnsSolid,
        color: '#34d399', glow: 'rgba(16,185,129,0.25)',
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      {
        to: '/reports', label: 'Reports', hint: 'Charts & analytics',
        icon: ChartBarIcon, activeIcon: ChartSolid,
        color: '#fb7185', glow: 'rgba(244,63,94,0.25)',
      },
    ],
  },
]

function Tooltip({ label, hint }) {
  return (
    <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
                    opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
      <div className="rounded-xl px-3 py-2 text-sm shadow-xl border border-white/10"
        style={{ background: '#1a2035' }}>
        <p className="font-semibold text-white leading-tight">{label}</p>
        {hint && <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{hint}</p>}
        {/* Arrow */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
          style={{ borderRightColor: '#1a2035' }} />
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar_collapsed') === 'true'
  )

  const toggle = () => {
    setCollapsed(c => {
      localStorage.setItem('sidebar_collapsed', String(!c))
      return !c
    })
  }

  const initials = user?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside
      className="flex flex-col shrink-0 relative overflow-visible z-40"
      style={{
        width: collapsed ? 68 : 230,
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        background: 'linear-gradient(180deg, #090e1a 0%, #0d1424 60%, #090e1a 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Top ambient glow */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

      {/* ── Logo row ──────────────────────────────── */}
      <div className="h-16 flex items-center shrink-0 relative z-10 overflow-hidden"
        style={{ paddingLeft: collapsed ? 18 : 16, transition: 'padding 0.22s' }}>
        <Link to="/landing" className="flex items-center gap-2.5 shrink-0 group" title="Go to home page">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shrink-0 transition-transform duration-150 group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', boxShadow: '0 0 18px rgba(99,102,241,0.4)' }}>
            <span className="text-white font-black text-sm select-none">N</span>
          </div>
          {!collapsed && (
            <span className="text-white font-bold text-[17px] tracking-tight whitespace-nowrap group-hover:opacity-80 transition-opacity">
              Nex<span style={{ color: '#818cf8' }}>CRM</span>
            </span>
          )}
        </Link>
      </div>

      <div className="mx-3 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── Navigation ────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-visible py-3 space-y-0.5"
        style={{ padding: collapsed ? '12px 8px' : '12px 8px' }}>

        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-1">
            {/* Section label */}
            {!collapsed && (
              <p className="px-3 pt-2 pb-1.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                style={{ color: 'rgba(148,163,184,0.4)' }}>
                {group.label}
              </p>
            )}
            {collapsed && <div className="h-3" />}

            {group.items.map(({ to, label, hint, icon: Icon, activeIcon: ActiveIcon, color, glow }) => (
              <NavLink
                key={to}
                to={to}
                className="relative flex items-center rounded-xl transition-all duration-150 group"
                style={({ isActive }) => ({
                  height: 40,
                  margin: '1px 0',
                  paddingLeft: collapsed ? 12 : 10,
                  paddingRight: collapsed ? 12 : 10,
                  gap: 10,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: isActive ? `rgba(${hexToRgb(color)}, 0.12)` : 'transparent',
                  boxShadow: isActive ? `inset 0 0 0 1px rgba(${hexToRgb(color)}, 0.2)` : 'none',
                })}
              >
                {({ isActive }) => (
                  <>
                    {/* Active left bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                        style={{ background: color }} />
                    )}

                    {/* Icon box */}
                    <span
                      className="flex items-center justify-center rounded-lg shrink-0 transition-all duration-150"
                      style={{
                        width: 28, height: 28,
                        background: isActive ? `rgba(${hexToRgb(color)}, 0.18)` : 'transparent',
                        boxShadow: isActive ? `0 0 10px ${glow}` : 'none',
                      }}
                    >
                      {isActive
                        ? <ActiveIcon style={{ width: 16, height: 16, color }} />
                        : <Icon style={{ width: 16, height: 16, color: '#475569' }} className="group-hover:!text-slate-300 transition-colors" />
                      }
                    </span>

                    {/* Label */}
                    {!collapsed && (
                      <span className="text-[13px] font-medium leading-none truncate"
                        style={{ color: isActive ? '#e2e8f0' : '#64748b' }}>
                        {label}
                      </span>
                    )}

                    {/* Active dot */}
                    {isActive && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: color, boxShadow: `0 0 6px ${glow}` }} />
                    )}

                    {/* Tooltip when collapsed */}
                    {collapsed && <Tooltip label={label} hint={hint} />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Bottom section ─────────────────────────── */}
      <div className="shrink-0 relative z-10 pb-3" style={{ padding: collapsed ? '0 8px 12px' : '0 8px 12px' }}>
        <div className="h-px mb-2 mx-1" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Admin link */}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className="relative flex items-center rounded-xl transition-all duration-150 group mb-1"
            style={({ isActive }) => ({
              height: 40,
              paddingLeft: collapsed ? 0 : 10, paddingRight: collapsed ? 0 : 10,
              gap: 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: isActive ? 'rgba(139,92,246,0.12)' : 'transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <span className="flex items-center justify-center rounded-lg shrink-0"
                  style={{
                    width: 28, height: 28,
                    background: isActive ? 'rgba(139,92,246,0.18)' : 'transparent',
                  }}>
                  <ShieldCheckIcon style={{ width: 16, height: 16, color: isActive ? '#a78bfa' : '#475569' }} />
                </span>
                {!collapsed && (
                  <span className="text-[13px] font-medium" style={{ color: isActive ? '#ddd6fe' : '#64748b' }}>
                    Admin Panel
                  </span>
                )}
                {collapsed && <Tooltip label="Admin Panel" hint="Manage users & settings" />}
              </>
            )}
          </NavLink>
        )}


        {/* User pill — clicks to Settings */}
        <NavLink
          to="/settings"
          className="relative flex items-center rounded-xl group transition-all duration-150"
          style={({ isActive }) => ({
            height: 44,
            paddingLeft: collapsed ? 0 : 10, paddingRight: collapsed ? 0 : 10,
            gap: 9,
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: isActive ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
            boxShadow: isActive ? 'inset 0 0 0 1px rgba(99,102,241,0.2)' : 'none',
            transition: 'padding 0.22s, background 0.15s',
          })}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold transition-transform duration-150 group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #818cf8, #4f46e5)' }}>
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate leading-tight group-hover:text-white transition-colors" style={{ color: '#cbd5e1' }}>{user?.full_name}</p>
              <p className="text-[10px] truncate leading-tight" style={{ color: '#475569' }}>
                {user?.role === 'admin' ? '👑 Admin' : 'Member'}
              </p>
            </div>
          )}
          {collapsed && <Tooltip label={user?.full_name} hint="Settings & profile" />}
        </NavLink>
      </div>

      {/* ── Collapse toggle ─────────────────────────── */}
      <button
        onClick={toggle}
        className="absolute -right-3.5 top-[68px] w-7 h-7 rounded-full flex items-center justify-center
                   border transition-all duration-150 hover:scale-110 z-50"
        style={{
          background: '#161d2e',
          borderColor: 'rgba(255,255,255,0.1)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          color: '#64748b',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRightIcon style={{ width: 13, height: 13 }} />
          : <ChevronLeftIcon  style={{ width: 13, height: 13 }} />
        }
      </button>
    </aside>
  )
}

/* Hex color → "r,g,b" string for rgba() */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
