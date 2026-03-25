import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { authApi } from '../api/auth'
import toast from 'react-hot-toast'
import {
  UserCircleIcon, LockClosedIcon, PaintBrushIcon,
  CheckIcon, EyeIcon, EyeSlashIcon,
} from '@heroicons/react/24/outline'

function Section({ icon: Icon, title, desc, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(99,102,241,0.1)' }}>
          <Icon className="h-5 w-5 text-primary-500" />
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{title}</p>
          {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export default function Settings() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()

  const [profile, setProfile]   = useState({ full_name: user?.full_name || '' })
  const [savingProfile, setSavingProfile] = useState(false)

  const [pw, setPw]     = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, next: false })
  const [savingPw, setSavingPw] = useState(false)

  const initials = user?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  /* ── Save display name ── */
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!profile.full_name.trim()) return toast.error('Name cannot be empty')
    setSavingProfile(true)
    try {
      await authApi.updateProfile({ full_name: profile.full_name.trim() })
      toast.success('Profile updated')
      // Refresh page user state
      window.location.reload()
    } catch (err) {
      toast.error(err?.detail || 'Failed to save')
    } finally {
      setSavingProfile(false)
    }
  }

  /* ── Change password ── */
  const handleChangePw = async (e) => {
    e.preventDefault()
    if (!pw.current) return toast.error('Enter your current password')
    if (pw.next.length < 6) return toast.error('New password must be at least 6 characters')
    if (pw.next !== pw.confirm) return toast.error('Passwords do not match')
    setSavingPw(true)
    try {
      await authApi.updateProfile({ current_password: pw.current, new_password: pw.next })
      toast.success('Password changed — please sign in again')
      logout()
    } catch (err) {
      toast.error(err?.detail || 'Failed to change password')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl animate-slide-up">
      {/* Page header */}
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile, security, and preferences.</p>
      </div>

      {/* ── Profile ── */}
      <Section icon={UserCircleIcon} title="Profile" desc="Update your display name">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #818cf8, #4f46e5)', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}
          >
            {initials}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">{user?.full_name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="badge mt-1"
              style={{
                background: user?.role === 'admin' ? 'rgba(139,92,246,0.1)' : 'rgba(99,102,241,0.1)',
                color: user?.role === 'admin' ? '#a78bfa' : '#818cf8',
              }}>
              {user?.role === 'admin' ? '👑 Admin' : 'Member'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Field label="Display Name" hint="This is how your name appears across NexCRM">
            <input
              value={profile.full_name}
              onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              className="input"
              placeholder="Your full name"
            />
          </Field>
          <Field label="Email Address" hint="Contact an admin to change your email">
            <input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" />
          </Field>
          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary" disabled={savingProfile}>
              {savingProfile ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving…
                </span>
              ) : (
                <><CheckIcon className="h-4 w-4" /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Password ── */}
      <Section icon={LockClosedIcon} title="Password" desc="Change your account password">
        <form onSubmit={handleChangePw} className="space-y-4">
          <Field label="Current Password">
            <div className="relative">
              <input
                type={showPw.current ? 'text' : 'password'}
                value={pw.current}
                onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                className="input pr-10"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw.current ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label="New Password" hint="Must be at least 6 characters">
            <div className="relative">
              <input
                type={showPw.next ? 'text' : 'password'}
                value={pw.next}
                onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
                className="input pr-10"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPw(s => ({ ...s, next: !s.next }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw.next ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label="Confirm New Password">
            <input
              type="password"
              value={pw.confirm}
              onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
              className={`input ${pw.confirm && pw.next !== pw.confirm ? 'border-rose-400' : ''}`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {pw.confirm && pw.next !== pw.confirm && (
              <p className="text-xs text-rose-500 mt-1">Passwords do not match</p>
            )}
          </Field>
          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary" disabled={savingPw}>
              {savingPw ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving…
                </span>
              ) : (
                <><LockClosedIcon className="h-4 w-4" /> Change Password</>
              )}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Appearance ── */}
      <Section icon={PaintBrushIcon} title="Appearance" desc="Customize how NexCRM looks">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Dark Mode</p>
            <p className="text-xs text-slate-400 mt-0.5">Switch between light and dark theme</p>
          </div>
          <button
            onClick={toggle}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            style={{ background: dark ? '#4f46e5' : '#e2e8f0' }}
          >
            <span
              className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200"
              style={{ transform: dark ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Sidebar Style</p>
            <p className="text-xs text-slate-400 mt-0.5">Collapsed state is saved automatically when you toggle it</p>
          </div>
          <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-xs">
            Auto-saved
          </span>
        </div>
      </Section>

      {/* ── Account info ── */}
      <Section icon={UserCircleIcon} title="Account Info" desc="Read-only account details">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'User ID',   value: `#${user?.id}` },
            { label: 'Role',      value: user?.role === 'admin' ? '👑 Admin' : 'Member' },
            { label: 'Status',    value: user?.is_active ? '✅ Active' : '❌ Inactive' },
            { label: 'Joined',    value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800/60">
              <p className="text-xs text-slate-400 mb-1">{label}</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{value}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
