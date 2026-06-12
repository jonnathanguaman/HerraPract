import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { storage } from '../../services/storage'
import type { User } from '../../types'

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => storage.getUser())
  const [loading, setLoading] = useState(Boolean(storage.getAccessToken()))
  const navigate = useNavigate()

  useEffect(() => {
    if (!storage.getAccessToken()) {
      setLoading(false)
      return
    }

    api<User>('/api/auth/me')
      .then((currentUser) => setUser(currentUser))
      .catch(() => {
        storage.clear()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ user: User; accessToken: string; refreshToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    storage.setSession(data.user, data.accessToken, data.refreshToken)
    setUser(data.user)
    navigate('/dashboard', { replace: true })
  }, [navigate])

  const logout = useCallback(() => {
    storage.clear()
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
