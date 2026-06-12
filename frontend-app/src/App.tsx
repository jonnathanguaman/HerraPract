import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { LoginPage } from './features/auth/LoginPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { ProductsPage } from './features/productos/ProductsPage'
import { ProductFormPage } from './features/productos/ProductFormPage'
import { CategoriesPage } from './features/categorias/CategoriesPage'
import { ClientsPage } from './features/clientes/ClientsPage'
import { SalesPage } from './features/ventas/SalesPage'
import { NewSalePage } from './features/ventas/NewSalePage'
import { SaleDetailPage } from './features/ventas/SaleDetailPage'
import { ReportsPage } from './features/reportes/ReportsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/productos/nuevo" element={<ProductFormPage />} />
          <Route path="/productos/:id/editar" element={<ProductFormPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/clientes" element={<ClientsPage />} />
          <Route path="/ventas" element={<SalesPage />} />
          <Route path="/ventas/nueva" element={<NewSalePage />} />
          <Route path="/ventas/:id" element={<SaleDetailPage />} />
          <Route path="/reportes" element={<ReportsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
