import { Link } from 'react-router-dom'
import {
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  TrophyIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

const CONFIG = {
  // Activity subtypes
  Call:       { icon: PhoneIcon,           bg: 'bg-blue-100',   ring: 'ring-blue-400',   text: 'text-blue-600',   label: 'Call' },
  Email:      { icon: EnvelopeIcon,        bg: 'bg-purple-100', ring: 'ring-purple-400', text: 'text-purple-600', label: 'Email' },
  Meeting:    { icon: CalendarDaysIcon,    bg: 'bg-yellow-100', ring: 'ring-yellow-400', text: 'text-yellow-600', label: 'Meeting' },
  Note:       { icon: DocumentTextIcon,    bg: 'bg-gray-100',   ring: 'ring-gray-400',   text: 'text-gray-600',   label: 'Note' },
  // Lead subtypes
  created:    { icon: BriefcaseIcon,       bg: 'bg-indigo-100', ring: 'ring-indigo-400', text: 'text-indigo-600', label: 'Lead' },
  ClosedWon:  { icon: TrophyIcon,          bg: 'bg-green-100',  ring: 'ring-green-400',  text: 'text-green-600',  label: 'Won' },
  ClosedLost: { icon: XCircleIcon,         bg: 'bg-red-100',    ring: 'ring-red-400',    text: 'text-red-600',    label: 'Lost' },
}

function TimelineEvent({ event, isLast }) {
  const cfg = CONFIG[event.subtype] || CONFIG.Note
  const Icon = cfg.icon

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(event.timestamp))

  return (
    <div className="flex gap-4">
      {/* Icon + line */}
      <div className="flex flex-col items-center">
        <div className={`flex items-center justify-center w-9 h-9 rounded-full ring-2 ${cfg.bg} ${cfg.ring} shrink-0`}>
          <Icon className={`w-4 h-4 ${cfg.text}`} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
      </div>

      {/* Content */}
      <div className={`pb-6 ${isLast ? '' : ''} flex-1 min-w-0`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                {cfg.label}
              </span>
              {event.lead_id && event.kind === 'activity' && (
                <Link to={`/leads/${event.lead_id}`} className="text-xs text-primary-500 hover:underline">
                  View lead →
                </Link>
              )}
              {event.lead_id && event.kind === 'lead' && (
                <Link to={`/leads/${event.lead_id}`} className="text-xs text-primary-500 hover:underline">
                  Open →
                </Link>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 mt-1 truncate">{event.title}</p>
            {event.body && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{event.body}</p>
            )}
          </div>
          <time className="text-xs text-gray-400 shrink-0 mt-1">{formattedDate}</time>
        </div>
      </div>
    </div>
  )
}

export default function ContactTimeline({ events, loading, onLogActivity }) {
  if (loading) {
    return (
      <div className="space-y-4 py-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-10">
        <CalendarDaysIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">No activity yet.</p>
        <button onClick={onLogActivity} className="mt-3 text-sm text-primary-600 hover:underline font-medium">
          Log first activity →
        </button>
      </div>
    )
  }

  return (
    <div className="pt-2">
      {events.map((event, i) => (
        <TimelineEvent key={event.id} event={event} isLast={i === events.length - 1} />
      ))}
    </div>
  )
}
