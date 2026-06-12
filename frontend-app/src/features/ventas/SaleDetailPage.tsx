import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State'
import { formatDate, toMoney } from '../../services/api'
import { ventasResource } from '../../services/resources'
import type { Venta } from '../../types'

export function SaleDetailPage() {
  const { id } = useParams()
  const [venta, setVenta] = useState<Venta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    ventasResource.get(id)
      .then(setVenta)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar la venta'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!venta) return <EmptyState title="Venta no encontrada." />

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <Link className="back-link" to="/ventas"><ArrowLeft size={17} />Volver</Link>
          <h1>Venta #{venta.id}</h1>
          <p>{formatDate(venta.fecha)}</p>
        </div>
      </div>
      <section className="detail-grid">
        <Card>
          <h2>Cliente</h2>
          <p><strong>{venta.cliente?.nombres} {venta.cliente?.apellidos}</strong></p>
          <p className="muted">{venta.cliente?.email}</p>
          <p className="muted">{venta.cliente?.telefono}</p>
        </Card>
        <Card>
          <h2>Total</h2>
          <p className="total-display">{toMoney(venta.total)}</p>
        </Card>
      </section>
      <Card>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr></thead>
            <tbody>
              {venta.detalles.map((detalle) => (
                <tr key={detalle.id}>
                  <td>{detalle.producto?.nombre || `Producto ${detalle.productoId}`}</td>
                  <td>{detalle.cantidad}</td>
                  <td>{toMoney(detalle.precioUnitario)}</td>
                  <td>{toMoney(detalle.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
