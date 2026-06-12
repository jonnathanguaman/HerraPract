import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Field } from '../../components/ui/Form'
import { useAuth } from './AuthContext'
import { storage } from '../../services/storage'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (storage.getAccessToken()) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Ingresa email y contraseña.')
      return
    }

    try {
      setLoading(true)
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-icon">
          <LockKeyhole size={28} />
        </div>
        <h1>Acceso al inventario</h1>
        <p>Gestiona productos, clientes y ventas desde un solo lugar.</p>
        <Field id="email" label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        <Field id="password" label="Contraseña" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        {error ? <div className="form-error">{error}</div> : null}
        <Button type="submit" loading={loading}>Ingresar</Button>
      </form>
    </main>
  )
}
