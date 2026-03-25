const VARIANTS = {
  primary: { bg: 'from-primary-500 to-primary-600', shadow: 'shadow-primary-500/30' },
  green:   { bg: 'from-emerald-400 to-teal-600',    shadow: 'shadow-emerald-500/30' },
  yellow:  { bg: 'from-amber-400 to-orange-500',    shadow: 'shadow-amber-500/30'   },
  red:     { bg: 'from-rose-500 to-red-600',         shadow: 'shadow-rose-500/30'    },
  violet:  { bg: 'from-violet-500 to-purple-600',   shadow: 'shadow-violet-500/30'  },
}

export default function StatCard({ label, value, icon: Icon, color = 'primary', trend }) {
  const v = VARIANTS[color] || VARIANTS.primary

  return (
    <div className="card p-5 flex items-center gap-4 group transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className={`rounded-2xl p-3 bg-gradient-to-br ${v.bg} shadow-lg ${v.shadow} shrink-0`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">{value ?? '—'}</p>
        {trend && <p className="text-xs text-slate-400 mt-0.5">{trend}</p>}
      </div>
    </div>
  )
}
