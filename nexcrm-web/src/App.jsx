import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import ContactDetail from './pages/ContactDetail'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import Activities from './pages/Activities'
import Kanban from './pages/Kanban'
import Admin from './pages/Admin'
import Settings from './pages/Settings'
import { lazy, Suspense } from 'react'
const Reports = lazy(() => import('./pages/Reports'))

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="h-8 w-8 rounded-full border-[3px] border-primary-500/20 border-t-primary-500 animate-spin" />
  </div>
)

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#080c14]">
      <div className="h-8 w-8 rounded-full border-[3px] border-primary-500/20 border-t-primary-500 animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/login"   element={<Login />} />

      {/* Root: landing if not logged in, else dashboard */}
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> : <Landing />
      } />

      {/* Protected app routes */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="contacts"     element={<Contacts />} />
        <Route path="contacts/:id" element={<ContactDetail />} />
        <Route path="leads"        element={<Leads />} />
        <Route path="leads/:id"    element={<LeadDetail />} />
        <Route path="activities"   element={<Activities />} />
        <Route path="kanban"       element={<Kanban />} />
        <Route path="admin"        element={<Admin />} />
        <Route path="settings"     element={<Settings />} />
        <Route path="reports"      element={
          <Suspense fallback={<Spinner />}><Reports /></Suspense>
        } />
      </Route>
    </Routes>
  )
}
