import { BarChart3 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card, MetricCard } from '../../components/ui/Card'
import { Field } from '../../components/ui/Form'
import { EmptyState } from '../../components/ui/State'
import { toMoney } from '../../services/api'
import { reportesResource } from '../../services/resources'
import type { ReporteVentas } from '../../types'

const today = new Date().toISOString().slice(0, 10)
const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)

export function ReportsPage() {
  const [desde, setDesde] = useState(firstDay)
  const [hasta, setHasta] = useState(today)
  const [data, setData] = useState<ReporteVentas | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const productos = useMemo(() => data?.productosMasVendidos || [], [data])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      setLoading(true)
      setData(await reportesResource.ventas(desde, hasta))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div><h1>Reportes</h1><p>Ventas por rango y productos más vendidos.</p></div>
      </div>
      <Card>
        <form className="filters" onSubmit={submit}>
          <Field id="desde" label="Desde" type="date" value={desde} onChange={(event) => setDesde(event.target.value)} />
          <Field id="hasta" label="Hasta" type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} />
          <div className="filter-action">
            <Button type="submit" loading={loading}>Generar</Button>
          </div>
        </form>
        {error ? <div className="form-error">{error}</div> : null}
      </Card>
      {data ? (
        <>
          <section className="metrics-grid">
            <MetricCard label="Ventas del rango" value={data.totalVentas} icon={<BarChart3 size={20} />} />
            <MetricCard label="Total vendido" value={toMoney(data.totalVendido)} icon={<BarChart3 size={20} />} tone="success" />
          </section>
          <Card>
            <div className="card-header"><h2>Productos más vendidos</h2></div>
            {productos.length === 0 ? <EmptyState title="No hay productos vendidos en este rango." /> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Producto</th><th>Cantidad</th><th>Total</th></tr></thead>
                  <tbody>
                    {productos.map((item) => (
                      <tr key={item.productoId}>
                        <td>{item.producto?.nombre || `Producto ${item.productoId}`}</td>
                        <td>{Number(item.cantidadVendida)}</td>
                        <td>{toMoney(item.totalVendido)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : <EmptyState title="Genera un reporte para ver resultados." />}
    </div>
  )
}
