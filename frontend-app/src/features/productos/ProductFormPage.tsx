import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Select, Textarea } from '../../components/ui/Form'
import { ErrorState, LoadingState } from '../../components/ui/State'
import { useToast } from '../../components/ui/Toast'
import { categoriasResource, productosResource } from '../../services/resources'
import type { Categoria } from '../../types'

type ProductForm = { nombre: string; descripcion: string; precio: string; stock: string; categoriaId: string }

const initialForm: ProductForm = { nombre: '', descripcion: '', precio: '', stock: '0', categoriaId: '' }

export function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState(initialForm)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([categoriasResource.list(), id ? productosResource.get(id) : Promise.resolve(null)])
      .then(([cats, producto]) => {
        setCategorias(cats)
        if (producto) {
          setForm({
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            precio: String(producto.precio),
            stock: String(producto.stock),
            categoriaId: producto.categoriaId ? String(producto.categoriaId) : '',
          })
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el formulario'))
      .finally(() => setLoading(false))
  }, [id])

  const update = (key: keyof ProductForm, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!form.nombre || !form.precio) {
      setError('Nombre y precio son obligatorios.')
      return
    }
    if (Number(form.precio) < 0 || Number(form.stock) < 0) {
      setError('Precio y stock no pueden ser negativos.')
      return
    }

    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: Number(form.precio),
      stock: Number(form.stock),
      categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
    }

    try {
      setSaving(true)
      if (id) await productosResource.update(id, payload)
      else await productosResource.create(payload)
      showToast(id ? 'Producto actualizado.' : 'Producto creado.', 'success')
      navigate('/productos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />
  if (error && !form.nombre && id) return <ErrorState message={error} />

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>{id ? 'Editar producto' : 'Nuevo producto'}</h1>
          <p>Registra información comercial y stock disponible.</p>
        </div>
      </div>
      <Card>
        <form className="form-grid" onSubmit={submit}>
          <Field id="nombre" label="Nombre" value={form.nombre} onChange={(event) => update('nombre', event.target.value)} />
          <Field id="precio" label="Precio" type="number" min="0" step="0.01" value={form.precio} onChange={(event) => update('precio', event.target.value)} />
          <Field id="stock" label="Stock" type="number" min="0" value={form.stock} onChange={(event) => update('stock', event.target.value)} />
          <Select id="categoria" label="Categoría" value={form.categoriaId} onChange={(event) => update('categoriaId', event.target.value)}>
            <option value="">Sin categoría</option>
            {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
          </Select>
          <Textarea id="descripcion" label="Descripción" value={form.descripcion} onChange={(event) => update('descripcion', event.target.value)} className="span-2" />
          {error ? <div className="form-error span-2">{error}</div> : null}
          <div className="form-actions span-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/productos')}>Cancelar</Button>
            <Button type="submit" loading={saving}>Guardar</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
