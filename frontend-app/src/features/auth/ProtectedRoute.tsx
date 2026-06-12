import { Navigate, Outlet } from 'react-router-dom'
import { LoadingState } from '../../components/ui/State'
import { storage } from '../../services/storage'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { loading, user } = useAuth()

  if (loading) return <LoadingState label="Validando sesión..." />
  if (!user && !storage.getAccessToken()) return <Navigate to="/login" replace />

  return <Outlet />
}
