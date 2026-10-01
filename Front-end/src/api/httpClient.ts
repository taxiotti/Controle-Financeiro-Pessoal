import type {
  Categoria,
  CategoriaInput,
  Comparativo,
  FatiaPizza,
  FiltrosTransacao,
  FinanceClient,
  PaginaTransacoes,
  PontoEvolucao,
  ResumoMensal,
  TipoTransacao,
  Transacao,
  TransacaoInput,
} from './types'
import { AppError } from './types'
import { centsToDecimal, decimalToCents } from '../lib/format'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  })

  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => ({})) as { error?: string }

  if (!response.ok) {
    throw new AppError(body.error ?? `Não foi possível acessar a API (${response.status}).`, response.status)
  }

  return body as T
}

function asString(value: string | number): string {
  return String(value)
}

function normalizeCategoria(category: Categoria): Categoria {
  return { ...category, id: asString(category.id) }
}

function normalizeTransacao(transaction: Transacao): Transacao {
  return {
    ...transaction,
    id: asString(transaction.id),
    categoriaId: asString(transaction.categoriaId),
    categoria: transaction.categoria ? normalizeCategoria(transaction.categoria) : undefined,
  }
}

function normalizePage(page: PaginaTransacoes): PaginaTransacoes {
  return {
    ...page,
    items: page.items.map(normalizeTransacao),
  }
}

export class HttpFinanceClient implements FinanceClient {
  async listarCategorias(): Promise<Categoria[]> {
    const categories = await request<Categoria[]>('/categorias')
    return categories.map(normalizeCategoria)
  }

  async criarCategoria(input: CategoriaInput): Promise<Categoria> {
    return normalizeCategoria(await request<Categoria>('/categorias', {
      method: 'POST',
      body: JSON.stringify(input),
    }))
  }

  async atualizarCategoria(id: string, input: CategoriaInput): Promise<Categoria> {
    return normalizeCategoria(await request<Categoria>(`/categorias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }))
  }

  async excluirCategoria(id: string): Promise<void> {
    await request<void>(`/categorias/${id}`, { method: 'DELETE' })
  }

  async listarTransacoes(filtros: FiltrosTransacao = {}): Promise<PaginaTransacoes> {
    const page = Math.max(1, filtros.page ?? 1)
    const pageSize = Math.min(100, Math.max(1, filtros.pageSize ?? 20))
    const hasExtraFilters = Boolean(
      filtros.from || filtros.to || filtros.tipo || filtros.categoriaId || filtros.minValor || filtros.maxValor,
    )

    if (!hasExtraFilters) {
      return normalizePage(
        await request<PaginaTransacoes>(`/transacoes?page=${page}&pageSize=${pageSize}`),
      )
    }

    const items = await this.fetchAllTransactions()
    const min = filtros.minValor ? decimalToCents(filtros.minValor) : undefined
    const max = filtros.maxValor ? decimalToCents(filtros.maxValor) : undefined
    const filtered = items
      .filter((item) => !filtros.from || item.data >= filtros.from)
      .filter((item) => !filtros.to || item.data <= filtros.to)
      .filter((item) => !filtros.tipo || item.tipo === filtros.tipo)
      .filter((item) => !filtros.categoriaId || item.categoriaId === filtros.categoriaId)
      .filter((item) => min === undefined || decimalToCents(item.valor) >= min)
      .filter((item) => max === undefined || decimalToCents(item.valor) <= max)

    const start = (page - 1) * pageSize
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    }
  }

  async criarTransacao(input: TransacaoInput): Promise<Transacao> {
    return normalizeTransacao(await request<Transacao>('/transacoes', {
      method: 'POST',
      body: JSON.stringify({
        tipo: input.tipo,
        valor: Number(centsToDecimal(decimalToCents(input.valor))),
        descricao: input.descricao,
        data: input.data,
        categoriaId: input.categoriaId,
      }),
    }))
  }

  async atualizarTransacao(id: string, input: TransacaoInput): Promise<Transacao> {
    return normalizeTransacao(await request<Transacao>(`/transacoes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        tipo: input.tipo,
        valor: Number(centsToDecimal(decimalToCents(input.valor))),
        descricao: input.descricao,
        data: input.data,
        categoriaId: input.categoriaId,
      }),
    }))
  }

  async excluirTransacao(id: string): Promise<void> {
    await request<void>(`/transacoes/${id}`, { method: 'DELETE' })
  }

  async obterResumo(ano: number, mes: number): Promise<ResumoMensal> {
    return request<ResumoMensal>(`/relatorios/resumo?ano=${ano}&mes=${mes}`)
  }

  async obterPizza(ano: number, mes: number, tipo: TipoTransacao): Promise<FatiaPizza[]> {
    const slices = await request<FatiaPizza[]>(`/relatorios/pizza?ano=${ano}&mes=${mes}&tipo=${tipo}`)
    return slices.map((slice) => ({ ...slice, categoriaId: asString(slice.categoriaId) }))
  }

  async obterEvolucao(meses = 6): Promise<PontoEvolucao[]> {
    return request<PontoEvolucao[]>(`/relatorios/evolucao?meses=${meses}`)
  }

  async obterComparativo(ano: number, mes: number): Promise<Comparativo> {
    return request<Comparativo>(`/relatorios/comparativo?ano=${ano}&mes=${mes}`)
  }

  private async fetchAllTransactions(): Promise<Transacao[]> {
    const first = normalizePage(await request<PaginaTransacoes>('/transacoes?page=1&pageSize=100'))
    const pages = [first]
    const totalPages = Math.max(1, Math.ceil(first.total / first.pageSize))

    for (let page = 2; page <= totalPages; page += 1) {
      pages.push(
        normalizePage(await request<PaginaTransacoes>(`/transacoes?page=${page}&pageSize=${first.pageSize}`)),
      )
    }

    return pages.flatMap((page) => page.items)
  }
}

export const httpFinanceClient: FinanceClient = new HttpFinanceClient()
