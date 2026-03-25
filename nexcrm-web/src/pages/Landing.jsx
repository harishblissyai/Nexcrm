import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  ChartBarIcon, UsersIcon, FunnelIcon, ClipboardDocumentListIcon,
  ViewColumnsIcon, BellAlertIcon, ShieldCheckIcon, SunIcon, MoonIcon,
  ArrowRightIcon, CheckIcon, SparklesIcon,
} from '@heroicons/react/24/outline'

const FEATURES = [
  {
    icon: FunnelIcon, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',
    title: 'Smart Lead Tracking',
    desc: 'Move deals through your pipeline with a visual Kanban board. Never let a hot lead go cold again.',
  },
  {
    icon: UsersIcon, color: '#22d3ee', bg: 'rgba(6,182,212,0.1)',
    title: 'Contact Intelligence',
    desc: 'Keep a full history of every interaction — calls, emails, meetings — all in one timeline.',
  },
  {
    icon: BellAlertIcon, color: '#c084fc', bg: 'rgba(168,85,247,0.1)',
    title: 'Activity Reminders',
    desc: 'Set due dates on tasks. Get notified before deadlines slip. Stay on top of every follow-up.',
  },
  {
    icon: ChartBarIcon, color: '#fb7185', bg: 'rgba(244,63,94,0.1)',
    title: 'Reports & Analytics',
    desc: 'Visualize your pipeline value, conversion rates, and team activity with beautiful charts.',
  },
  {
    icon: ShieldCheckIcon, color: '#818cf8', bg: 'rgba(99,102,241,0.1)',
    title: 'Role-Based Access',
    desc: 'Admins control who sees what. Keep sensitive data safe with per-user permissions.',
  },
  {
    icon: ViewColumnsIcon, color: '#34d399', bg: 'rgba(16,185,129,0.1)',
    title: 'Pipeline Kanban Board',
    desc: 'Drag and drop deals between stages. Instant visual overview of your entire sales process.',
  },
]

const STEPS = [
  { n: '01', title: 'Add your contacts', desc: 'Import a CSV or add people and companies manually in seconds.' },
  { n: '02', title: 'Create leads',      desc: 'Link contacts to deals, set values and track every stage.' },
  { n: '03', title: 'Close more deals',  desc: 'Use the pipeline, reminders and reports to hit your targets.' },
]

const STATS = [
  { value: '100%', label: 'Free & open source' },
  { value: 'Self', label: 'Hosted on your server' },
  { value: '∞',   label: 'Contacts & leads' },
  { value: '0',   label: 'Monthly SaaS fees' },
]

