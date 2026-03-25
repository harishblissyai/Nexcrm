import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { dashboardApi } from '../api/dashboard'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)

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
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 gap-4 shrink-0">
      <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          placeholder="Search contacts, leads…"
          value={query}
          onChange={e => { setQuery(e.target.value); if (!e.target.value) setResults(null) }}
          className="input pl-9 py-1.5 text-sm"
        />
        {results && (
          <div className="absolute top-full mt-1 left-0 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
            {results.contacts.length === 0 && results.leads.length === 0 && (
              <p className="p-4 text-sm text-gray-500">No results found</p>
            )}
            {results.contacts.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Contacts</p>
                {results.contacts.map(c => (
                  <button key={c.id} onClick={() => { navigate(`/contacts/${c.id}`); setResults(null); setQuery('') }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200">
                    <span className="font-medium">{c.name}</span>
                    {c.company && <span className="text-gray-500"> · {c.company}</span>}
                  </button>
                ))}
              </div>
            )}
            {results.leads.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Leads</p>
                {results.leads.map(l => (
                  <button key={l.id} onClick={() => { navigate(`/leads/${l.id}`); setResults(null); setQuery('') }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200">
                    <span className="font-medium">{l.title}</span>
                    <span className="ml-2 badge bg-blue-100 text-blue-700">{l.status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Dark mode toggle */}
        <button onClick={toggle} className="btn-secondary p-2" title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {dark ? <SunIcon className="h-5 w-5 text-yellow-400" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        {/* Notification bell */}
        <NotificationBell />

        <div className="text-right ml-1">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.full_name}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <button onClick={logout} className="btn-secondary p-2" title="Logout">
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
