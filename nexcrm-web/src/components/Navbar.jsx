import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  MagnifyingGlassIcon, ArrowRightOnRectangleIcon,
  SunIcon, MoonIcon, Cog6ToothIcon, UserCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { dashboardApi } from '../api/dashboard'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, logout }          = useAuth()
  const { dark, toggle }          = useTheme()
  const navigate                  = useNavigate()
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState(null)
  const [searching, setSearching] = useState(false)
  const [userMenu, setUserMenu]   = useState(false)
  const menuRef                   = useRef(null)

  const initials = user?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  /* Close menu on outside click */
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      const data = await dashboardApi.search(query)
      setResults(data)
    } finally {
      setSearching(false)
    }
  }

  return (
    <header className="h-16 flex items-center px-5 gap-4 shrink-0 sticky top-0 z-30
                        border-b border-slate-200/60 dark:border-slate-800/60
                        bg-slate-50/90 dark:bg-[#080c14]/90 backdrop-blur-xl">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
        )}
        <input
          type="search"
          placeholder="Search contacts, leads…"
          value={query}
          onChange={e => { setQuery(e.target.value); if (!e.target.value) setResults(null) }}
          className="w-full h-9 pl-9 pr-3 text-sm rounded-xl border border-slate-200 bg-slate-100/70
                     placeholder-slate-400 transition-all duration-150
                     focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 focus:outline-none
                     dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500
                     dark:focus:bg-slate-800 dark:focus:border-primary-500"
        />
        {results && (
          <div className="absolute top-full mt-2 left-0 w-full min-w-[320px] bg-white dark:bg-slate-900
                          border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50
                          max-h-72 overflow-y-auto animate-fade-in">
            {results.contacts.length === 0 && results.leads.length === 0 ? (
              <p className="p-5 text-sm text-slate-400 text-center">No results for "{query}"</p>
            ) : (
              <>
                {results.contacts.length > 0 && (
                  <div>
                    <p className="px-4 pt-3.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contacts</p>
                    {results.contacts.map(c => (
                      <button key={c.id}
                        onClick={() => { navigate(`/contacts/${c.id}`); setResults(null); setQuery('') }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                          <span className="text-primary-600 dark:text-primary-400 text-xs font-bold">{c.name?.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{c.name}</span>
                        {c.company && <span className="text-slate-400 text-xs ml-1">· {c.company}</span>}
                      </button>
                    ))}
                  </div>
                )}
                {results.leads.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leads</p>
                    {results.leads.map(l => (
                      <button key={l.id}
                        onClick={() => { navigate(`/leads/${l.id}`); setResults(null); setQuery('') }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200 flex-1">{l.title}</span>
                        <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">{l.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </form>

      <div className="flex items-center gap-1 ml-auto">
        {/* Theme toggle */}
        <button onClick={toggle} className="btn-ghost p-2" title={dark ? 'Light mode' : 'Dark mode'}>
          {dark ? <SunIcon className="h-5 w-5 text-amber-400" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        <NotificationBell />

        <div className="h-7 w-px bg-slate-200 dark:bg-slate-700/80 mx-1" />

        {/* User dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenu(o => !o)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, #818cf8, #4f46e5)' }}>
              {initials}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <Link
                to="/settings"
                onClick={e => e.stopPropagation()}
                className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {user?.full_name}
              </Link>
              <p className="text-xs text-slate-400">{user?.role === 'admin' ? '👑 Admin' : 'Member'}</p>
            </div>
            <ChevronDownIcon className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${userMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown menu */}
          {userMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 animate-fade-in overflow-hidden">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="py-1.5">
                <Link
                  to="/settings"
                  onClick={() => setUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <Cog6ToothIcon className="h-4 w-4 text-slate-400" />
                  Settings
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <UserCircleIcon className="h-4 w-4 text-slate-400" />
                  Edit Profile
                </Link>
              </div>

              <div className="py-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => { logout(); setUserMenu(false) }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors w-full text-left"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
