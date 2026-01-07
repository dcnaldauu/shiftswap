import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { cleanupOldRequests } from './lib/cleanup'
import AuthPage from './pages/AuthPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import MainLayout from './components/MainLayout'
import ShiftsPage from './pages/ShiftsPage'
import RequestsPage from './pages/RequestsPage'
import CreateShiftPage from './pages/CreateShiftPage'
import MyShiftsPage from './pages/MyShiftsPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Run cleanup on app startup and every 24 hours
  useEffect(() => {
    cleanupOldRequests()
    const interval = setInterval(cleanupOldRequests, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-accent text-xl font-bold">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </HashRouter>
    )
  }

  // Wait for profile to load before rendering routes
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-accent text-xl font-bold">Loading profile...</div>
      </div>
    )
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout profile={profile} />}>
          <Route index element={<Navigate to="/shifts" replace />} />
          <Route path="shifts" element={<ShiftsPage profile={profile} onUpdateProfile={() => fetchProfile(session.user.id)} />} />
          <Route path="requests" element={<RequestsPage profile={profile} />} />
          <Route path="create" element={<CreateShiftPage profile={profile} onUpdateProfile={() => fetchProfile(session.user.id)} />} />
          <Route path="my-shifts" element={<MyShiftsPage profile={profile} />} />
          <Route path="settings" element={<SettingsPage profile={profile} onUpdate={() => fetchProfile(session.user.id)} />} />
          {profile?.is_admin && (
            <Route path="admin" element={<AdminPage profile={profile} />} />
          )}
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
