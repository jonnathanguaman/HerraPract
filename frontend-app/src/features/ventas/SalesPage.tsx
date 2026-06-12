import { Eye, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field } from '../../components/ui/Form'
import { ConfirmDialog } from '../../components/ui/Modal'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State'
import { useToast } from '../../components/ui/Toast'
import { formatDate, toMoney } from '../../services/api'
import { ventasResource } from '../../services/resources'
import type { Venta } from '../../types'

export function SalesPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Venta | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { showToast } = useToast()

  const load = () => {
    setLoading(true)
    ventasResource.list()
      .then(setVentas)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudieron cargar ventas'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(() => ventas.filter((venta) =>
    `${venta.id} ${venta.cliente?.nombres || ''} ${venta.cliente?.apellidos || ''}`.toLowerCase().includes(query.toLowerCase())
  ), [ventas, query])

  const remove = async () => {
    if (!selected) return
    try {
      setDeleting(true)
      await ventasResource.remove(selected.id)
      setVentas((current) => current.filter((venta) => venta.id !== selected.id))
      showToast('Venta eliminada y stock reintegrado.', 'success')
      setSelected(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar.', 'danger')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="page-stack">
      <div className="page-header">
        <div><h1>Ventas</h1><p>Consulta ventas y revisa su detalle.</p></div>
        <Link className="btn btn-primary" to="/ventas/nueva"><Plus size={18} />Nueva venta</Link>
      </div>
      <Card>
        <div className="filters single">
          <Field id="buscar-venta" label="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ID o cliente" />
        </div>
        {filtered.length === 0 ? <EmptyState title="No hay ventas registradas." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Fecha</th><th>Cliente</th><th>Items</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {filtered.map((venta) => (
                  <tr key={venta.id}>
                    <td>{formatDate(venta.fecha)}</td>
                    <td>{venta.cliente ? `${venta.cliente.nombres} ${venta.cliente.apellidos}` : 'Sin cliente'}</td>
                    <td>{venta.detalles?.length || 0}</td>
                    <td>{toMoney(venta.total)}</td>
                    <td><Badge tone="success">Completada</Badge></td>
                    <td className="row-actions">
                      <Link className="icon-btn" to={`/ventas/${venta.id}`} aria-label="Ver detalle"><Eye size={17} /></Link>
                      <Button variant="ghost" icon={<Trash2 size={17} />} onClick={() => setSelected(venta)} aria-label="Eliminar" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <ConfirmDialog title="Eliminar venta" message="Esta acción reintegrará el stock de sus productos." open={Boolean(selected)} onCancel={() => setSelected(null)} onConfirm={remove} loading={deleting} />
    </div>
  )
}
