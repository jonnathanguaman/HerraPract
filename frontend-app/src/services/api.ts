import type { ApiError } from '../types'
import { storage } from './storage'

const API_URL = import.meta.env.VITE_API_URL || ''

type RequestOptions = RequestInit & { retry?: boolean }

export class ApiRequestError extends Error {
  status: number
  details?: ApiError

  constructor(status: number, details?: ApiError) {
    super(details?.message || 'Error inesperado')
    this.status = status
    this.details = details
  }
}

const refreshTokens = async () => {
  const refreshToken = storage.getRefreshToken()
  if (!refreshToken) return false

  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) return false
  const data = (await response.json()) as { accessToken: string; refreshToken: string }
  storage.setTokens(data.accessToken, data.refreshToken)
  return true
}

export const api = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers)
  const token = storage.getAccessToken()

  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (response.status === 401 && options.retry !== false && (await refreshTokens())) {
    return api<T>(path, { ...options, retry: false })
  }

  if (!response.ok) {
    let details: ApiError | undefined
    try {
      details = (await response.json()) as ApiError
    } catch {
      details = { message: 'No se pudo procesar la respuesta del servidor' }
    }
    if (response.status === 401) storage.clear()
    throw new ApiRequestError(response.status, details)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const toMoney = (value: string | number | undefined) =>
  new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(Number(value || 0))

export const formatDate = (date: string | undefined) =>
  date ? new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date)) : '-'
