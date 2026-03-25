import { useState, useEffect } from 'react'
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { leadsApi } from '../api/leads'
import { Link } from 'react-router-dom'
import { TagBadge } from '../components/TagInput'
import toast from 'react-hot-toast'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'

const STATUSES = [
  { key: 'New',        label: 'New',         color: '#94a3b8', colBg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.2)',  badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  { key: 'Contacted',  label: 'Contacted',   color: '#38bdf8', colBg: 'rgba(56,189,248,0.05)',  border: 'rgba(56,189,248,0.2)',   badge: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  { key: 'Qualified',  label: 'Qualified',   color: '#fbbf24', colBg: 'rgba(251,191,36,0.05)',  border: 'rgba(251,191,36,0.2)',   badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { key: 'ClosedWon',  label: 'Closed Won',  color: '#34d399', colBg: 'rgba(52,211,153,0.05)',  border: 'rgba(52,211,153,0.2)',   badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { key: 'ClosedLost', label: 'Closed Lost', color: '#fb7185', colBg: 'rgba(251,113,133,0.05)', border: 'rgba(251,113,133,0.2)',  badge: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
]

function LeadCard({ lead, isDragging }) {
  return (
    <div className={`rounded-xl border bg-white dark:bg-slate-900 p-3.5 cursor-grab active:cursor-grabbing
                     transition-all duration-150 select-none
                     ${isDragging
                       ? 'shadow-2xl opacity-90 rotate-1 scale-[1.02] border-primary-300 dark:border-primary-700'
                       : 'shadow-sm hover:shadow-md hover:-translate-y-0.5 border-slate-100 dark:border-slate-800'}`}>
      <Link
        to={`/leads/${lead.id}`}
        className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 block truncate transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {lead.title}
      </Link>
      {lead.contact_name && (
        <p className="text-xs text-slate-400 mt-1 truncate">{lead.contact_name}</p>
      )}
      {lead.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {lead.tags.slice(0, 3).map(t => <TagBadge key={t} tag={t} />)}
          {lead.tags.length > 3 && (
            <span className="text-xs text-slate-400">+{lead.tags.length - 3}</span>
          )}
        </div>
      )}
      {lead.value > 0 && (
        <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-slate-50 dark:border-slate-800">
          <CurrencyDollarIcon className="h-3 w-3 text-emerald-500 shrink-0" />
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {Number(lead.value).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}

function SortableCard({ lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id })
  return (
    <div ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }}
      {...attributes} {...listeners}>
      <LeadCard lead={lead} />
    </div>
  )
}

function Column({ status, leads }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.key })
  const total = leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0)

  return (
    <div className="flex flex-col rounded-2xl min-h-[520px] w-64 shrink-0 transition-all duration-150"
      style={{
        background: isOver ? `${status.colBg}` : 'transparent',
        border: `1.5px solid ${isOver ? status.color + '40' : status.border}`,
        transition: 'border-color 0.15s, background 0.15s',
      }}>
      {/* Column header */}
      <div className="px-3 pt-3.5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: status.color }} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{status.label}</span>
          </div>
          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 tabular-nums">
            {leads.length}
          </span>
        </div>
        {total > 0 && (
          <p className="text-[10px] font-semibold pl-4" style={{ color: status.color }}>
            ${Number(total).toLocaleString()} total value
          </p>
        )}
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef} className="flex-1 px-2 pb-2 space-y-2">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => <SortableCard key={lead.id} lead={lead} />)}
        </SortableContext>
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-slate-400 border-2 border-dashed rounded-xl transition-colors"
            style={{ borderColor: isOver ? status.color + '60' : 'rgba(148,163,184,0.2)' }}>
            {isOver ? '⬇ Drop here' : 'No leads'}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Kanban() {
  const [columns, setColumns]   = useState(() => Object.fromEntries(STATUSES.map(s => [s.key, []])))
  const [activeId, setActiveId] = useState(null)
  const [activeLead, setActiveLead] = useState(null)
  const [loading, setLoading]   = useState(true)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => { fetchLeads() }, [])

  async function fetchLeads() {
    try {
      setLoading(true)
      const res = await leadsApi.list({ size: 200 })
      const grouped = Object.fromEntries(STATUSES.map(s => [s.key, []]))
      // res is already unwrapped by axios interceptor → res.items
      const items = res?.items ?? res ?? []
      items.forEach(lead => {
        if (grouped[lead.status]) grouped[lead.status].push(lead)
      })
      setColumns(grouped)
    } catch {
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  function findContainer(id) {
    for (const [key, leads] of Object.entries(columns)) {
      if (leads.find(l => l.id === id)) return key
    }
    return null
  }

  function handleDragStart({ active }) {
    setActiveId(active.id)
    const container = findContainer(active.id)
    setActiveLead(columns[container]?.find(l => l.id === active.id) || null)
  }

  async function handleDragEnd({ active, over }) {
    setActiveId(null)
    setActiveLead(null)
    if (!over) return

    const fromCol = findContainer(active.id)
    const toCol   = STATUSES.find(s => s.key === over.id)?.key || findContainer(over.id)
    if (!fromCol || !toCol || fromCol === toCol) return

    const lead = columns[fromCol].find(l => l.id === active.id)
    setColumns(prev => ({
      ...prev,
      [fromCol]: prev[fromCol].filter(l => l.id !== active.id),
      [toCol]:   [...prev[toCol], { ...lead, status: toCol }],
    }))

    try {
      await leadsApi.updateStatus(active.id, toCol)
      toast.success(`Moved to ${STATUSES.find(s => s.key === toCol)?.label}`)
    } catch {
      toast.error('Failed to update status')
      fetchLeads()
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 rounded-full border-[3px] border-primary-500/20 border-t-primary-500 animate-spin" />
    </div>
  )

  const totalValue = Object.values(columns).flat().reduce((s, l) => s + (Number(l.value) || 0), 0)
  const totalLeads = Object.values(columns).flat().length

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Pipeline</h1>
          <p className="page-subtitle">Drag cards between columns to update lead status.</p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <div className="text-right">
            <p className="text-xs text-slate-400">Total leads</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{totalLeads}</p>
          </div>
          {totalValue > 0 && (
            <div className="text-right">
              <p className="text-xs text-slate-400">Pipeline value</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">${totalValue.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
          {STATUSES.map(status => (
            <Column key={status.key} status={status} leads={columns[status.key]} />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
