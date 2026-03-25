import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  EnvelopeIcon, LockClosedIcon, UserIcon,
  EyeIcon, EyeSlashIcon,
} from '@heroicons/react/24/outline'

const FEATURES = [
  { icon: '📊', title: 'Pipeline Management',    desc: 'Track every deal from lead to close' },
  { icon: '👥', title: 'Contact Intelligence',   desc: 'Full history for every relationship' },
  { icon: '🔔', title: 'Smart Notifications',    desc: 'Never miss a follow-up again' },
]

export default function Login() {
  const { user, login, register } = useAuth()
  const [mode, setMode]           = useState('login')
  const [form, setForm]           = useState({ email: '', password: '', full_name: '' })
  const [loading, setLoading]     = useState(false)
  const [errors, setErrors]       = useState({})
  const [showPw, setShowPw]       = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Min 6 characters'
    if (mode === 'register' && !form.full_name.trim()) e.full_name = 'Full name is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === 'login') await login(form.email, form.password)
      else await register(form.email, form.full_name, form.password)
    } catch (err) {
      toast.error(err?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setErrors(er => ({ ...er, [key]: '' }))
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (brand) ─────────────────────────────── */}
      <div
        className="hidden lg:flex w-[46%] relative overflow-hidden flex-col items-center justify-center px-14"
        style={{ background: 'linear-gradient(145deg, #0d1117 0%, #1a1040 40%, #1e1b4b 70%, #0d1117 100%)' }}
      >
        {/* Ambient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', animationDelay: '1.5s' }} />

        {/* Brand */}
        <div className="relative z-10 w-full max-w-sm">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-7 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 0 40px rgba(99,102,241,0.35)' }}
          >
            <span className="text-white font-black text-2xl select-none">N</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">
            Nex<span className="text-primary-400">CRM</span>
          </h1>
          <p className="text-slate-400 text-base mb-10">Your intelligent sales workspace</p>

          <div className="space-y-3">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="flex items-start gap-3.5 rounded-2xl p-4 border border-white/[0.07]"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}
              >
                <span className="text-2xl leading-none mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom credit */}
        <p className="absolute bottom-6 text-slate-600 text-xs">NexCRM v1.0 · Built for growing teams</p>
      </div>

      {/* ── Right panel (form) ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-[#080c14]">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
              <span className="text-white font-black text-xl">N</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Nex<span className="text-primary-500">CRM</span>
            </h1>
          </div>

          <div className="card p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {mode === 'login' ? 'Welcome back' : 'Get started free'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {mode === 'login'
                  ? 'Sign in to your workspace'
                  : 'Create your account in seconds'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {mode === 'register' && (
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      value={form.full_name} onChange={set('full_name')} placeholder="Jane Doe"
                      className={`input pl-9 ${errors.full_name ? 'border-rose-400 focus:ring-rose-400/20' : ''}`}
                    />
                  </div>
                  {errors.full_name && <p className="text-xs text-rose-500 mt-1.5">⚠ {errors.full_name}</p>}
                </div>
              )}

              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"
                    autoComplete="email"
                    className={`input pl-9 ${errors.email ? 'border-rose-400 focus:ring-rose-400/20' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-500 mt-1.5">⚠ {errors.email}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password} onChange={set('password')} placeholder="••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className={`input pl-9 pr-10 ${errors.password ? 'border-rose-400 focus:ring-rose-400/20' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPw ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-500 mt-1.5">⚠ {errors.password}</p>}
              </div>

              <button type="submit" className="btn-primary w-full h-10 mt-1" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Please wait…
                  </span>
                ) : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400">
                  {mode === 'login' ? 'New to NexCRM?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <button
              onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErrors({}) }}
              className="btn-secondary w-full"
            >
              {mode === 'login' ? 'Create an account' : 'Sign in instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
