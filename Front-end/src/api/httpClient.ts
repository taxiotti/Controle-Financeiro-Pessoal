import { centsToDecimal, currentMonth, decimalToCents, shiftMonth } from '../lib/format'
import { AppError } from './types'
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

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '')
const API_PAGE_SIZE = 100

type ApiError = { error?: string; detail?: string }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...init?.headers },
    })
  } catch {
    throw new AppError('Não foi possível conectar à API. Inicie o backend e execute o seed.', 503)
  }

  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => ({} as ApiError)) as T | ApiError
  if (!response.ok) {
    const error = body as ApiError
    throw new AppError(error.error ?? error.detail ?? 'Não foi possível concluir a operação.', response.status)
  }
  return body as T
}

function queryString(values: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

function hasFilters(filtros: FiltrosTransacao): boolean {
  return Boolean(filtros.from || filtros.to || filtros.tipo || filtros.categoriaId || filtros.minValor || filtros.maxValor)
}

function applyFilters(transactions: Transacao[], filtros: FiltrosTransacao): Transacao[] {
  const min = filtros.minValor ? decimalToCents(filtros.minValor) : undefined
  const max = filtros.maxValor ? decimalToCents(filtros.maxValor) : undefined
  return transactions
    .filter((item) => !filtros.from || item.data >= filtros.from)
    .filter((item) => !filtros.to || item.data <= filtros.to)
    .filter((item) => !filtros.tipo || item.tipo === filtros.tipo)
    .filter((item) => !filtros.categoriaId || item.categoriaId === filtros.categoriaId)
    .filter((item) => min === undefined || decimalToCents(item.valor) >= min)
    .filter((item) => max === undefined || decimalToCents(item.valor) <= max)
}

function summarize(transactions: Transacao[], ano: number, mes: number): ResumoMensal {
  const prefix = `${ano}-${String(mes).padStart(2, '0')}-`
  let receitas = 0
  let despesas = 0
  transactions.forEach((transaction) => {
    if (!transaction.data.startsWith(prefix)) return
    if (transaction.tipo === 'receita') receitas += decimalToCents(transaction.valor)
    else despesas += decimalToCents(transaction.valor)
  })
  return {
    ano,
    mes,
    totalReceitas: centsToDecimal(receitas),
    totalDespesas: centsToDecimal(despesas),
    saldo: centsToDecimal(receitas - despesas),
  }
}

class HttpFinanceClient implements FinanceClient {
  async listarCategorias(): Promise<Categoria[]> {
    return request<Categoria[]>('/categorias')
  }

  async criarCategoria(input: CategoriaInput): Promise<Categoria> {
    return request<Categoria>('/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  }

  async atualizarCategoria(id: string, input: CategoriaInput): Promise<Categoria> {
    return request<Categoria>(`/categorias/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  }

  async excluirCategoria(id: string): Promise<void> {
    await request<void>(`/categorias/${id}`, { method: 'DELETE' })
  }

  private async listarPagina(page: number, pageSize: number): Promise<PaginaTransacoes> {
    return request<PaginaTransacoes>(`/transacoes${queryString({ page, pageSize })}`)
  }

  private async todasTransacoes(): Promise<Transacao[]> {
    const firstPage = await this.listarPagina(1, API_PAGE_SIZE)
    const pages = Math.ceil(firstPage.total / API_PAGE_SIZE)
    if (pages <= 1) return firstPage.items
    const remaining = await Promise.all(
      Array.from({ length: pages - 1 }, (_, index) => this.listarPagina(index + 2, API_PAGE_SIZE)),
    )
    return [firstPage, ...remaining].flatMap((page) => page.items)
  }

  async listarTransacoes(filtros: FiltrosTransacao = {}): Promise<PaginaTransacoes> {
    const page = Math.max(1, filtros.page ?? 1)
    const pageSize = Math.min(API_PAGE_SIZE, Math.max(1, filtros.pageSize ?? 20))
    if (!hasFilters(filtros)) return this.listarPagina(page, pageSize)

    // O backend atual ainda não recebeu os filtros do contrato. Mantemos a UI correta
    // enquanto a busca paginada continua vindo exclusivamente da API.
    const filtered = applyFilters(await this.todasTransacoes(), filtros)
    const start = (page - 1) * pageSize
    return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize }
  }

  async criarTransacao(input: TransacaoInput): Promise<Transacao> {
    return request<Transacao>('/transacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  }

  async atualizarTransacao(id: string, input: TransacaoInput): Promise<Transacao> {
    return request<Transacao>(`/transacoes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  }

  async excluirTransacao(id: string): Promise<void> {
    await request<void>(`/transacoes/${id}`, { method: 'DELETE' })
  }

  async obterResumo(ano: number, mes: number): Promise<ResumoMensal> {
    return summarize(await this.todasTransacoes(), ano, mes)
  }

  async obterPizza(ano: number, mes: number, tipo: TipoTransacao): Promise<FatiaPizza[]> {
    const prefix = `${ano}-${String(mes).padStart(2, '0')}-`
    const totals = new Map<string, FatiaPizza>()
    ;(await this.todasTransacoes()).forEach((transaction) => {
      if (transaction.tipo !== tipo || !transaction.data.startsWith(prefix)) return
      const current = totals.get(transaction.categoriaId)
      const category = transaction.categoria
      totals.set(transaction.categoriaId, {
        categoriaId: transaction.categoriaId,
        nome: category?.nome ?? 'Sem categoria',
        cor: category?.cor ?? '#64748B',
        total: centsToDecimal(decimalToCents(current?.total ?? '0') + decimalToCents(transaction.valor)),
      })
    })
    return [...totals.values()].sort((a, b) => decimalToCents(b.total) - decimalToCents(a.total))
  }

  async obterEvolucao(meses = 6): Promise<PontoEvolucao[]> {
    const count = Math.min(24, Math.max(1, meses))
    const current = currentMonth()
    const transactions = await this.todasTransacoes()
    return Array.from({ length: count }, (_, index) => {
      const point = shiftMonth(current.ano, current.mes, index - count + 1)
      return summarize(transactions, point.ano, point.mes)
    })
  }

  async obterComparativo(ano: number, mes: number): Promise<Comparativo> {
    const transactions = await this.todasTransacoes()
    const atual = summarize(transactions, ano, mes)
    const previous = shiftMonth(ano, mes, -1)
    const anterior = summarize(transactions, previous.ano, previous.mes)
    return {
      atual,
      anterior,
      variacaoReceitas: centsToDecimal(decimalToCents(atual.totalReceitas) - decimalToCents(anterior.totalReceitas)),
      variacaoDespesas: centsToDecimal(decimalToCents(atual.totalDespesas) - decimalToCents(anterior.totalDespesas)),
      variacaoSaldo: centsToDecimal(decimalToCents(atual.saldo) - decimalToCents(anterior.saldo)),
    }
  }
}

export const financeClient: FinanceClient = new HttpFinanceClient()
