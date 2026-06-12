import { BarChart3, Boxes, LayoutDashboard, ReceiptText, Settings, Tags, Users, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button } from '../ui/Button'

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
  { to: '/productos', label: 'Productos', icon: <Boxes size={19} /> },
  { to: '/categorias', label: 'Categorías', icon: <Tags size={19} /> },
  { to: '/clientes', label: 'Clientes', icon: <Users size={19} /> },
  { to: '/ventas', label: 'Ventas', icon: <ReceiptText size={19} /> },
  { to: '/reportes', label: 'Reportes', icon: <BarChart3 size={19} /> },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">HM</div>
          <div>
            <strong>Herramientas Master</strong>
            <span>ERP operativo</span>
          </div>
          <Button variant="ghost" icon={<X size={18} />} className="mobile-only" onClick={onClose} aria-label="Cerrar menu" />
        </div>
        <nav>
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={onClose}>
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Settings size={18} />
          <span>Configuración</span>
        </div>
      </aside>
      {open ? <button className="scrim mobile-only" onClick={onClose} aria-label="Cerrar menu" /> : null}
    </>
  )
}
