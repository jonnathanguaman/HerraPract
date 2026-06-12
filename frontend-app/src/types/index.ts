export type User = {
  id: number
  email: string
  rol: 'admin' | 'user'
  createdAt?: string
  updatedAt?: string
}

export type Categoria = {
  id: number
  nombre: string
  descripcion?: string | null
  createdAt?: string
  updatedAt?: string
}

export type Producto = {
  id: number
  nombre: string
  descripcion?: string | null
  precio: string | number
  stock: number
  categoriaId?: number | null
  categoria?: Categoria | null
  createdAt?: string
  updatedAt?: string
}

export type Cliente = {
  id: number
  identificacion: string
  nombres: string
  apellidos: string
  email: string
  telefono: string
  direccion: string
  createdAt?: string
  updatedAt?: string
}

export type DetalleVenta = {
  id: number
  ventaId: number
  productoId: number
  cantidad: number
  precioUnitario: string | number
  subtotal: string | number
  producto?: Producto
}

export type Venta = {
  id: number
  fecha: string
  total: string | number
  clienteId: number
  cliente?: Cliente
  detalles: DetalleVenta[]
  createdAt?: string
  updatedAt?: string
}

export type DashboardResumen = {
  totalProductos: number
  productosStockBajo: Producto[]
  ventasHoy: number
  totalVendidoHoy: number
  ventasRecientes: Venta[]
  productosMenorStock: Producto[]
  stockBajoUmbral: number
}

export type ReporteVentas = {
  desde: string
  hasta: string
  totalVentas: number
  totalVendido: number
  ventas: Venta[]
  productosMasVendidos: Array<{
    productoId: number
    cantidadVendida: string | number
    totalVendido: string | number
    producto?: Producto
  }>
}

export type ApiError = {
  status?: string
  message: string
  errors?: string[]
}
