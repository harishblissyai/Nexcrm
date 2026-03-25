import { useEffect, useRef, useState } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { BellAlertIcon } from '@heroicons/react/24/solid'
import { notificationsApi } from '../api/notifications'
import { useNavigate } from 'react-router-dom'

const TYPE_ICONS = {
  overdue: '⏰',
  lead_status: '🔄',
  info: 'ℹ️',
}

const ENTITY_PATHS = {
  activity: '/activities',
  lead: '/leads',
}

export default function NotificationBell() {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  const fetchCount = () =>
    notificationsApi.unreadCount().then(d => setCount(d.count)).catch(() => {})

  const fetchAll = () => {
    setLoading(true)
    notificationsApi.list().then(setItems).finally(() => setLoading(false))
  }

  // Poll every 30s
  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    setOpen(o => !o)
    if (!open) fetchAll()
  }

  const handleClick = async (n) => {
    if (!n.is_read) {
      await notificationsApi.markRead(n.id)
      setItems(prev => prev.map(i => i.id === n.id ? { ...i, is_read: true } : i))
      setCount(c => Math.max(0, c - 1))
    }
    if (n.entity_type && n.entity_id) {
      navigate(`${ENTITY_PATHS[n.entity_type]}/${n.entity_id}`)
      setOpen(false)
    }
  }

  const handleMarkAll = async () => {
    await notificationsApi.markAllRead()
    setItems(prev => prev.map(i => ({ ...i, is_read: true })))
    setCount(0)
  }

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative btn-secondary p-2"
        title="Notifications"
      >
        {count > 0
          ? <BellAlertIcon className="h-5 w-5 text-primary-600" />
          : <BellIcon className="h-5 w-5" />
        }
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Notifications</h3>
            {count > 0 && (
              <button onClick={handleMarkAll} className="text-xs text-primary-600 hover:underline font-medium">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && <p className="text-sm text-gray-400 text-center py-6">Loading…</p>}
            {!loading && items.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">All caught up!</p>
            )}
            {!loading && items.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!n.is_read ? 'bg-primary-50 dark:bg-primary-950' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5 shrink-0">{TYPE_ICONS[n.type] ?? '📌'}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${n.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-1.5" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
