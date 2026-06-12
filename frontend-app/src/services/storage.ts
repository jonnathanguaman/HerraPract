import type { User } from '../types'

const ACCESS_TOKEN = 'herramientas_access_token'
const REFRESH_TOKEN = 'herramientas_refresh_token'
const USER = 'herramientas_user'

export const storage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN),
  getUser: (): User | null => {
    const raw = localStorage.getItem(USER)
    return raw ? (JSON.parse(raw) as User) : null
  },
  setSession: (user: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem(USER, JSON.stringify(user))
    localStorage.setItem(ACCESS_TOKEN, accessToken)
    localStorage.setItem(REFRESH_TOKEN, refreshToken)
  },
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN, accessToken)
    localStorage.setItem(REFRESH_TOKEN, refreshToken)
  },
  clear: () => {
    localStorage.removeItem(USER)
    localStorage.removeItem(ACCESS_TOKEN)
    localStorage.removeItem(REFRESH_TOKEN)
  },
}
