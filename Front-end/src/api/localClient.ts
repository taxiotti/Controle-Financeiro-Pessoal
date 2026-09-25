import { categoriaSchema } from './schemas'
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
import { centsToDecimal, currentMonth, decimalToCents, shiftMonth } from '../lib/format'

const STORAGE_KEY = 'cfp:v1:data'
const VERSION = 1

type Database = {
  version: number
  categorias: Categoria[]
  transacoes: Transacao[]
}

const defaultCategories: Categoria[] = [
  { id: '10000000-0000-4000-8000-000000000001', nome: 'Alimentação', tipo: 'despesa', cor: '#F59E0B', icone: 'utensils', padrao: true },
  { id: '10000000-0000-4000-8000-000000000002', nome: 'Transporte', tipo: 'despesa', cor: '#3B82F6', icone: 'car', padrao: true },
  { id: '10000000-0000-4000-8000-000000000003', nome: 'Moradia', tipo: 'despesa', cor: '#8B5CF6', icone: 'house', padrao: true },
  { id: '10000000-0000-4000-8000-000000000004', nome: 'Saúde', tipo: 'despesa', cor: '#EF4444', icone: 'heart-pulse', padrao: true },
  { id: '10000000-0000-4000-8000-000000000005', nome: 'Educação', tipo: 'despesa', cor: '#06B6D4', icone: 'graduation-cap', padrao: true },
  { id: '10000000-0000-4000-8000-000000000006', nome: 'Lazer', tipo: 'despesa', cor: '#EC4899', icone: 'gamepad', padrao: true },
  { id: '10000000-0000-4000-8000-000000000007', nome: 'Salário', tipo: 'receita', cor: '#22C55E', icone: 'wallet', padrao: true },
  { id: '10000000-0000-4000-8000-000000000008', nome: 'Investimentos', tipo: 'receita', cor: '#14B8A6', icone: 'chart', padrao: true },
  { id: '10000000-0000-4000-8000-000000000009', nome: 'Outros', tipo: 'ambos', cor: '#64748B', icone: 'shapes', padrao: true },
]

function emptyDatabase(): Database {
  return { version: VERSION, categorias: defaultCategories.map((category) => ({ ...category })), transacoes: [] }
}

function loadDatabase(): Database {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const database = emptyDatabase()
    saveDatabase(database)
    return database
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Database>
    if (parsed.version !== VERSION || !Array.isArray(parsed.categorias) || !Array.isArray(parsed.transacoes)) {
      throw new Error('Versão ou formato inválido')
    }
    return parsed as Database
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    const database = emptyDatabase()
    saveDatabase(database)
    return database
  }
}

function saveDatabase(database: Database): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database))
}

function enrich(transaction: Transacao, categories: Categoria[]): Transacao {
  return { ...transaction, categoria: categories.find((category) => category.id === transaction.categoriaId) }
}

function validateCategory(input: CategoriaInput): CategoriaInput {
  const parsed = categoriaSchema.safeParse(input)
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message ?? 'Categoria inválida')
  return parsed.data
}

function validateTransaction(input: TransacaoInput, categories: Categoria[]): Omit<Transacao, 'id' | 'categoria'> {
  const category = categories.find((item) => item.id === input.categoriaId)
  if (!category) throw new AppError('Categoria não encontrada')
  if (category.tipo !== 'ambos' && category.tipo !== input.tipo) {
    throw new AppError('A categoria escolhida não é compatível com o tipo da transação')
  }
  if (!input.descricao.trim() || input.descricao.trim().length > 120) throw new AppError('Descrição inválida')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.data)) throw new AppError('Data inválida')
  const cents = decimalToCents(input.valor)
  if (cents <= 0) throw new AppError('O valor deve ser maior que zero')
  return { ...input, descricao: input.descricao.trim(), valor: centsToDecimal(cents) }
}

function summarize(transactions: Transacao[], ano: number, mes: number): ResumoMensal {
  const prefix = `${ano}-${String(mes).padStart(2, '0')}-`
  let receitas = 0
  let despesas = 0
  for (const transaction of transactions) {
    if (!transaction.data.startsWith(prefix)) continue
    const value = decimalToCents(transaction.valor)
    if (transaction.tipo === 'receita') receitas += value
    else despesas += value
  }
  return {
    ano,
    mes,
    totalReceitas: centsToDecimal(receitas),
    totalDespesas: centsToDecimal(despesas),
    saldo: centsToDecimal(receitas - despesas),
  }
}

class LocalFinanceClient implements FinanceClient {
  async listarCategorias(): Promise<Categoria[]> {
    return loadDatabase().categorias.sort((a, b) => Number(b.padrao) - Number(a.padrao) || a.nome.localeCompare(b.nome))
  }

  async criarCategoria(input: CategoriaInput): Promise<Categoria> {
    const database = loadDatabase()
    const valid = validateCategory(input)
    if (database.categorias.some((category) => category.nome.toLocaleLowerCase('pt-BR') === valid.nome.toLocaleLowerCase('pt-BR'))) {
      throw new AppError('Já existe uma categoria com esse nome', 409)
    }
    const category: Categoria = { ...valid, id: crypto.randomUUID(), padrao: false }
    database.categorias.push(category)
    saveDatabase(database)
    return category
  }

  async atualizarCategoria(id: string, input: CategoriaInput): Promise<Categoria> {
    const database = loadDatabase()
    const index = database.categorias.findIndex((category) => category.id === id)
    if (index < 0) throw new AppError('Categoria não encontrada', 404)
    const valid = validateCategory(input)
    if (database.categorias.some((category) => category.id !== id && category.nome.toLocaleLowerCase('pt-BR') === valid.nome.toLocaleLowerCase('pt-BR'))) {
      throw new AppError('Já existe uma categoria com esse nome', 409)
    }
    if (valid.tipo !== 'ambos' && database.transacoes.some((transaction) => transaction.categoriaId === id && transaction.tipo !== valid.tipo)) {
      throw new AppError('O novo tipo é incompatível com transações já vinculadas', 409)
    }
    const category = { ...database.categorias[index], ...valid }
    database.categorias[index] = category
    saveDatabase(database)
    return category
  }

