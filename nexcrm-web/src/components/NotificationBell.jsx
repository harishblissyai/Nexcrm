import { useEffect, useRef, useState } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { BellAlertIcon } from '@heroicons/react/24/solid'
import { notificationsApi } from '../api/notifications'
import { useNavigate } from 'react-router-dom'

const TYPE_ICONS = { overdue: '⏰', lead_status: '🔄', info: 'ℹ️' }
const ENTITY_PATHS = { activity: '/activities', lead: '/leads' }

export default function NotificationBell() {
  const [count, setCount]     = useState(0)
  const [open, setOpen]       = useState(false)
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)
  const ref                   = useRef(null)
  const navigate              = useNavigate()

  const fetchCount = () =>
    notificationsApi.unreadCount().then(d => setCount(d.count)).catch(() => {})

  const fetchAll = () => {
    setLoading(true)
    notificationsApi.list().then(setItems).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
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
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
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
        className="btn-ghost p-2 relative"
        title="Notifications"
      >
        {count > 0
          ? <BellAlertIcon className="h-5 w-5 text-primary-500" />
          : <BellIcon className="h-5 w-5" />
        }
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold leading-none border-2 border-white dark:border-[#080c14]">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900
                        border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50
                        overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Notifications</h3>
              {count > 0 && (
                <span className="badge bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-[10px]">
                  {count} new
                </span>
              )}
            </div>
            {count > 0 && (
              <button onClick={handleMarkAll}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="text-center py-10">
                <BellIcon className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">All caught up!</p>
              </div>
            )}
            {!loading && items.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-800/80 last:border-0
                            hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors
                            ${!n.is_read ? 'bg-primary-50/60 dark:bg-primary-950/30' : ''}`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-base mt-0.5 shrink-0">{TYPE_ICONS[n.type] ?? '📌'}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${
                      n.is_read
                        ? 'text-slate-500 dark:text-slate-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-1.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
