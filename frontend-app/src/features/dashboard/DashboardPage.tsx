import { AlertTriangle, Boxes, DollarSign, ReceiptText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Card, MetricCard } from '../../components/ui/Card'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State'
import { dashboardResource } from '../../services/resources'
import { formatDate, toMoney } from '../../services/api'
import type { DashboardResumen } from '../../types'

export function DashboardPage() {
  const [data, setData] = useState<DashboardResumen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    dashboardResource.resumen()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <EmptyState title="No hay datos para mostrar." />

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen operativo del inventario y las ventas.</p>
        </div>
        <Link className="btn btn-primary" to="/ventas/nueva">Nueva venta</Link>
      </div>

      <section className="metrics-grid">
        <MetricCard label="Total productos" value={data.totalProductos} icon={<Boxes size={20} />} />
        <MetricCard label="Stock bajo" value={data.productosStockBajo.length} detail={`Umbral: ${data.stockBajoUmbral}`} icon={<AlertTriangle size={20} />} tone="warning" />
        <MetricCard label="Ventas de hoy" value={data.ventasHoy} icon={<ReceiptText size={20} />} tone="success" />
        <MetricCard label="Vendido hoy" value={toMoney(data.totalVendidoHoy)} icon={<DollarSign size={20} />} tone="success" />
      </section>

      <section className="dashboard-grid">
        <Card>
          <div className="card-header">
            <h2>Ventas recientes</h2>
            <Link to="/ventas">Ver todas</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Fecha</th><th>Cliente</th><th>Total</th></tr>
              </thead>
              <tbody>
                {data.ventasRecientes.map((venta) => (
                  <tr key={venta.id}>
                    <td>{formatDate(venta.fecha)}</td>
                    <td>{venta.cliente ? `${venta.cliente.nombres} ${venta.cliente.apellidos}` : 'Sin cliente'}</td>
                    <td>{toMoney(venta.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.ventasRecientes.length === 0 ? <EmptyState title="Todavía no hay ventas registradas." /> : null}
        </Card>

        <Card>
          <div className="card-header">
            <h2>Productos con menor stock</h2>
            <Link to="/productos">Gestionar</Link>
          </div>
          <div className="stock-list">
            {data.productosMenorStock.map((producto) => (
              <div key={producto.id} className="stock-row">
                <div>
                  <strong>{producto.nombre}</strong>
                  <span>{producto.categoria?.nombre || 'Sin categoría'}</span>
                </div>
                <Badge tone={producto.stock === 0 ? 'danger' : producto.stock <= data.stockBajoUmbral ? 'warning' : 'success'}>
                  {producto.stock} en stock
                </Badge>
              </div>
            ))}
          </div>
          {data.productosMenorStock.length === 0 ? <EmptyState title="No hay productos registrados." /> : null}
        </Card>
      </section>
    </div>
  )
}