  async excluirCategoria(id: string): Promise<void> {
    const database = loadDatabase()
    const category = database.categorias.find((item) => item.id === id)
    if (!category) throw new AppError('Categoria não encontrada', 404)
    if (category.padrao) throw new AppError('Categorias padrão não podem ser excluídas', 409)
    if (database.transacoes.some((transaction) => transaction.categoriaId === id)) {
      throw new AppError('Esta categoria está vinculada a transações e não pode ser excluída', 409)
    }
    database.categorias = database.categorias.filter((item) => item.id !== id)
    saveDatabase(database)
  }

  async listarTransacoes(filtros: FiltrosTransacao = {}): Promise<PaginaTransacoes> {
    const database = loadDatabase()
    const page = Math.max(1, filtros.page ?? 1)
    const pageSize = Math.min(100, Math.max(1, filtros.pageSize ?? 20))
    const min = filtros.minValor ? decimalToCents(filtros.minValor) : undefined
    const max = filtros.maxValor ? decimalToCents(filtros.maxValor) : undefined
    const filtered = database.transacoes
      .filter((item) => !filtros.from || item.data >= filtros.from)
      .filter((item) => !filtros.to || item.data <= filtros.to)
      .filter((item) => !filtros.tipo || item.tipo === filtros.tipo)
      .filter((item) => !filtros.categoriaId || item.categoriaId === filtros.categoriaId)
      .filter((item) => min === undefined || decimalToCents(item.valor) >= min)
      .filter((item) => max === undefined || decimalToCents(item.valor) <= max)
      .sort((a, b) => b.data.localeCompare(a.data) || b.id.localeCompare(a.id))
    const start = (page - 1) * pageSize
    return {
      items: filtered.slice(start, start + pageSize).map((item) => enrich(item, database.categorias)),
      total: filtered.length,
      page,
      pageSize,
    }
  }

  async criarTransacao(input: TransacaoInput): Promise<Transacao> {
    const database = loadDatabase()
    const valid = validateTransaction(input, database.categorias)
    const transaction: Transacao = { ...valid, id: crypto.randomUUID() }
    database.transacoes.push(transaction)
    saveDatabase(database)
    return enrich(transaction, database.categorias)
  }

  async atualizarTransacao(id: string, input: TransacaoInput): Promise<Transacao> {
    const database = loadDatabase()
    const index = database.transacoes.findIndex((transaction) => transaction.id === id)
    if (index < 0) throw new AppError('Transação não encontrada', 404)
    const valid = validateTransaction(input, database.categorias)
    const transaction = { ...valid, id }
    database.transacoes[index] = transaction
    saveDatabase(database)
    return enrich(transaction, database.categorias)
  }

  async excluirTransacao(id: string): Promise<void> {
    const database = loadDatabase()
    if (!database.transacoes.some((transaction) => transaction.id === id)) throw new AppError('Transação não encontrada', 404)
    database.transacoes = database.transacoes.filter((transaction) => transaction.id !== id)
    saveDatabase(database)
  }

  async obterResumo(ano: number, mes: number): Promise<ResumoMensal> {
    return summarize(loadDatabase().transacoes, ano, mes)
  }

  async obterPizza(ano: number, mes: number, tipo: TipoTransacao): Promise<FatiaPizza[]> {
    const database = loadDatabase()
    const prefix = `${ano}-${String(mes).padStart(2, '0')}-`
    const totals = new Map<string, number>()
    for (const transaction of database.transacoes) {
      if (transaction.tipo !== tipo || !transaction.data.startsWith(prefix)) continue
      totals.set(transaction.categoriaId, (totals.get(transaction.categoriaId) ?? 0) + decimalToCents(transaction.valor))
    }
    return [...totals.entries()]
      .map(([categoriaId, total]) => {
        const category = database.categorias.find((item) => item.id === categoriaId)
        return { categoriaId, nome: category?.nome ?? 'Sem categoria', cor: category?.cor ?? '#64748B', total: centsToDecimal(total) }
      })
      .sort((a, b) => decimalToCents(b.total) - decimalToCents(a.total))
  }

  async obterEvolucao(meses = 6): Promise<PontoEvolucao[]> {
    const database = loadDatabase()
    const count = Math.min(24, Math.max(1, meses))
    const current = currentMonth()
    return Array.from({ length: count }, (_, index) => {
      const point = shiftMonth(current.ano, current.mes, index - count + 1)
      return summarize(database.transacoes, point.ano, point.mes)
    })
  }

  async obterComparativo(ano: number, mes: number): Promise<Comparativo> {
    const database = loadDatabase()
    const previous = shiftMonth(ano, mes, -1)
    const atual = summarize(database.transacoes, ano, mes)
    const anterior = summarize(database.transacoes, previous.ano, previous.mes)
    return {
      atual,
      anterior,
      variacaoReceitas: centsToDecimal(decimalToCents(atual.totalReceitas) - decimalToCents(anterior.totalReceitas)),
      variacaoDespesas: centsToDecimal(decimalToCents(atual.totalDespesas) - decimalToCents(anterior.totalDespesas)),
      variacaoSaldo: centsToDecimal(decimalToCents(atual.saldo) - decimalToCents(anterior.saldo)),
    }
  }
}

export const financeClient: FinanceClient = new LocalFinanceClient()
