import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Select } from '../../components/ui/Form'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State'
import { useToast } from '../../components/ui/Toast'
import { toMoney } from '../../services/api'
import { clientesResource, productosResource, ventasResource } from '../../services/resources'
import type { Cliente, Producto } from '../../types'

type SaleItem = { productoId: number; cantidad: number }

export function NewSalePage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [clienteId, setClienteId] = useState('')
  const [productoId, setProductoId] = useState('')
  const [cantidad, setCantidad] = useState('1')
  const [items, setItems] = useState<SaleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([clientesResource.list(), productosResource.list()])
      .then(([clients, products]) => {
        setClientes(clients)
        setProductos(products)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo preparar la venta'))
      .finally(() => setLoading(false))
  }, [])

  const enrichedItems = useMemo(() => items.map((item) => {
    const producto = productos.find((current) => current.id === item.productoId)
    return { ...item, producto, subtotal: Number(producto?.precio || 0) * item.cantidad }
  }), [items, productos])

  const total = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0)

  const addItem = () => {
    const product = productos.find((item) => item.id === Number(productoId))
    const qty = Number(cantidad)
    if (!product || qty <= 0) {
      showToast('Selecciona producto y cantidad válida.', 'danger')
      return
    }
    const currentQty = items.find((item) => item.productoId === product.id)?.cantidad || 0
    if (currentQty + qty > product.stock) {
      showToast(`Stock insuficiente. Disponible: ${product.stock}.`, 'danger')
      return
    }
    setItems((current) => {
      const exists = current.find((item) => item.productoId === product.id)
      if (exists) return current.map((item) => item.productoId === product.id ? { ...item, cantidad: item.cantidad + qty } : item)
      return [...current, { productoId: product.id, cantidad: qty }]
    })
    setProductoId('')
    setCantidad('1')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!clienteId) {
      showToast('Selecciona un cliente.', 'danger')
      return
    }
    if (items.length === 0) {
      showToast('Agrega al menos un producto.', 'danger')
      return
    }
    try {
      setSaving(true)
      const venta = await ventasResource.create({ clienteId: Number(clienteId), detalles: items })
      showToast('Venta registrada.', 'success')
      navigate(`/ventas/${venta.id}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo registrar la venta.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <form className="page-stack" onSubmit={submit}>
      <div className="page-header">
        <div><h1>Nueva venta</h1><p>Selecciona cliente, agrega productos y confirma el total.</p></div>
      </div>
      <section className="sale-layout">
        <Card>
          <div className="form-grid">
            <Select id="cliente" label="Cliente" value={clienteId} onChange={(event) => setClienteId(event.target.value)} className="span-2">
              <option value="">Seleccionar cliente</option>
              {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nombres} {cliente.apellidos}</option>)}
            </Select>
            <Select id="producto" label="Producto" value={productoId} onChange={(event) => setProductoId(event.target.value)}>
              <option value="">Seleccionar producto</option>
              {productos.filter((producto) => producto.stock > 0).map((producto) => (
                <option key={producto.id} value={producto.id}>{producto.nombre} - stock {producto.stock}</option>
              ))}
            </Select>
            <Field id="cantidad" label="Cantidad" type="number" min="1" value={cantidad} onChange={(event) => setCantidad(event.target.value)} />
            <div className="span-2">
              <Button type="button" variant="secondary" icon={<Plus size={18} />} onClick={addItem}>Agregar producto</Button>
            </div>
          </div>
          {enrichedItems.length === 0 ? <EmptyState title="Agrega productos para construir la venta." /> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Producto</th><th>Cantidad</th><th>Subtotal</th><th>Acciones</th></tr></thead>
                <tbody>
                  {enrichedItems.map((item) => (
                    <tr key={item.productoId}>
                      <td>{item.producto?.nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>{toMoney(item.subtotal)}</td>
                      <td><Button variant="ghost" icon={<Trash2 size={17} />} onClick={() => setItems((current) => current.filter((row) => row.productoId !== item.productoId))} aria-label="Quitar" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card className="summary-card">
          <h2>Resumen</h2>
          <div className="summary-row"><span>Items</span><strong>{items.length}</strong></div>
          <div className="summary-row total"><span>Total</span><strong>{toMoney(total)}</strong></div>
          <Button type="submit" loading={saving}>Confirmar venta</Button>
        </Card>
      </section>
    </form>
  )
}
