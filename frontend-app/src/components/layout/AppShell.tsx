import { Menu, Search } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { useAuth } from '../../features/auth/AuthContext'
import { Button } from '../ui/Button'

export function AppShell() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="main-area">
        <header className="topbar">
          <Button variant="ghost" icon={<Menu size={20} />} className="mobile-only" onClick={() => setOpen(true)} aria-label="Abrir menu" />
          <div className="search-box">
            <Search size={18} />
            <span>Buscar en inventario</span>
          </div>
          <div className="user-box">
            <span>{user?.email}</span>
            <Button variant="secondary" onClick={logout}>Salir</Button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
