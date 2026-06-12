import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header>
          <h2 id="modal-title">{title}</h2>
          <Button variant="ghost" icon={<X size={18} />} onClick={onClose} aria-label="Cerrar" />
        </header>
        {children}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  title,
  message,
  open,
  onCancel,
  onConfirm,
  loading,
}: {
  title: string
  message: string
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  loading?: boolean
}) {
  return (
    <Modal title={title} open={open} onClose={onCancel}>
      <p className="muted">{message}</p>
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>Eliminar</Button>
      </div>
    </Modal>
  )
}
