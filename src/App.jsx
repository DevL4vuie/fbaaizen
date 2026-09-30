import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

import Login from './pages/Login'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import NicheDetail from './pages/NicheDetail'
import CourseViewer from './pages/CourseViewer'
import Announcements from './pages/Announcements'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageNiches from './pages/admin/ManageNiches'
import ManageTipsGuidelines from './pages/admin/ManageTipsGuidelines'
import ManageCourses from './pages/admin/ManageCourses'
import ManageUsers from './pages/admin/ManageUsers'
import ManageAnnouncements from './pages/admin/ManageAnnouncements'
import AdminSupport from './pages/admin/AdminSupport'
import ManageAdmins from './pages/admin/ManageAdmins'
import Support from './pages/Support'

import { useAuth } from './context/AuthContext'

function RootRedirect() {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Landing />
  if (profile?.role === 'admin' || profile?.role === 'superadmin') return <Navigate to="/admin" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* User-facing routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
          <Route path="/niche/:id" element={<ProtectedRoute><NicheDetail /></ProtectedRoute>} />
          <Route path="/course/:id" element={<ProtectedRoute><CourseViewer /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />

          {/* Admin & Superadmin routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/creator-admins" element={<AdminRoute><ManageAdmins /></AdminRoute>} />
          <Route path="/admin/announcements" element={<AdminRoute><ManageAnnouncements /></AdminRoute>} />
          <Route path="/admin/niches" element={<AdminRoute><ManageNiches /></AdminRoute>} />
          <Route path="/admin/tips-guidelines" element={<AdminRoute><ManageTipsGuidelines /></AdminRoute>} />
          <Route path="/admin/courses" element={<AdminRoute><ManageCourses /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route path="/admin/support" element={<AdminRoute><AdminSupport /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
