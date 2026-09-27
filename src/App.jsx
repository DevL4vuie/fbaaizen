import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NicheDetail from './pages/NicheDetail'
import CourseViewer from './pages/CourseViewer'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageNiches from './pages/admin/ManageNiches'
import ManageTipsGuidelines from './pages/admin/ManageTipsGuidelines'
import ManageCourses from './pages/admin/ManageCourses'
import ManageUsers from './pages/admin/ManageUsers'
import AdminSupport from './pages/admin/AdminSupport'
import Support from './pages/Support'

import { useAuth } from './context/AuthContext'

function RootRedirect() {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* User-facing routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/niche/:id" element={<ProtectedRoute><NicheDetail /></ProtectedRoute>} />
          <Route path="/course/:id" element={<ProtectedRoute><CourseViewer /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />

          {/* Admin-only routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/niches" element={<AdminRoute><ManageNiches /></AdminRoute>} />
          <Route path="/admin/tips-guidelines" element={<AdminRoute><ManageTipsGuidelines /></AdminRoute>} />
          <Route path="/admin/courses" element={<AdminRoute><ManageCourses /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route path="/admin/support" element={<AdminRoute><AdminSupport /></AdminRoute>} />

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