/* Fake app preview using pure HTML/CSS */
function AppPreview() {
  return (
    <div className="relative w-full max-w-2xl mx-auto select-none pointer-events-none">
      {/* Glow behind card */}
      <div className="absolute inset-0 blur-3xl opacity-30 rounded-3xl"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)' }} />

      {/* Fake browser chrome */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        style={{ background: '#0d1424' }}>
        {/* Browser bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5" style={{ background: '#0a1020' }}>
          <span className="w-3 h-3 rounded-full bg-rose-500/70" />
          <span className="w-3 h-3 rounded-full bg-amber-500/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
          <div className="flex-1 mx-4 h-5 rounded-md bg-white/5 flex items-center px-3">
            <span className="text-[10px] text-white/30">localhost:4000/dashboard</span>
          </div>
        </div>

        {/* Fake app layout */}
        <div className="flex h-48 sm:h-64">
          {/* Sidebar */}
          <div className="w-12 sm:w-16 border-r border-white/5 flex flex-col items-center py-3 gap-2" style={{ background: '#090e1a' }}>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary-600/80 flex items-center justify-center mb-1">
              <span className="text-white text-[8px] sm:text-[10px] font-black">N</span>
            </div>
            {['#818cf8','#22d3ee','#fbbf24','#c084fc','#34d399'].map((c, i) => (
              <div key={i} className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center"
                style={{ background: i === 0 ? `rgba(${hexToRgb(c)},0.2)` : 'transparent' }}>
                <div className="w-3 h-3 rounded-sm" style={{ background: i === 0 ? c : 'rgba(255,255,255,0.15)' }} />
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-3 sm:p-4 overflow-hidden">
            {/* Stat row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { c: '#6366f1', v: '128', l: 'Contacts' },
                { c: '#f59e0b', v: '43',  l: 'Leads' },
                { c: '#10b981', v: '17',  l: 'Open' },
                { c: '#f43f5e', v: '3',   l: 'Overdue' },
              ].map(s => (
                <div key={s.l} className="rounded-lg p-2 border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-[8px] sm:text-[9px] font-bold uppercase" style={{ color: s.c }}>{s.l}</p>
                  <p className="text-sm sm:text-base font-bold text-white mt-0.5">{s.v}</p>
                </div>
              ))}
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-3 gap-2">
              {/* Pipeline mini */}
              <div className="col-span-1 rounded-lg p-2 border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-[8px] font-semibold text-white/40 mb-2 uppercase tracking-wider">Pipeline</p>
                {[['New','#94a3b8',60],['Qualified','#fbbf24',40],['Closed','#10b981',25]].map(([l,c,w]) => (
                  <div key={l} className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-8 sm:w-10 text-[7px] sm:text-[8px]" style={{ color: c }}>{l}</div>
                    <div className="flex-1 h-1 rounded-full bg-white/10">
                      <div className="h-1 rounded-full" style={{ width: `${w}%`, background: c }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Activity mini */}
              <div className="col-span-2 rounded-lg p-2 border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-[8px] font-semibold text-white/40 mb-2 uppercase tracking-wider">Recent Activity</p>
                {['📞 Called Sarah Johnson','✉️ Emailed Acme Corp','🤝 Meeting with Dev Team'].map(a => (
                  <div key={a} className="text-[8px] sm:text-[9px] text-white/50 py-0.5 border-b border-white/5 last:border-0 truncate">{a}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

export default function Landing() {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-[#080c14] text-white overflow-x-hidden">

      {/* ── Navbar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl"
        style={{ background: 'rgba(8,12,20,0.85)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
              <span className="text-white font-black text-sm">N</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Nex<span style={{ color: '#818cf8' }}>CRM</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              {dark ? <SunIcon className="h-5 w-5 text-amber-400" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            {user ? (
              <Link to="/dashboard"
                className="btn-primary text-sm px-4 py-1.5"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                Go to App <ArrowRightIcon className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-1.5">
                  Sign In
                </Link>
                <Link to="/login"
                  className="btn text-sm px-4 py-1.5 text-white font-semibold rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-5 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        <div className="absolute top-40 left-1/4 w-72 h-72 rounded-full pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-40 right-1/4 w-72 h-72 rounded-full pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-8 border border-primary-500/20"
            style={{ background: 'rgba(99,102,241,0.08)', color: '#a5b4fc' }}>
            <SparklesIcon className="h-3.5 w-3.5" />
            Free · Self-hosted · No subscriptions
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            The CRM that{' '}
            <span className="relative inline-block">
              <span style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                actually fits
              </span>
            </span>
            {' '}your team
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            NexCRM is a lightweight, self-hosted sales CRM with contacts, leads, pipeline, activities, and analytics.
            Own your data. Pay nothing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link to="/login"
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold text-white transition-all duration-150 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', boxShadow: '0 0 32px rgba(99,102,241,0.4), 0 4px 16px rgba(0,0,0,0.3)' }}>
              Get Started Free
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <a href="#features"
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold text-slate-300 border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/5 transition-all duration-150">
              See Features
            </a>
          </div>

          {/* App preview */}
          <AppPreview />
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────── */}
      <section id="pricing" className="border-y border-white/5 py-10"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black text-white mb-1"
                style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {s.value}
              </p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#818cf8' }}>Everything you need</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Built for real sales teams</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              No bloat. No complicated setup. Just the tools that help you close more deals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title}
                className="rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 group"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: f.bg }}>
                  <f.icon className="h-5 w-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-5 border-t border-white/5"
        style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#34d399' }}>Simple by design</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Up and running in minutes</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-8 left-[calc(33%+24px)] right-[calc(33%+24px)] h-px"
              style={{ background: 'linear-gradient(to right, rgba(99,102,241,0.3), rgba(99,102,241,0.3))' }} />

            {STEPS.map((s, i) => (
              <div key={s.n} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 relative"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <span className="text-2xl font-black" style={{ color: '#818cf8' }}>{s.n}</span>
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA section ──────────────────────────────────── */}
      <section className="py-24 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-3xl p-10 sm:p-14 relative overflow-hidden border border-white/10"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(37,99,235,0.1) 100%)' }}>
            <div className="absolute inset-0 blur-2xl opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.5) 0%, transparent 70%)' }} />

            <h2 className="relative text-3xl sm:text-4xl font-black text-white mb-4">
              Start using NexCRM today
            </h2>
            <p className="relative text-slate-300 mb-8 text-lg">
              Free forever. No credit card. Your data stays with you.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/login"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold text-white transition-all duration-150 hover:brightness-110 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 0 32px rgba(99,102,241,0.4)' }}>
                Create Free Account
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
            <div className="relative flex items-center justify-center gap-5 mt-6">
              {['No monthly fees', 'Self-hosted', 'Open source'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.2)' }}>
              <span className="text-primary-400 font-black text-[10px]">N</span>
            </div>
            <span>NexCRM v1.0</span>
          </div>
          <p>Built for growing teams · Free & open source</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
            <Link to="/login" className="hover:text-slate-300 transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
