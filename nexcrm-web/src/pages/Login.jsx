import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { user, login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  if (user) return <Navigate to="/dashboard" replace />

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
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

  const set = (key) => (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Nex<span className="text-primary-300">CRM</span></h1>
          <p className="text-primary-200 text-sm mt-1">Lightweight team CRM</p>
        </div>

        <div className="card p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {mode === 'login' ? 'Sign in to your account' : 'Create an account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <div>
                <label className="label">Full Name</label>
                <input value={form.full_name} onChange={set('full_name')} placeholder="Jane Doe"
                  className={`input ${errors.full_name ? 'border-red-400' : ''}`} />
                {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"
                className={`input ${errors.email ? 'border-red-400' : ''}`} autoComplete="email" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••"
                className={`input ${errors.password ? 'border-red-400' : ''}`} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErrors({}) }}
              className="text-primary-600 font-medium hover:underline">
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
