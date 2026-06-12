import { Edit, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Select } from '../../components/ui/Form'
import { ConfirmDialog } from '../../components/ui/Modal'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State'
import { useToast } from '../../components/ui/Toast'
import { toMoney } from '../../services/api'
import { categoriasResource, productosResource } from '../../services/resources'
import type { Categoria, Producto } from '../../types'

const stockTone = (stock: number) => (stock === 0 ? 'danger' : stock <= 5 ? 'warning' : 'success')
const stockLabel = (stock: number) => (stock === 0 ? 'Agotado' : stock <= 5 ? 'Stock bajo' : 'Disponible')

export function ProductsPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [selected, setSelected] = useState<Producto | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { showToast } = useToast()

  const load = () => {
    setLoading(true)
    Promise.all([productosResource.list(), categoriasResource.list()])
      .then(([products, cats]) => {
        setProductos(products)
        setCategorias(cats)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudieron cargar productos'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(() => productos.filter((producto) => {
    const matchesText = `${producto.nombre} ${producto.descripcion || ''}`.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = !categoriaId || String(producto.categoriaId) === categoriaId
    const matchesStock = !stockFilter || stockLabel(producto.stock) === stockFilter
    return matchesText && matchesCategory && matchesStock
  }), [productos, query, categoriaId, stockFilter])

  const remove = async () => {
    if (!selected) return
    try {
      setDeleting(true)
      await productosResource.remove(selected.id)
      setProductos((current) => current.filter((producto) => producto.id !== selected.id))
      showToast('Producto eliminado.', 'success')
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
        <div>
          <h1>Productos</h1>
          <p>Consulta y mantiene el inventario de herramientas.</p>
        </div>
        <Link className="btn btn-primary" to="/productos/nuevo"><Plus size={18} />Nuevo producto</Link>
      </div>
      <Card>
        <div className="filters">
          <Field id="buscar-producto" label="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre o descripción" />
          <Select id="filtro-categoria" label="Categoría" value={categoriaId} onChange={(event) => setCategoriaId(event.target.value)}>
            <option value="">Todas</option>
            {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
          </Select>
          <Select id="filtro-stock" label="Stock" value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
            <option value="">Todos</option>
            <option>Disponible</option>
            <option>Stock bajo</option>
            <option>Agotado</option>
          </Select>
        </div>
        {filtered.length === 0 ? <EmptyState title="No hay productos para los filtros seleccionados." /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {filtered.map((producto) => (
                  <tr key={producto.id}>
                    <td><strong>{producto.nombre}</strong><span>{producto.descripcion}</span></td>
                    <td>{producto.categoria?.nombre || 'Sin categoría'}</td>
                    <td>{toMoney(producto.precio)}</td>
                    <td>{producto.stock}</td>
                    <td><Badge tone={stockTone(producto.stock)}>{stockLabel(producto.stock)}</Badge></td>
                    <td className="row-actions">
                      <Link className="icon-btn" to={`/productos/${producto.id}/editar`} aria-label="Editar"><Edit size={17} /></Link>
                      <Button variant="ghost" icon={<Trash2 size={17} />} onClick={() => setSelected(producto)} aria-label="Eliminar" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <ConfirmDialog title="Eliminar producto" message={`Esta acción eliminará ${selected?.nombre || 'el producto'} del inventario.`} open={Boolean(selected)} onCancel={() => setSelected(null)} onConfirm={remove} loading={deleting} />
    </div>
  )
}
