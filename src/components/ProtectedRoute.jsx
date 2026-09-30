import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

/**
 * ProtectedRoute: Ensures user is authenticated.
 * Allows any authenticated user with an active account (user or admin).
 */
export function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void">
        <Loader label="Authenticating session" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (profile?.banned) {
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * RoleRoute / AdminRoute: Enforces specific role(s).
 * Strictly prevents regular users from accessing admin routes.
 */
export function RoleRoute({ allowedRoles = ['admin'], children }) {
  const { user, profile, loading, hasRole } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void">
        <Loader label="Verifying permissions" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (profile?.banned) {
    return <Navigate to="/login" replace />
  }

  const isAllowed = hasRole(allowedRoles)

  if (!isAllowed) {
    // Non-admin attempting to access restricted route gets redirected to dashboard
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function AdminRoute({ children }) {
  return <RoleRoute allowedRoles={['admin', 'superadmin']}>{children}</RoleRoute>
}

export function SuperAdminRoute({ children }) {
  return <RoleRoute allowedRoles={['superadmin']}>{children}</RoleRoute>
}

