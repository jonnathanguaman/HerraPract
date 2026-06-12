import { Edit, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Textarea } from '../../components/ui/Form'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State'
import { useToast } from '../../components/ui/Toast'
import { categoriasResource } from '../../services/resources'
import type { Categoria } from '../../types'

export function CategoriesPage() {
  const [items, setItems] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [deleting, setDeleting] = useState<Categoria | null>(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const load = () => {
    setLoading(true)
    categoriasResource.list()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudieron cargar categorías'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openForm = (categoria?: Categoria) => {
    setEditing(categoria || { id: 0, nombre: '', descripcion: '' })
    setForm({ nombre: categoria?.nombre || '', descripcion: categoria?.descripcion || '' })
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.nombre) {
      showToast('El nombre es obligatorio.', 'danger')
      return
    }
    try {
      setSaving(true)
      if (editing?.id) await categoriasResource.update(editing.id, form)
      else await categoriasResource.create(form)
      showToast('Categoría guardada.', 'success')
      setEditing(null)
      load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo guardar.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleting) return
    try {
      setSaving(true)
      await categoriasResource.remove(deleting.id)
      setItems((current) => current.filter((item) => item.id !== deleting.id))
      showToast('Categoría eliminada.', 'success')
      setDeleting(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="page-stack">
      <div className="page-header">
        <div><h1>Categorías</h1><p>Organiza productos por familias de herramientas.</p></div>
        <Button icon={<Plus size={18} />} onClick={() => openForm()}>Nueva categoría</Button>
      </div>
      <Card>
        {items.length === 0 ? <EmptyState title="No hay categorías registradas." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nombre</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.nombre}</strong></td>
                    <td>{item.descripcion || 'Sin descripción'}</td>
                    <td><Badge tone="info">Activa</Badge></td>
                    <td className="row-actions">
                      <Button variant="ghost" icon={<Edit size={17} />} onClick={() => openForm(item)} aria-label="Editar" />
                      <Button variant="ghost" icon={<Trash2 size={17} />} onClick={() => setDeleting(item)} aria-label="Eliminar" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Modal title={editing?.id ? 'Editar categoría' : 'Nueva categoría'} open={Boolean(editing)} onClose={() => setEditing(null)}>
        <form className="modal-form" onSubmit={save}>
          <Field id="categoria-nombre" label="Nombre" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
          <Textarea id="categoria-descripcion" label="Descripción" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} />
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Guardar</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog title="Eliminar categoría" message={`Se intentará eliminar ${deleting?.nombre || 'esta categoría'}. Si tiene productos asociados, la API puede bloquearlo.`} open={Boolean(deleting)} onCancel={() => setDeleting(null)} onConfirm={remove} loading={saving} />
    </div>
  )
}
