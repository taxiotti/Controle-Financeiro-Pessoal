import { clearSessao, getToken } from './session'

const baseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers })
  if (!response.ok) {
    if (response.status === 401) clearSessao()
    const payload = await response.json().catch(() => null) as { error?: string } | null
    throw new ApiError(payload?.error ?? 'Não foi possível concluir a solicitação.', response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export type Usuario = { id: string; nome: string; email: string }
export type Sessao = { accessToken: string; tokenType: string; usuario: Usuario }

export const api = {
  login: (email: string, senha: string) => request<Sessao>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, senha }),
  }),
  register: (nome: string, email: string, senha: string) => request<Sessao>('/auth/register', {
    method: 'POST', body: JSON.stringify({ nome, email, senha }),
  }),
  me: () => request<Usuario>('/auth/me'),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  exportarCsv: async () => {
    const headers = new Headers()
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const response = await fetch(`${baseUrl}/transacoes/export`, { headers })
    if (!response.ok) {
      if (response.status === 401) clearSessao()
      throw new ApiError('Não foi possível exportar o CSV.', response.status)
    }
    return response.blob()
  },
}
