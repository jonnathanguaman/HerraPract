import { Edit, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Textarea } from '../../components/ui/Form'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State'
import { useToast } from '../../components/ui/Toast'
import { clientesResource } from '../../services/resources'
import type { Cliente } from '../../types'

const blankClient = { identificacion: '', nombres: '', apellidos: '', email: '', telefono: '', direccion: '' }

export function ClientsPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [deleting, setDeleting] = useState<Cliente | null>(null)
  const [form, setForm] = useState(blankClient)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const load = () => {
    setLoading(true)
    clientesResource.list()
      .then(setClientes)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudieron cargar clientes'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(() => clientes.filter((cliente) =>
    `${cliente.identificacion} ${cliente.nombres} ${cliente.apellidos} ${cliente.email}`.toLowerCase().includes(query.toLowerCase())
  ), [clientes, query])

  const openForm = (cliente?: Cliente) => {
    setEditing(cliente || { id: 0, ...blankClient })
    setForm(cliente ? {
      identificacion: cliente.identificacion,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
    } : blankClient)
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (Object.values(form).some((value) => !value)) {
      showToast('Todos los campos son obligatorios.', 'danger')
      return
    }
    if (!form.email.includes('@')) {
      showToast('Ingresa un email válido.', 'danger')
      return
    }
    try {
      setSaving(true)
      if (editing?.id) await clientesResource.update(editing.id, form)
      else await clientesResource.create(form)
      showToast('Cliente guardado.', 'success')
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
      await clientesResource.remove(deleting.id)
      setClientes((current) => current.filter((cliente) => cliente.id !== deleting.id))
      showToast('Cliente eliminado.', 'success')
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
        <div><h1>Clientes</h1><p>Gestiona compradores y datos de contacto.</p></div>
        <Button icon={<Plus size={18} />} onClick={() => openForm()}>Nuevo cliente</Button>
      </div>
      <Card>
        <div className="filters single">
          <Field id="buscar-cliente" label="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Identificación, nombre o email" />
        </div>
        {filtered.length === 0 ? <EmptyState title="No hay clientes para mostrar." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Identificación</th><th>Cliente</th><th>Email</th><th>Teléfono</th><th>Acciones</th></tr></thead>
              <tbody>
                {filtered.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.identificacion}</td>
                    <td><strong>{cliente.nombres} {cliente.apellidos}</strong><span>{cliente.direccion}</span></td>
                    <td>{cliente.email}</td>
                    <td>{cliente.telefono}</td>
                    <td className="row-actions">
                      <Button variant="ghost" icon={<Edit size={17} />} onClick={() => openForm(cliente)} aria-label="Editar" />
                      <Button variant="ghost" icon={<Trash2 size={17} />} onClick={() => setDeleting(cliente)} aria-label="Eliminar" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Modal title={editing?.id ? 'Editar cliente' : 'Nuevo cliente'} open={Boolean(editing)} onClose={() => setEditing(null)}>
        <form className="form-grid modal-form" onSubmit={save}>
          <Field id="identificacion" label="Identificación" value={form.identificacion} onChange={(event) => setForm({ ...form, identificacion: event.target.value })} />
          <Field id="nombres" label="Nombres" value={form.nombres} onChange={(event) => setForm({ ...form, nombres: event.target.value })} />
          <Field id="apellidos" label="Apellidos" value={form.apellidos} onChange={(event) => setForm({ ...form, apellidos: event.target.value })} />
          <Field id="email" label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <Field id="telefono" label="Teléfono" value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} />
          <Textarea id="direccion" label="Dirección" value={form.direccion} onChange={(event) => setForm({ ...form, direccion: event.target.value })} />
          <div className="form-actions span-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Guardar</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog title="Eliminar cliente" message={`Se intentará eliminar ${deleting?.nombres || 'este cliente'}. Si tiene ventas asociadas, la API puede bloquearlo.`} open={Boolean(deleting)} onCancel={() => setDeleting(null)} onConfirm={remove} loading={saving} />
    </div>
  )
}
