// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AppRouter from './AppRouter'
import { setSessao } from './lib/session'

describe('application routes', () => {
  beforeEach(() => {
    localStorage.clear()
    setSessao('token-de-teste', { id: '10000000-0000-4000-8000-000000000001', nome: 'Usuário Teste', email: 'teste@example.com' })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: '10000000-0000-4000-8000-000000000001', nome: 'Usuário Teste', email: 'teste@example.com' }), { status: 200, headers: { 'Content-Type': 'application/json' } })))
  })

  afterEach(() => vi.unstubAllGlobals())

  it('abre o dashboard com resumo vazio', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <MemoryRouter initialEntries={['/']}>
        <QueryClientProvider client={client}><AppRouter /></QueryClientProvider>
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: /organizar seu dinheiro/i })).toBeInTheDocument()
    const zeroValues = await screen.findAllByText((content) => content.replace(/\s/g, ' ') === 'R$ 0,00')
    expect(zeroValues).toHaveLength(3)
  })

  it('abre categorias com o seed definido na spec', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <MemoryRouter initialEntries={['/categorias']}>
        <QueryClientProvider client={client}><AppRouter /></QueryClientProvider>
      </MemoryRouter>,
    )
    expect(await screen.findByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Investimentos')).toBeInTheDocument()
  })
})
