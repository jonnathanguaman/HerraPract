import { api } from './api'
import type { Categoria, Cliente, DashboardResumen, Producto, ReporteVentas, Venta } from '../types'

export const authResource = {
  me: () => api('/api/auth/me'),
}

export const productosResource = {
  list: () => api<Producto[]>('/api/productos'),
  get: (id: string) => api<Producto>(`/api/productos/${id}`),
  create: (payload: Partial<Producto>) => api<Producto>('/api/productos', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<Producto>) => api<Producto>(`/api/productos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: number) => api<void>(`/api/productos/${id}`, { method: 'DELETE' }),
}

export const categoriasResource = {
  list: () => api<Categoria[]>('/api/categorias'),
  create: (payload: Partial<Categoria>) => api<Categoria>('/api/categorias', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: Partial<Categoria>) => api<Categoria>(`/api/categorias/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: number) => api<void>(`/api/categorias/${id}`, { method: 'DELETE' }),
}

export const clientesResource = {
  list: () => api<Cliente[]>('/api/clientes'),
  create: (payload: Partial<Cliente>) => api<Cliente>('/api/clientes', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: Partial<Cliente>) => api<Cliente>(`/api/clientes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: number) => api<void>(`/api/clientes/${id}`, { method: 'DELETE' }),
}

export const ventasResource = {
  list: () => api<Venta[]>('/api/ventas'),
  get: (id: string) => api<Venta>(`/api/ventas/${id}`),
  create: (payload: { clienteId: number; detalles: Array<{ productoId: number; cantidad: number }> }) =>
    api<Venta>('/api/ventas', { method: 'POST', body: JSON.stringify(payload) }),
  remove: (id: number) => api<void>(`/api/ventas/${id}`, { method: 'DELETE' }),
}

export const dashboardResource = {
  resumen: () => api<DashboardResumen>('/api/dashboard/resumen'),
}

export const reportesResource = {
  ventas: (desde: string, hasta: string) => api<ReporteVentas>(`/api/reportes/ventas?desde=${desde}&hasta=${hasta}`),
}
